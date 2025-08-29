import React from "react";
import { useDndContext } from "@dnd-kit/core";
import {
  DroppableCell,
  MultiQubitGate,
  SingleQubitGate,
} from "./GateComponents";

function CircuitGrid({
  circuit,
  numQubits,
  numSteps,
  pendingGate,
  onCellClick,
  onContextMenu,
  onGateDoubleClick,
}) {
  const { active } = useDndContext();
  const isToolbarDrag = active?.data.current?.isToolbarGate;

  const multiQubitGates = new Map();
  const renderedMultiGateIds = new Set();

  // Logic to find and prepare multi-qubit gates for rendering
  circuit.forEach((row, q_idx) => {
    row.forEach((gate, c_idx) => {
      if (
        gate &&
        gate.controlCount > 0 &&
        !multiQubitGates.has(gate.instanceId)
      ) {
        const parts = [];
        circuit.forEach((r, q) => {
          if (r[c_idx]?.instanceId === gate.instanceId) {
            parts.push({ qubit: q, role: r[c_idx].role });
          }
        });

        const controlQubits = parts
          .filter((p) => p.role === "control")
          .map((p) => p.qubit);
        const targetQubitPart = parts.find((p) => p.role === "target");

        if (targetQubitPart) {
          const allInvolvedQubits = [...controlQubits, targetQubitPart.qubit];
          const minQubit = Math.min(...allInvolvedQubits);
          const maxQubit = Math.max(...allInvolvedQubits);

          multiQubitGates.set(gate.instanceId, {
            id: gate.instanceId,
            gateType: gate.id,
            columnIndex: c_idx,
            controlQubits: controlQubits,
            targetQubit: targetQubitPart.qubit,
            startRow: minQubit + 1,
            span: maxQubit - minQubit + 1,
          });
        }
      }
    });
  });

  const getPendingStatus = (q_idx, c_idx) => {
    if (!pendingGate || pendingGate.columnIndex !== c_idx) return null;
    if (pendingGate.controlQubits.includes(q_idx)) return "control";
    if (!circuit[q_idx][c_idx]) {
      if (
        pendingGate.controlQubits.length < (pendingGate.gate.controlCount || 1)
      ) {
        return "targetable-control";
      }
      return "targetable-target";
    }
    return null;
  };

  return (
    <div className="circuit-grid-container">
      <div className="qubit-labels">
        {Array.from({ length: numQubits }).map((_, i) => (
          <div key={i} className="qubit-label">
            q<sub>{i}</sub>: |0⟩
          </div>
        ))}
      </div>
      <div className="circuit-render-area">
        <div className="qubit-lines-container">
          {Array.from({ length: numQubits }).map((_, i) => (
            <div key={i} className="qubit-line" />
          ))}
        </div>
        <div
          className="circuit-grid"
          style={{
            gridTemplateColumns: `repeat(${numSteps}, 50px)`,
            gridTemplateRows: `repeat(${numQubits}, 50px)`,
          }}
        >
          {/* Render the full multi-qubit gates */}
          {Array.from(multiQubitGates.values()).map((gate) => {
            renderedMultiGateIds.add(gate.id);
            return (
              <MultiQubitGate
                key={gate.id}
                gate={gate}
                onContextMenu={onContextMenu}
                onDoubleClick={onGateDoubleClick}
              />
            );
          })}
          {/* Render the grid cells and single-qubit gates */}
          {circuit.map((row, q_idx) =>
            row.map((gate, c_idx) => {
              const cellId = `${q_idx}-${c_idx}`;
              // If this cell is part of an already rendered multi-qubit gate, just render an empty droppable cell
              if (gate && renderedMultiGateIds.has(gate.instanceId)) {
                return (
                  <DroppableCell
                    key={cellId}
                    id={cellId}
                    qubitIndex={q_idx}
                    columnIndex={c_idx}
                  />
                );
              }

              const pendingStatus = getPendingStatus(q_idx, c_idx);
              const isAvailable = isToolbarDrag && !gate;

              return (
                <DroppableCell
                  key={cellId}
                  id={cellId}
                  qubitIndex={q_idx}
                  columnIndex={c_idx}
                  pendingStatus={pendingStatus}
                  isAvailable={isAvailable}
                  onClick={() => onCellClick(q_idx, c_idx)}
                >
                  {gate && (
                    <SingleQubitGate
                      gate={{ ...gate, qubitIndex: q_idx, columnIndex: c_idx }}
                      onContextMenu={onContextMenu}
                      onDoubleClick={onGateDoubleClick}
                    />
                  )}
                </DroppableCell>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

export default CircuitGrid;
