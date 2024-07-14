import { useEffect, useReducer, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Grid, Message } from "./data";

function gridReducer(state: Grid | null, action: Message): Grid | null {
  console.debug(action)
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
  const [count, setCount] = useState(0);
  const [grid, gridDispatch] = useReducer(gridReducer, null);

  useEffect(() => {
    const width = 100;
    const height = 100;
    gridDispatch({
      tag: "init",
      pixels: Array.from({length: width * height}).map(() => [255, 255, 255]),
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

  useEffect(() => {
    console.debug(grid)
  }, [grid])

  return (
    <>
      {grid && <div>TODO grid</div>}
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
