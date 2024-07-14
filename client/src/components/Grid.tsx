import {
  P5CanvasInstance,
  ReactP5Wrapper,
  SketchProps,
} from "@p5-wrapper/react";
import { Grid, RGB } from "../data";
import { useMemo } from "react";

type GridProps = Grid;

type GridSketchProps = SketchProps & GridProps;

const pixelSize = 4;

function makeSketch({ height, width, pixels }: GridProps) {
  const initPixels = pixels;

  function sketch(p5: P5CanvasInstance<GridSketchProps>) {
    console.log("sketching...")
    let pixels = initPixels;

    p5.setup = () => {
      p5.frameRate(30)
      p5.createCanvas(width * pixelSize, height * pixelSize);
      // p5.background(0, 255, 255);
    }

    p5.updateWithProps = (props) => {
      if (props.pixels) {
        pixels = props.pixels;
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

    let myColor: RGB = [255, 0, 0]
    p5.mouseDragged = () => {
      const x = Math.floor(p5.mouseX / pixelSize)
      const y = Math.floor(p5.mouseY / pixelSize)
      pixels[y*width+x] = myColor
    }
  }
  return sketch;
}

export function AppGrid(props: GridProps) {


  console.debug("rendering appgrid")

  const sketch = useMemo(() => makeSketch(props), []);

  return (
      <ReactP5Wrapper sketch={sketch} pixels={props.pixels} />
  );
}
