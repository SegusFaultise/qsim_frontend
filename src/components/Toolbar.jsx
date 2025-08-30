// Toolbar.jsx
import React from "react";
import { DraggableGate } from "./GateComponents";

// A list of available quantum gates for the toolbar
const AVAILABLE_GATES = [
  { id: "h", name: "H" },
  { id: "x", name: "X" },
  { id: "y", name: "Y" },
  { id: "z", name: "Z" },
  { id: "s", name: "S" },
  { id: "t", name: "T" },
  { id: "rx", name: "Rx(θ)", isParametric: true },
  { id: "ry", name: "Ry(θ)", isParametric: true },
  { id: "rz", name: "Rz(θ)", isParametric: true },
  { id: "cnot", name: "CNOT", controlCount: 1, targetCount: 1 },
  { id: "swap", name: "SWAP", controlCount: 1, targetCount: 1 },
  { id: "ccnot", name: "CCNOT", controlCount: 2, targetCount: 1 },
  { id: "measure", name: "Measure", isMeasurement: true },
];

function Toolbar({ onNewCircuit, onOpenBrowser }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <i className="sidebar__logo">
          <img src="/qism.svg" alt="Bootstrap" />
        </i>
        <span className="sidebar__title">qism</span>
      </div>
      <div className="sidebar__content">
        <h5 className="sidebar__section-title">Gates</h5>
        <div className="sidebar__gate-palette">
          {AVAILABLE_GATES.map((gate) => (
            <DraggableGate key={gate.id} gate={gate} />
          ))}
        </div>
        <div className="circuit-management mt-4">
          <h5 className="sidebar__section-title">My Circuits</h5>
          <div className="d-grid gap-2 mt-3">
            <button className="btn btn-secondary btn-sm" onClick={onNewCircuit}>
              <i className="bi bi-file-earmark-plus"></i> New Circuit
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenBrowser}
            >
              <i className="bi bi-folder2-open"></i> Open Circuit
            </button>
            {/* Save button removed from here */}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Toolbar;
