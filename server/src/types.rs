use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, Copy)]
pub struct Pixel(pub u8, pub u8, pub u8);
impl Default for Pixel {
    fn default() -> Self {
        Pixel(0xFF, 0xFF, 0xFF)
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct InitMessage {
    pixel: Vec<Pixel>,
    height: u32,
    width: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DrawMessage {
    offset: u32,
    color: Pixel,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "tag", rename_all = "lowercase")]
pub enum WSMessage {
    Init(InitMessage),
    Draw(DrawMessage),
}
