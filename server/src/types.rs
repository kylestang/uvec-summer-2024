use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, Copy)]
pub struct Pixel(pub u8, pub u8, pub u8);
impl Default for Pixel {
    fn default() -> Self {
        Pixel(0xFF, 0xFF, 0xFF)
    }
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "tag", rename_all = "lowercase")]
pub enum Message {
    Init {
        pixel: Vec<Pixel>,
        height: u32,
        width: u32,
    },
    Draw {
        offset: u32,
        color: Pixel,
    },
}
