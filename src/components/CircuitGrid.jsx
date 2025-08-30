import React from "react";
import { useDndContext } from "@dnd-kit/core";
import {
  DroppableCell,
  MultiQubitGate,
  SingleQubitGate,
} from "./GateComponents";

/**
 * <summary>
 * Renders the interactive quantum circuit grid, displaying qubit lines, gates, and handling gate placement logic.
 * This component is responsible for rendering both single and multi-qubit gates and showing placement previews.
 * </summary>
 * <param name="circuit" type="Array<Array<object>>">The 2D array representing the circuit's state, where each element is a gate object or null.</param>
 * <param name="numQubits" type="number">The total number of qubits (rows) in the circuit.</param>
 * <param name="numSteps" type="number">The total number of steps (columns) in the circuit.</param>
 * <param name="pendingGate" type="object">An object representing a multi-qubit gate currently being placed by the user.</param>
 * <param name="onCellClick" type="function">Callback function for when a user clicks on a grid cell.</param>
 * <param name="onContextMenu" type="function">Callback function for when a user right-clicks on a gate.</param>
 * <param name="onGateDoubleClick" type="function">Callback function for when a user double-clicks on a gate.</param>
 */
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
            ...gate,
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
    if (!pendingGate || pendingGate.columnIndex !== c_idx) {
      return null;
    }

    if (pendingGate.controlQubits.includes(q_idx)) {
      return "control";
    }

    if (!circuit[q_idx][c_idx]) {
      const firstControlQubit = pendingGate.controlQubits[0];

      if (q_idx > firstControlQubit) {
        if (
          pendingGate.controlQubits.length <
          (pendingGate.gate.controlCount || 1)
        ) {
          return "targetable-control";
        }
        return "targetable-target";
      }
    }

    return null;
  };

  return (
    <div className="circuit-grid-container">
      <div className="circuit-grid__labels">
        {Array.from({ length: numQubits }).map((_, i) => (
          <div key={i} className="circuit-grid__label">
            q<sub>{i}</sub>: |0⟩
          </div>
        ))}
      </div>
      <div className="circuit-grid__render-area">
        <div className="circuit-grid__lines">
          {Array.from({ length: numQubits }).map((_, i) => (
            <div key={i} className="circuit-grid__line" />
          ))}
        </div>
        <div
          className="circuit-grid"
          style={{
            gridTemplateRows: `repeat(${numQubits}, var(--gate-size))`,
          }}
        >
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
          {circuit.map((row, q_idx) =>
            row.map((gate, c_idx) => {
              const cellId = `${q_idx}-${c_idx}`;
              if (gate && renderedMultiGateIds.has(gate.instanceId)) {
                return (
                  <div
                    key={cellId}
                    className="circuit-grid__cell"
                    style={{ gridRow: q_idx + 1, gridColumn: c_idx + 1 }}
                  >
                    <DroppableCell
                      id={cellId}
                      qubitIndex={q_idx}
                      columnIndex={c_idx}
                    />
                  </div>
                );
              }

              const pendingStatus = getPendingStatus(q_idx, c_idx);
              const isAvailable = isToolbarDrag && !gate;

              return (
                <div
                  key={cellId}
                  className="circuit-grid__cell"
                  style={{ gridRow: q_idx + 1, gridColumn: c_idx + 1 }}
                >
                  <DroppableCell
                    id={cellId}
                    qubitIndex={q_idx}
                    columnIndex={c_idx}
                    pendingStatus={pendingStatus}
                    isAvailable={isAvailable}
                    onClick={() => onCellClick(q_idx, c_idx)}
                  >
                    {gate && (
                      <SingleQubitGate
                        gate={{
                          ...gate,
                          qubitIndex: q_idx,
                          columnIndex: c_idx,
                        }}
                        onContextMenu={onContextMenu}
                        onDoubleClick={onGateDoubleClick}
                      />
                    )}
                  </DroppableCell>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

export default CircuitGrid;
