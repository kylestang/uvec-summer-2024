use serde::{Deserialize, Serialize};

pub const RESOLUTION: (usize, usize) = (100, 100);

#[derive(Debug, Deserialize, Serialize, Clone, Copy)]
pub struct Pixel(pub u8, pub u8, pub u8);
impl Default for Pixel {
    fn default() -> Self {
        Pixel(0xFF, 0xFF, 0xFF)
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct InitMessage {
    pub pixels: Vec<Pixel>,
    pub height: usize,
    pub width: usize,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DrawMessage {
    pub offset: usize,
    pub color: Pixel,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "tag", rename_all = "lowercase")]
pub enum WSMessage {
    Init(InitMessage),
    Draw(DrawMessage),
}
