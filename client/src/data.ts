import { z } from "zod";

const u8Schema = z.number().int().gte(0).lt(255);

const rgbSchema = z.tuple([u8Schema, u8Schema, u8Schema]).readonly();
export type RGB = z.infer<typeof rgbSchema>;

export type Grid = {
  pixels: RGB[];
  width: number;
  height: number;
};

const initMsgSchema = z.object({
  tag: z.literal("init"),
  pixels: z.array(rgbSchema),
  width: z.number().positive(),
  height: z.number().positive(),
});
export type InitMsg = z.infer<typeof initMsgSchema>;

const drawMsgSchema = z.object({
  tag: z.literal("draw"),
  offset: z.number().nonnegative(),
  color: rgbSchema,
});
export type DrawMsg = z.infer<typeof drawMsgSchema>;

export const messageSchema = z.union([initMsgSchema, drawMsgSchema]);
export type Message = z.infer<typeof messageSchema>;
