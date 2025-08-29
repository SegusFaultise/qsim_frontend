import React from "react";
import { DraggableGate } from "./GateComponents";

// NEW: Expanded the list of gates
const AVAILABLE_GATES = [
  { id: "h", name: "H" },
  { id: "x", name: "X" },
  { id: "y", name: "Y" },
  { id: "z", name: "Z" },
  { id: "s", name: "S" },
  { id: "t", name: "T" },
  { id: "rx", name: "Rx(θ)", isParametric: true }, // NEW
  { id: "ry", name: "Ry(θ)", isParametric: true }, // NEW
  { id: "rz", name: "Rz(θ)", isParametric: true }, // NEW
  { id: "cnot", name: "CNOT", controlCount: 1, targetCount: 1 }, // Updated
  { id: "swap", name: "SWAP", controlCount: 1, targetCount: 1 }, // Updated
  { id: "ccnot", name: "CCNOT", controlCount: 2, targetCount: 1 }, // NEW
  { id: "measure", name: "Measure", isMeasurement: true }, // NEW
];

function Toolbar({
  userCircuits,
  isLoading,
  currentCircuitId,
  onLoadCircuit,
  onSaveCircuit,
  onNewCircuit,
}) {
  return (
    <aside className="toolbar">
      <div className="toolbar-header">
        <i className="bi bi-globe app-logo"></i>
        <span className="app-title">qism</span>
      </div>
      <div className="toolbar-content">
        <h5 className="toolbar-title">Gates</h5>
        <div className="gate-palette">
          {AVAILABLE_GATES.map((gate) => (
            <DraggableGate key={gate.id} gate={gate} />
          ))}
        </div>
        <div className="circuit-management">
          <h5 className="toolbar-title">My Circuits</h5>
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : (
            <ul className="list-group circuit-list">
              {userCircuits.map((c) => (
                <li
                  key={c.id}
                  className={`list-group-item list-group-item-action ${
                    currentCircuitId === c.id ? "active" : ""
                  }`}
                  onClick={() => onLoadCircuit(c.id)}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          )}
          <div className="d-grid gap-2 mt-3">
            <button
              className="btn btn-secondary btn-sm"
              onClick={onNewCircuit}
              disabled={isLoading}
            >
              <i className="bi bi-file-earmark-plus"></i> New Circuit
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onSaveCircuit}
              disabled={isLoading}
            >
              <i className="bi bi-save"></i>{" "}
              {currentCircuitId ? "Save" : "Save As..."}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Toolbar;
