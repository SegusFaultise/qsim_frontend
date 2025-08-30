import React from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * <summary>
 * A simple presentational component for displaying a gate, typically used within a DragOverlay.
 * </summary>
 * <param name="name" type="string">The display name of the gate (e.g., 'H').</param>
 * <param name="id" type="string">The unique identifier for the gate type (e.g., 'h').</param>
 */
export function Gate({ name, id }) {
  const gateClass = `gate--${id?.toLowerCase()}`;
  return <div className={`gate ${gateClass}`}>{name}</div>;
}

/**
 * <summary>
 * A draggable gate component intended for use in a sidebar or toolbar.
 * </summary>
 * <param name="gate" type="object">The gate object containing its id and name.</param>
 */
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

/**
 * <summary>
 * Represents a single droppable cell within the main circuit grid. It can contain a gate
 * and displays visual feedback for drag-and-drop operations.
 * </summary>
 * <param name="id" type="string">A unique ID for the droppable area.</param>
 * <param name="qubitIndex" type="number">The row (qubit) index of the cell in the grid.</param>
 * <param name="columnIndex" type="number">The column (step) index of the cell in the grid.</param>
 * <param name="children" type="React.ReactNode">Child elements, typically a SingleQubitGate, to render inside the cell.</param>
 * <param name="pendingStatus" type="string">Visual status for placing a multi-qubit gate (e.g., 'control', 'targetable-target').</param>
 * <param name="isAvailable" type="boolean">Indicates if the cell is a valid drop target for the current drag operation.</param>
 * <param name="onClick" type="function">Callback function executed when the cell is clicked.</param>
 */
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

/**
 * <summary>
 * Renders a multi-qubit gate that spans multiple rows within the circuit grid.
 * </summary>
 * <param name="gate" type="object">The gate data object, including its position, span, and qubit roles.</param>
 * <param name="onContextMenu" type="function">Callback function for handling right-click events on the gate.</param>
 * <param name="onDoubleClick" type="function">Callback function for handling double-click events on the gate.</param>
 */
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

/**
 * <summary>
 * Renders a single-qubit gate within a DroppableCell in the circuit grid.
 * </summary>
 * <param name="gate" type="object">The gate data object, including its type, parameters, and position.</param>
 * <param name="onContextMenu" type="function">Callback function for handling right-click events on the gate.</param>
 * <param name="onDoubleClick" type="function">Callback function for handling double-click events on the gate.</param>
 */
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
