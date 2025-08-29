import React from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function Gate({ name, id, isMulti, span = 1 }) {
  const gateClass = `gate-${id?.toLowerCase()}`;
  const style = isMulti
    ? { height: `calc(${span * 50}px + ${(span - 1) * 10}px)` }
    : {};
  return (
    <div
      className={`gate-item circuit-gate overlay-gate ${gateClass}`}
      style={style}
    >
      {isMulti ? (
        <div className="multi-qubit-gate-body">
          <div className="control-dot" />
          <div className="gate-line" />
          <div className="target-symbol">{id === "cnot" ? "⊕" : "✕"}</div>
        </div>
      ) : (
        name
      )}
    </div>
  );
}

// NEW: Passed the full gate object instead of id/name separately
export function DraggableGate({ gate }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbar-${gate.id}`,
    data: { isToolbarGate: true, gateInfo: gate },
  });
  const gateClass = `gate-${gate.id.toLowerCase()}`;
  return (
    <div
      className={`gate-item toolbar-gate ${gateClass}`}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${gate.name} Gate`}
    >
      {gate.name}
    </div>
  );
}

export function DroppableCell({
  id,
  qubitIndex, // Ensure this prop is accepted
  columnIndex, // Ensure this prop is accepted
  children,
  pendingStatus,
  isAvailable,
  onClick,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    // THIS DATA OBJECT IS THE CRITICAL FIX:
    data: {
      isCell: true,
      qubitIndex,
      columnIndex,
    },
  });
  const { active } = useDndContext();
  const showGhost = isOver && !children && active;
  const classNames = [
    "circuit-cell",
    pendingStatus,
    isAvailable && "available-spot",
    showGhost && (!!children ? "invalid-drop" : "valid-drop"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} className={classNames} onClick={onClick}>
      {children}
      {showGhost && (
        <div
          className={`gate-ghost gate-${active.data.current.gateInfo.id.toLowerCase()}`}
        />
      )}
    </div>
  );
}

// In GateComponents.jsx, replace the MultiQubitGate function
export function MultiQubitGate({ gate, onContextMenu, onDoubleClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: gate.id,
    data: { isCircuitGate: true, gateInfo: gate },
  });

  const style = {
    gridRow: `${gate.startRow} / span ${gate.span}`,
    gridColumn: gate.columnIndex + 1,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 10, // Ensure it's above the line
  };

  const gateClass = `gate-${gate.gateType.toLowerCase()}`;
  const allQubits = [...gate.controlQubits, gate.targetQubit].sort(
    (a, b) => a - b,
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // The class names are now directly on the main container
      className={`multi-qubit-gate-container gate-item ${gateClass}`}
      onContextMenu={(e) => onContextMenu(e, gate.id)}
      onDoubleClick={() => onDoubleClick(gate)}
    >
      <div className="multi-qubit-gate-body-flex">
        {Array.from({ length: gate.span }).map((_, i) => {
          const currentQubit = gate.startRow - 1 + i;
          const isControl = gate.controlQubits.includes(currentQubit);
          const isTarget = gate.targetQubit === currentQubit;
          const isLast = currentQubit === Math.max(...allQubits);
          const isFirst = currentQubit === Math.min(...allQubits);

          return (
            <div key={i} className="multi-qubit-lane">
              <div
                className={`multi-qubit-line ${isFirst ? "first" : ""} ${isLast ? "last" : ""}`}
              />
              {isControl && <div className="control-dot" />}
              {isTarget && (
                <div className="target-symbol">
                  {gate.gateType === "cnot" || gate.gateType === "ccnot"
                    ? "⊕"
                    : "✕"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// Replace the existing SingleQubitGate function with this one
export function SingleQubitGate({ gate, onContextMenu, onDoubleClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: gate.instanceId, // CRITICAL FIX: Use the gate's unique ID, not its position
    data: { isCircuitGate: true, gateInfo: gate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 2,
  };
  const gateClass = `gate-${gate.id.toLowerCase()}`;

  const formatParams = (params) => {
    if (!params) return "";
    if (params.theta !== undefined) {
      return `(${(params.theta / Math.PI).toFixed(2)}π)`;
    }
    return "";
  };

  const gateDisplayName = gate.isParametric
    ? `${gate.name.split("(")[0]}${formatParams(gate.parameters)}`
    : gate.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="gate-container"
      onContextMenu={(e) => onContextMenu(e, gate.instanceId)}
      onDoubleClick={() => onDoubleClick(gate)}
    >
      <div className={`gate-item circuit-gate ${gateClass}`}>
        {gate.isMeasurement ? (
          <i className="bi bi-speedometer2 measurement-icon"></i>
        ) : (
          gateDisplayName
        )}
      </div>
    </div>
  );
}

export function TrashBin({ isDragging }) {
  // ... (No changes needed here)
}
