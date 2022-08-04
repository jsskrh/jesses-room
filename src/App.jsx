import { useState } from "react";
import "./App.css";
import Canvas from "./Canvas";
import Page from "./Page";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Canvas />
      <Page />
    </div>
  );
}

export default App;
