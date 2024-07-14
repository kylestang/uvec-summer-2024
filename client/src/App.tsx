import { useEffect, useReducer } from "react";
import "./App.css";
import { Grid, Message } from "./data";
import { AppGrid } from "./components/Grid";

function gridReducer(state: Grid | null, action: Message): Grid | null {
  // console.debug(action)
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

  useEffect(() => {
    const width = 100;
    const height = 100;
    gridDispatch({
      tag: "init",
      pixels: Array.from({ length: width * height }).map(() => [255, 255, 255]),
      width,
      height,
    });

    const theirColor = [0, 255, 0] as const;

    const drawTicker = setInterval(
      () =>
        gridDispatch({
          tag: "draw",
          offset: Math.floor(Math.random() * width * height),
          color: theirColor,
        }),
      1000
    );

    () => {
      clearInterval(drawTicker);
    };
  }, []);

  // useEffect(() => {
  //   console.debug(grid)
  // }, [grid])

  return(
  <>
  <div>
    <div className="title"><span className="blue">vike/</span><span className="gold">place</span></div>
    <div className="canvas">
      {!grid ? <h1>Loading...</h1> : <AppGrid {...grid} />}
    </div>
  </div>
  </>);
}

export default App;
