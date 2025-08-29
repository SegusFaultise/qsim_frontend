import React from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// For the DragOverlay
export function Gate({ name, id }) {
  const gateClass = `gate--${id?.toLowerCase()}`;
  return <div className={`gate ${gateClass}`}>{name}</div>;
}

// For the sidebar
export function DraggableGate({ gate }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbar-${gate.id}`,
    data: { isToolbarGate: true, gateInfo: gate },
  });
  const gateClass = `gate--${gate.id.toLowerCase()}`;
  return (
    <div
      className={`gate gate--toolbar ${gateClass}`}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${gate.name} Gate`}
    >
      {gate.name}
    </div>
  );
}

// For the main grid cells
export function DroppableCell({
  id,
  qubitIndex,
  columnIndex,
  children,
  pendingStatus,
  isAvailable,
  onClick,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      isCell: true,
      qubitIndex,
      columnIndex,
    },
  });
  const { active } = useDndContext();
  const showGhost = isOver && !children && active;

  const classNames = [
    "circuit-grid__cell",
    pendingStatus && `circuit-grid__cell--${pendingStatus}`,
    isAvailable && "circuit-grid__cell--available",
    showGhost &&
      (children
        ? "circuit-grid__cell--invalid-drop"
        : "circuit-grid__cell--valid-drop"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} className={classNames} onClick={onClick}>
      {children}
      {showGhost && (
        <div
          className={`gate gate--ghost gate--${active.data.current.gateInfo.id.toLowerCase()}`}
        />
      )}
    </div>
  );
}

// Renders a complete multi-qubit gate
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
  };

  const gateClass = `gate--${gate.gateType.toLowerCase()}`;

  const getTargetSymbol = () => {
    switch (gate.gateType) {
      case "cnot":
      case "ccnot":
        return "⊕";
      case "swap":
        return "✕";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="multi-qubit-gate"
      onContextMenu={(e) => onContextMenu(e, gate.id)}
    >
      <div className={`multi-qubit-gate__connector ${gateClass}`}></div>
      <div className="multi-qubit-gate__body">
        {Array.from({ length: gate.span }).map((_, i) => {
          const currentQubit = gate.startRow - 1 + i;
          const isControl = gate.controlQubits.includes(currentQubit);
          const isTarget = gate.targetQubit === currentQubit;

          return (
            <div
              key={currentQubit}
              {...(isTarget ? { ...attributes, ...listeners } : {})}
              onDoubleClick={() => onDoubleClick(gate)}
              className={`multi-qubit-gate__part ${
                isTarget ? "multi-qubit-gate__part--target" : ""
              } ${isControl ? "multi-qubit-gate__part--control" : ""}`}
            >
              <div className="gate-symbol">
                {isTarget ? getTargetSymbol() : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Renders a single-qubit gate
export function SingleQubitGate({ gate, onContextMenu, onDoubleClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: gate.instanceId,
    data: { isCircuitGate: true, gateInfo: gate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const gateClass = `gate--${gate.id.toLowerCase()}`;

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
      <div className={`gate gate--circuit ${gateClass}`}>
        {gate.isMeasurement ? (
          <i className="bi bi-speedometer2"></i>
        ) : (
          gateDisplayName
        )}
      </div>
    </div>
  );
}
