use image::{imageops::FilterType::*, io::Reader, Rgb, RgbImage};
use rand::seq::SliceRandom;
use rand::thread_rng;
use std::thread;
use std::time::Duration;
use types::WSMessage;
use types::RESOLUTION;
use types::{DrawMessage, Pixel};
use websocket::ClientBuilder;
mod types;

const CLIENT: &str = "ws://localhost:8080/ws";
const IMAGE_PATH: &str = "test/mona.jpg";

fn main() {
    make_image(400, String::from(IMAGE_PATH), 30, 30);
}

fn make_image(location: u32, path: String, width: u32, height: u32) {
    let dynamic_image = Reader::open(path)
        .unwrap()
        .decode()
        .unwrap()
        .resize(width, height, Triangle);

    let rgb_image: RgbImage = dynamic_image.into_rgb8();

    let mut pixels: Vec<(u32, u32, &Rgb<u8>)> = rgb_image.enumerate_pixels().collect();

    let mut rng = thread_rng();
    pixels.shuffle(&mut rng);

    let mut client = ClientBuilder::new(CLIENT)
        .unwrap()
        .connect_insecure()
        .unwrap();

    thread::sleep(Duration::from_millis(500));

    for pixel in pixels {
        println!("YAY");
        let position = location + pixel.0 + pixel.1 * RESOLUTION.0 as u32;

        let message = WSMessage::Draw(DrawMessage {
            offset: position as usize,
            color: Pixel(pixel.2[0], pixel.2[1], pixel.2[2]),
        });

        client
            .send_message(&websocket::Message::text(
                &serde_json::to_string(&message).unwrap(),
            ))
            .unwrap();

        // let sleep_time = rng.gen_range(500..2000);
        let sleep_time = 300;
        thread::sleep(Duration::from_millis(sleep_time));
    }
}