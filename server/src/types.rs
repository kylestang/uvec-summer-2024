use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Pixel(u8, u8, u8);

#[derive(Debug, Deserialize, Serialize)]
pub struct InitMessage {
    tag: String,
    pixels: Vec<Pixel>,
    height: u32,
    width: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DrawMessage {
    tag: String,
    offset: u32,
    color: Pixel,
}
