use axum::extract::State;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use futures_util::stream::{SplitSink, SplitStream};
use std::sync::Arc;
use std::{net::SocketAddr, path::PathBuf};
use tokio::sync::{
    broadcast::{self, Receiver, Sender},
    Mutex,
};
use tower_http::{
    services::ServeDir,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod types;
use types::WSMessage;
use types::{InitMessage, Pixel};

const RESOLUTION: (usize, usize) = (5, 5);

#[derive(Debug, Clone)]
struct AppState {
    broadcast_tx: Arc<Mutex<Sender<Message>>>,
    #[allow(dead_code)]
    pixels: Arc<Mutex<[Pixel; RESOLUTION.0 * RESOLUTION.1]>>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "vikeplace=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let assets_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("assets");

    let (tx, _) = broadcast::channel(32);
    let app = AppState {
        broadcast_tx: Arc::new(Mutex::new(tx)),
        pixels: Arc::new(Mutex::new([Pixel::default(); RESOLUTION.0 * RESOLUTION.1])),
    };
    let app = Router::new()
        .fallback_service(ServeDir::new(assets_dir).append_index_html_on_directories(true))
        .route("/ws", get(handler))
        .with_state(app)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

async fn handler(ws: WebSocketUpgrade, State(app): State<AppState>) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, app))
}

async fn handle_socket(ws: WebSocket, app: AppState) {
    let (ws_tx, ws_rx) = ws.split();
    let ws_tx = Arc::new(Mutex::new(ws_tx));

    let init_struct = InitMessage {
        pixels: app.pixels.lock().await.to_vec(),
        width: RESOLUTION.0,
        height: RESOLUTION.1,
    };
    let ws_msg_struct = WSMessage::Init(init_struct);
    let init_msg = Message::Text(serde_json::to_string(&ws_msg_struct).unwrap());
    if ws_tx.lock().await.send(init_msg).await.is_err() {
        eprintln!("Failed to broadcast a message");
        return;
    }

    {
        let broadcast_rx = app.broadcast_tx.lock().await.subscribe();
        tokio::spawn(async move {
            recv_broadcast(ws_tx, broadcast_rx).await;
        });
    }

    recv_from_client(ws_rx, app).await;
}

async fn recv_from_client(mut client_rx: SplitStream<WebSocket>, app: AppState) {
    while let Some(Ok(msg)) = client_rx.next().await {
        match msg {
            Message::Close(_) => return,
            Message::Text(ref txt) => match serde_json::from_str::<WSMessage>(&txt) {
                Ok(ws_message) => {
                    if let WSMessage::Draw(update) = ws_message {
                        app.pixels.lock().await[update.offset] = update.color;
                    }
                    if app.broadcast_tx.lock().await.send(msg).is_err() {
                        println!("Failed to broadcast a message");
                    }
                }
                Err(_) => continue,
            },
            _ => continue,
        }
    }
}

async fn handle_message() {}

async fn recv_broadcast(
    client_tx: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    mut broadcast_rx: Receiver<Message>,
) {
    while let Ok(msg) = broadcast_rx.recv().await {
        if client_tx.lock().await.send(msg).await.is_err() {
            return; // disconnected.
        }
    }
}
