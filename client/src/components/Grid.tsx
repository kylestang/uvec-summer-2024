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
  colorToPlace: RGB
};

type GridSketchProps = SketchProps & GridProps;

const pixelSize = 4;

function makeSketch({ height, width, pixels, colorPixel, colorToPlace }: GridProps) {
  const initPixels = pixels;
  const initColorPixel = colorPixel;
  const initColorToPlace = colorToPlace;

  function sketch(p5: P5CanvasInstance<GridSketchProps>) {
    console.log("sketching...");
    let pixels = initPixels;
    let colorPixel = initColorPixel;
    let colorToPlace = initColorToPlace;
    let hoverOffset: number | null = null;

    let timedOut = false;

    p5.setup = () => {
      p5.frameRate(60);
      p5.createCanvas(width * pixelSize, height * pixelSize);
    };

    p5.updateWithProps = (props) => {
      if (props.pixels) {
        pixels = props.pixels;
      }
      if (props.colorPixel) {
        colorPixel = props.colorPixel;
      }
      if (props.colorToPlace) {
        colorToPlace = props.colorToPlace;
      }
    };

    p5.draw = () => {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let [r, g, b] = pixels[y * width + x];
          p5.fill(r, g, b);
          p5.noStroke();
          const offset = y * width + x;
          if (hoverOffset == offset) {
            p5.stroke(0, 0, 0);
          } else {
            p5.noStroke();
          }
          p5.square(x * pixelSize, y * pixelSize, pixelSize);
        }
      }
    };

    p5.mousePressed = () => {
      if (
        p5.mouseX < 0 ||
        p5.mouseX >= p5.width ||
        p5.mouseY < 0 ||
        p5.mouseY >= p5.height
      ) {
        return;
      }
      const x = Math.floor(p5.mouseX / pixelSize);
      const y = Math.floor(p5.mouseY / pixelSize);
      const offset = y * width + x;

      timedOut = true;
      hoverOffset = null;
      p5.cursor('not-allowed')
      setTimeout(() => {
        timedOut = false;
        p5.noCursor()

        const x = Math.floor(p5.mouseX / pixelSize);
        const y = Math.floor(p5.mouseY / pixelSize);
        const newOffset = y * width + x;
        if (offset === newOffset) {
          hoverOffset = offset
        }
      }, 250);

      colorPixel(colorToPlace, offset); // let the server handle it
    };

    p5.mouseMoved = () => {
      if (
        timedOut ||
        p5.mouseX < 0 ||
        p5.mouseX >= p5.width ||
        p5.mouseY < 0 ||
        p5.mouseY >= p5.height
      ) {
        hoverOffset = null;
        return;
      }
      p5.noCursor()
      console.debug(p5.mouseX, p5.mouseY);
      const x = Math.floor(p5.mouseX / pixelSize);
      const y = Math.floor(p5.mouseY / pixelSize);
      const offset = y * width + x;
      hoverOffset = offset;
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
      colorToPlace={props.colorToPlace}
    />
  );
}
