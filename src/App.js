// src/App.js
import React from "react";
import "./App.css";
import Canvas from "./component/Canvas";
function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="App-heading">
          -: Prim's Minimal Spanning Tree Algorithm :-
        </h1>
      </header>

      <Canvas />
    </div>
  );
}

export default App;
