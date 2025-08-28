import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./Dashboard.css";

// --- Reusable Components ---

function Gate({ name }) {
  return <div className="gate-item circuit-gate overlay-gate">{name}</div>;
}

function DraggableGate({ id, name }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id,
    data: { isToolbarGate: true, gateInfo: { id, name } },
  });

  return (
    <div
      className="gate-item toolbar-gate"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${name} Gate`}
    >
      {name}
    </div>
  );
}

function SortableGate({ id, name, data }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id, data: data });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      className="gate-item circuit-gate"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {name}
    </div>
  );
}

function QubitLine({ id, gates, qubitIndex }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="qubit-line-container">
      <div className="qubit-label">
        q<sub>{qubitIndex}</sub>: |0⟩
      </div>
      <div className="qubit-line" ref={setNodeRef}>
        <SortableContext
          items={gates.map((g) => g.instanceId)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="gate-slots">
            {gates.map((gate, index) => (
              <SortableGate
                key={gate.instanceId}
                id={gate.instanceId}
                name={gate.name}
                data={{ qubitIndex: qubitIndex, index: index, gateInfo: gate }}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
function Dashboard({ theme, toggleTheme }) {
  const { logout } = useAuth();
  const [numQubits, setNumQubits] = useState(3);
  const [circuit, setCircuit] = useState(Array(3).fill([]));
  const [activeGate, setActiveGate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const { setNodeRef: trashNodeRef, isOver: isOverTrash } = useDroppable({
    id: "trash",
  });

  const AVAILABLE_GATES = [
    { id: "h", name: "H" },
    { id: "x", name: "X" },
    { id: "y", name: "Y" },
    { id: "z", name: "Z" },
    { id: "s", name: "S" },
    { id: "t", name: "T" },
    { id: "cnot", name: "CNOT" },
    { id: "swap", name: "SWAP" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const addQubit = () => {
    if (numQubits < 8) {
      setNumQubits(numQubits + 1);
      setCircuit([...circuit, []]);
    }
  };

  const removeQubit = () => {
    if (numQubits > 1) {
      setNumQubits(numQubits - 1);
      setCircuit(circuit.slice(0, -1));
    }
  };

  const clearCircuit = () => {
    setCircuit(Array(numQubits).fill([]));
  };

  const handleDragStart = (event) => {
    setIsDragging(true);
    const { active } = event;
    const gateData = active.data.current?.isToolbarGate
      ? active.data.current.gateInfo
      : active.data.current?.gateInfo;
    if (gateData) {
      setActiveGate(gateData);
    }
  };

  const handleDragEnd = (event) => {
    setIsDragging(false);
    setActiveGate(null);
    const { active, over } = event;

    // If dropped over the trash can, delete the gate
    if (over?.id === "trash" && !active.data.current?.isToolbarGate) {
      const { qubitIndex, index } = active.data.current;
      setCircuit((prev) => {
        const newCircuit = [...prev];
        newCircuit[qubitIndex].splice(index, 1);
        return newCircuit;
      });
      return;
    }

    if (!over) return;

    const isToolbarGate = active.data.current?.isToolbarGate;

    if (isToolbarGate) {
      const { gateInfo } = active.data.current;
      const targetQubitIndex =
        over.data.current?.qubitIndex ??
        parseInt(String(over.id).split("-")[1]);
      if (isNaN(targetQubitIndex)) return;

      const newGate = {
        ...gateInfo,
        instanceId: `${gateInfo.id}-${Date.now()}`,
      };

      setCircuit((prev) => {
        const newCircuit = [...prev];
        const targetQubitGates = [...newCircuit[targetQubitIndex]];
        const overIndex = over.data.current?.index;
        if (overIndex !== undefined) {
          targetQubitGates.splice(overIndex, 0, newGate);
        } else {
          targetQubitGates.push(newGate);
        }
        newCircuit[targetQubitIndex] = targetQubitGates;
        return newCircuit;
      });
    } else {
      const sourceQubitIndex = active.data.current.qubitIndex;
      const targetQubitIndex =
        over.data.current?.qubitIndex ??
        parseInt(String(over.id).split("-")[1]);
      if (isNaN(targetQubitIndex) || sourceQubitIndex === undefined) return;

      const sourceIndex = active.data.current.index;
      const targetIndex =
        over.data.current?.index ?? circuit[targetQubitIndex].length;

      setCircuit((prev) => {
        const newCircuit = JSON.parse(JSON.stringify(prev));
        if (sourceQubitIndex === targetQubitIndex) {
          if (sourceIndex !== targetIndex) {
            newCircuit[sourceQubitIndex] = arrayMove(
              newCircuit[sourceQubitIndex],
              sourceIndex,
              targetIndex,
            );
          }
        } else {
          const [movedGate] = newCircuit[sourceQubitIndex].splice(
            sourceIndex,
            1,
          );
          newCircuit[targetQubitIndex].splice(targetIndex, 0, movedGate);
        }
        return newCircuit;
      });
    }
  };

  const trashClasses = `top-bar-button trash-bin ${isOverTrash ? "over" : ""} ${isDragging && !activeGate?.isToolbarGate ? "active" : ""}`;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <div className="app-layout">
        <aside className="toolbar">
          <div className="toolbar-header">
            <i className="bi bi-gem app-logo"></i>
            <span className="app-title">Quantum Composer</span>
          </div>
          <div className="toolbar-content">
            <h5 className="toolbar-title">Gates</h5>
            <div className="gate-palette">
              {AVAILABLE_GATES.map((gate) => (
                <DraggableGate key={gate.id} id={gate.id} name={gate.name} />
              ))}
            </div>
          </div>
        </aside>

        <div className="main-container">
          <header className="top-bar">
            <div className="top-bar-section">
              <div className="qubit-controls">
                <span>Qubits: {numQubits}</span>
                <button onClick={addQubit} title="Add Qubit">
                  <i className="bi bi-plus-lg"></i>
                </button>
                <button onClick={removeQubit} title="Remove Qubit">
                  <i className="bi bi-dash-lg"></i>
                </button>
              </div>
            </div>
            <div className="top-bar-section top-bar-right">
              <div className="theme-toggle-wrapper">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
              <button
                ref={trashNodeRef}
                className={trashClasses}
                onClick={clearCircuit}
              >
                <i className="bi bi-trash"></i>
              </button>
              <button className="top-bar-button primary">
                <i className="bi bi-play-fill"></i> Run
              </button>
              <button
                className="top-bar-button"
                onClick={logout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </header>

          <main className={`main-content ${isDragging ? "is-dragging" : ""}`}>
            <div className="circuit-board">
              {circuit.map((gates, index) => (
                <QubitLine
                  key={`qubit-${index}`}
                  id={`qubit-${index}`}
                  qubitIndex={index}
                  gates={gates}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
      <DragOverlay>
        {activeGate ? <Gate name={activeGate.name} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default Dashboard;
