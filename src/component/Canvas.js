// src/components/Canvas.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Canvas.css";

function Canvas() {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [startNodeId, setStartNodeId] = useState(""); // Starting node ID from input
  const [mstEdges, setMstEdges] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if initial instructions should be shown
  const showInstructions = nodes.length === 0;

  const addNode = (x, y) => {
    setNodes((prevNodes) => [...prevNodes, { x, y, id: prevNodes.length }]);
  };

  const addEdge = (node1, node2) => {
    const weight = Math.floor(Math.random() * 50) + 1;
    setEdges((prevEdges) => [...prevEdges, { node1, node2, weight }]);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(
      (node) => Math.hypot(node.x - x, node.y - y) < 20
    );

    if (clickedNode) {
      if (selectedNode) {
        addEdge(selectedNode, clickedNode);
        setSelectedNode(null);
      } else {
        setSelectedNode(clickedNode);
      }
    } else {
      addNode(x, y);
      setSelectedNode(null);
    }
  };

  const checkConnectivity = () => {
    if (nodes.length === 0) return false;
    const visited = new Set();
    const stack = [nodes[0]];

    while (stack.length > 0) {
      const node = stack.pop();
      visited.add(node);

      edges.forEach(({ node1, node2 }) => {
        if (node === node1 && !visited.has(node2)) stack.push(node2);
        if (node === node2 && !visited.has(node1)) stack.push(node1);
      });
    }

    return visited.size === nodes.length;
  };

  const runPrimsAlgorithm = () => {
    const startNode = nodes.find(
      (node) => node.id === parseInt(startNodeId, 10)
    );

    if (!startNode) {
      setError("Please enter a valid starting node");
      return;
    }

    if (!checkConnectivity()) {
      setError("All nodes must be connected to run Prim's Algorithm");
      return;
    }

    setError("");
    setTotalWeight(0);
    const mstSet = new Set();
    const edgeList = [...edges];
    const mstEdges = [];
    let weightSum = 0;

    mstSet.add(startNode);
    setIsAnimating(true);

    const animateMST = async () => {
      while (mstSet.size < nodes.length) {
        let minEdge = null;

        for (const edge of edgeList) {
          const { node1, node2, weight } = edge;
          if (
            (mstSet.has(node1) && !mstSet.has(node2)) ||
            (mstSet.has(node2) && !mstSet.has(node1))
          ) {
            if (minEdge === null || weight < minEdge.weight) {
              minEdge = edge;
            }
          }
        }

        if (minEdge) {
          mstEdges.push(minEdge);
          mstSet.add(minEdge.node1);
          mstSet.add(minEdge.node2);
          weightSum += minEdge.weight;
          setTotalWeight(weightSum);
          setMstEdges([...mstEdges]);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          break;
        }
      }

      setIsAnimating(false);
    };

    animateMST();
  };

  const resetCanvas = () => {
    setNodes([]);
    setEdges([]);
    setMstEdges([]);
    setStartNodeId(""); // Reset start node ID
    setTotalWeight(0);
    setError("");
    setSelectedNode(null);
  };

  const undoLastNode = () => {
    if (nodes.length === 0) return;
    const lastNode = nodes[nodes.length - 1];
    const updatedEdges = edges.filter(
      (edge) => edge.node1 !== lastNode && edge.node2 !== lastNode
    );
    setNodes((prevNodes) => prevNodes.slice(0, -1));
    setEdges(updatedEdges);
  };

  const draw = useCallback((ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    edges.forEach(({ node1, node2, weight }) => {
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      ctx.lineTo(node2.x, node2.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      const midX = (node1.x + node2.x) / 2;
      const midY = (node1.y + node2.y) / 2;
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText(weight, midX, midY);
    });

    mstEdges.forEach(({ node1, node2 }) => {
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      ctx.lineTo(node2.x, node2.y);
      ctx.strokeStyle = "green";
      ctx.lineWidth = isAnimating ? 5 : 3;
      ctx.stroke();
      ctx.closePath();
    });

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle =
        selectedNode && selectedNode.id === node.id ? "purple" : "black";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText(node.id, node.x - 5, node.y + 5);
      ctx.closePath();
    });
  }, [edges, mstEdges, nodes, selectedNode, isAnimating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    draw(ctx);
  }, [nodes, edges, mstEdges, selectedNode, isAnimating, draw]);

  return (
    <div className="canvas-container">
      <div className="controls">
        <input
          type="number"
          placeholder="Enter start node..."
          value={startNodeId}
          onChange={(e) => setStartNodeId(e.target.value)}
        />
        <button onClick={runPrimsAlgorithm}>Run Prim's Algorithm</button>
        <button onClick={resetCanvas}>Reset</button>
        <button onClick={undoLastNode}>Undo</button>
        {error && <p className="error">{error}</p>}
        <p className="total-weight">Total Weight of MST: {totalWeight}</p>
      </div>
      
      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="overlay-instructions">
          <p>1. Click to plot some points.</p>
          <p>2. Connect two points by clicking on them consecutively.</p>
          <p>3. Run the algorithm</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        style={{ cursor: "crosshair" }}
      ></canvas>
    </div>
  );
}

export default Canvas;
