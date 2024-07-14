FROM rust:latest AS builder-rust
WORKDIR /app
COPY ./server .
RUN cargo build --release

FROM node:latest AS builder-react
WORKDIR /app
COPY ./client .
RUN npm install
RUN npm run build

FROM debian:latest
WORKDIR /app
COPY --from=builder-rust /app/target/release/vikeplace /app/vikeplace
COPY --from=builder-react /app/dist /app/assets
CMD ./vikeplace

