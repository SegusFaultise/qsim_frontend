import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { nanoid } from "nanoid";
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./Dashboard.css";

// --- Reusable Components (No changes needed here) ---

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

function GatePlaceholder({ qubitIndex, index }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `placeholder-${qubitIndex}-${index}`,
    data: { isPlaceholder: true, qubitIndex, index },
  });

  return (
    <div
      ref={setNodeRef}
      className={`gate-placeholder ${isOver ? "is-over" : ""}`}
    />
  );
}

function QubitLine({ id, gates, qubitIndex, isDragging }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="qubit-line-container">
      <div className="qubit-label">
        q<sub>{qubitIndex}</sub>: |0⟩
      </div>
      <div className="circuit-lane" ref={setNodeRef}>
        <div className="qubit-line"></div>
        <div className="gate-slots-wrapper">
          {isDragging && (
            <div className="placeholder-layer">
              {Array.from({ length: gates.length + 1 }).map((_, index) => (
                <GatePlaceholder
                  key={index}
                  qubitIndex={qubitIndex}
                  index={index}
                />
              ))}
            </div>
          )}
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
                  data={{
                    qubitIndex: qubitIndex,
                    index: index,
                    gateInfo: gate,
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
function Dashboard({ theme, toggleTheme }) {
  const { logout } = useAuth();
  const [numQubits, setNumQubits] = useState(3);
  const [circuit, setCircuit] = useState(() =>
    Array.from({ length: 3 }, () => []),
  );
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
    setCircuit(Array.from({ length: numQubits }, () => []));
  };

  // --- DEBUGGING LOGS ADDED HERE ---
  const handleDragStart = (event) => {
    console.log("--- 🕵️‍♀️ Drag Start ---");
    const { active } = event;
    console.log("Active item:", active);
    console.log("Active item data:", active.data.current);

    setIsDragging(true);
    const gateData = active.data.current?.isToolbarGate
      ? active.data.current.gateInfo
      : active.data.current?.gateInfo;
    if (gateData) {
      setActiveGate(gateData);
    }
  };

  const handleDragEnd = (event) => {
    console.log("--- 🏁 Drag End ---");
    setIsDragging(false);
    setActiveGate(null);
    const { active, over } = event;

    console.log("Dropped item (active):", JSON.parse(JSON.stringify(active)));
    console.log("Dropped on (over):", JSON.parse(JSON.stringify(over)));

    if (!over) {
      console.log("❌ Drag ended over no valid target. Aborting.");
      return;
    }

    if (over.id === "trash") {
      console.log("🗑️ ACTION: Deleting gate.");
      if (active.data.current?.isToolbarGate) return;
      setCircuit((prev) => {
        const newCircuit = prev.map((line) =>
          line.filter((gate) => gate.instanceId !== active.id),
        );
        console.log("✅ State after DELETING gate:", newCircuit);
        return newCircuit;
      });
      return;
    }

    const isToolbarGate = active.data.current?.isToolbarGate;

    if (isToolbarGate) {
      console.log("➕ ACTION: Adding NEW gate from toolbar.");
      if (!over.data.current?.isPlaceholder) {
        console.log("❌ Dropped on non-placeholder. Aborting add.");
        return;
      }

      const { gateInfo } = active.data.current;
      const { qubitIndex: targetQubitIndex, index: targetIndex } =
        over.data.current;
      console.log(
        `Targeting Qubit Index: ${targetQubitIndex}, Position Index: ${targetIndex}`,
      );

      const newGate = {
        ...gateInfo,
        instanceId: nanoid(),
      };
      console.log("Creating new gate object:", newGate);

      // --- IMMUTABLE UPDATE FIX ---
      setCircuit((prev) => {
        const newCircuit = prev.map((line, index) => {
          if (index !== targetQubitIndex) {
            return line; // Return other lines untouched
          }
          // For the target line, create a new array with the new gate
          const newLine = [...line];
          newLine.splice(targetIndex, 0, newGate);
          return newLine;
        });

        console.log("✅ State after ADDING new gate:", newCircuit);
        return newCircuit;
      });
      return;
    }

    if (active.id === over.id) {
      console.log("↔️ No change in position. Aborting move.");
      return;
    }

    console.log("↔️ ACTION: Moving EXISTING gate in circuit.");
    setCircuit((prev) => {
      // Logic for moving gates remains the same as it was already safe
      const newCircuit = prev.map((line) => [...line]);
      let sourceQubitIndex = -1,
        sourceGateIndex = -1,
        movedGate = null;

      for (let i = 0; i < newCircuit.length; i++) {
        const indexInLine = newCircuit[i].findIndex(
          (g) => g.instanceId === active.id,
        );
        if (indexInLine !== -1) {
          sourceQubitIndex = i;
          sourceGateIndex = indexInLine;
          [movedGate] = newCircuit[i].splice(indexInLine, 1);
          break;
        }
      }

      if (!movedGate) {
        console.error("❌ Could not find the gate to move. Aborting.");
        return prev;
      }
      console.log(
        `Source: Qubit ${sourceQubitIndex}, Index ${sourceGateIndex}`,
      );
      console.log("Moved gate object:", movedGate);

      const { qubitIndex: targetQubitIndex } = over.data.current;
      let targetIndex;
      if (over.data.current.isPlaceholder) {
        targetIndex = over.data.current.index;
      } else {
        const overGateIndex = newCircuit[targetQubitIndex].findIndex(
          (g) => g.instanceId === over.id,
        );
        targetIndex =
          overGateIndex !== -1
            ? overGateIndex
            : newCircuit[targetQubitIndex].length;
      }
      console.log(`Target: Qubit ${targetQubitIndex}, Index ${targetIndex}`);

      if (newCircuit[targetQubitIndex]) {
        newCircuit[targetQubitIndex].splice(targetIndex, 0, movedGate);
      }

      console.log("✅ State after MOVING gate:", newCircuit);
      return newCircuit;
    });
  };

  const trashClasses = `top-bar-button trash-bin ${isOverTrash ? "over" : ""} ${
    isDragging && activeGate && !activeGate.isToolbarGate ? "active" : ""
  }`;

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
                title="Clear Circuit or Drag Gate to Delete"
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

          <main className="main-content">
            <div className="circuit-board">
              {circuit.map((gates, index) => (
                <QubitLine
                  key={`qubit-${index}`}
                  id={`qubit-${index}`}
                  qubitIndex={index}
                  gates={gates}
                  isDragging={isDragging}
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
