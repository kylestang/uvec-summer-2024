import { z } from "zod";

const u8Schema = z.number().int().gte(0).lt(255);

const rgbSchema = z.tuple([u8Schema, u8Schema, u8Schema])
export type RGB = z.infer<typeof rgbSchema>

export type Grid = {
    pixels: RGB[],
    width: number,
    height: number,
}

