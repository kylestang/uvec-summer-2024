import { useState, useEffect, useReducer } from "react";
import "./App.css";
import { DrawMsg, Grid, Message, messageSchema, RGB } from "./data";
import { AppGrid } from "./components/Grid";
import { RgbColor, RgbColorPicker } from "react-colorful";

export type ColorPixel = (color: RGB, offset: number) => void;

function gridReducer(state: Grid | null, action: Message): Grid | null {
  switch (action.tag) {
    case "init": {
      const { pixels, height, width } = action;
      return {
        pixels,
        height,
        width,
      };
    }

    case "draw": {
      if (state === null) {
        console.error("draw received while state null!");
        return null;
      }
      const { color, offset } = action;
      const pixels = [...state.pixels];
      pixels[offset] = color;
      return {
        ...state,
        pixels,
      };
    }
  }
}

function App() {
  const [grid, gridDispatch] = useReducer(gridReducer, null);
  const [colorPixel, setColorPixel] = useState<ColorPixel>(() => () => { console.debug("not connected, can't color pixel!") });
  const [colorToPlace, setColorToPlace] = useState<RGB>([255, 0, 0]);

  function convertToPicker(c: RgbColor) {
    setColorToPlace([c.r, c.g, c.b])
  }

  function colorToRGB(): RgbColor {
    return { r: colorToPlace[0], g: colorToPlace[1], b: colorToPlace[2] }
  }

  useEffect(() => {
    let ws = new WebSocket(`ws://${window.location.host}/ws`);
    ws.binaryType = "blob";
    ws.onopen = () => {
      setColorPixel(() => (color: RGB, offset: number) => {
        const msg: DrawMsg = {
          tag: "draw",
          color,
          offset,
        };
        ws.send(JSON.stringify(msg));
      });
    };
    ws.onmessage = (ev) => {
      let { data } = ev;
      if (typeof data != "string") return;
      gridDispatch(messageSchema.parse(JSON.parse(data)));
    };
  }, []);

  return (
    <>
      <div>
        <div className="title"><span className="blue">vike/</span><span className="gold">place</span></div>
        <div className="canvasWrapper">
        <div className="canvas">
          {!grid ? <h1>Loading...</h1> : <AppGrid {...{ ...grid, colorPixel, colorToPlace }} />}
        </div>
        <RgbColorPicker className="colorPicker" color={colorToRGB()} onChange={convertToPicker} />
        </div>
      </div>
    </>
  );
}

export default App;
