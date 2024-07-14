import {
  P5CanvasInstance,
  ReactP5Wrapper,
  SketchProps,
} from "@p5-wrapper/react";
import { Grid, RGB } from "../data";
import { useMemo } from "react";
import { ColorPixel } from "../App";

type GridProps = Grid & {
  colorPixel: ColorPixel;
};

type GridSketchProps = SketchProps & GridProps;

const pixelSize = 4;

function makeSketch({ height, width, pixels, colorPixel }: GridProps) {
  const initPixels = pixels;
  const initColorPixel = colorPixel;

  function sketch(p5: P5CanvasInstance<GridSketchProps>) {
    console.log("sketching...");
    let pixels = initPixels;
    let colorPixel = initColorPixel;

    p5.setup = () => {
      p5.frameRate(30);
      p5.createCanvas(width * pixelSize, height * pixelSize);
    };

    p5.updateWithProps = (props) => {
      if (props.pixels) {
        pixels = props.pixels;
      }
      if (props.colorPixel) {
        colorPixel = props.colorPixel;
      }
    };

    p5.draw = () => {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let [r, g, b] = pixels[y * width + x];
          p5.fill(r, b, g);
          p5.noStroke();
          p5.square(x * pixelSize, y * pixelSize, pixelSize);
        }
      }
    };

    let myColor: RGB = [255, 0, 0];
    p5.mouseClicked = () => {
      const x = Math.floor(p5.mouseX / pixelSize);
      const y = Math.floor(p5.mouseY / pixelSize);
      colorPixel(myColor, y * width + x); // let the server handle it
    };
  }
  return sketch;
}

export function AppGrid(props: GridProps) {
  const sketch = useMemo(() => makeSketch(props), []);

  return (
    <ReactP5Wrapper
      sketch={sketch}
      pixels={props.pixels}
      colorPixel={props.colorPixel}
    />
  );
}
