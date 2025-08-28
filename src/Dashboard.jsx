import { useState } from "react";
import { Button, Container, Offcanvas } from "react-bootstrap";
import { useAuth } from "./context/AuthContext";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./Dashboard.css";
import ThemeToggle from "./ThemeToggle"; // Assuming you have this component

// A list of available quantum gates
const AVAILABLE_GATES = [
  { id: "h", name: "Hadamard (H)" },
  { id: "x", name: "Pauli-X (X)" },
  { id: "y", name: "Pauli-Y (Y)" },
  { id: "z", name: "Pauli-Z (Z)" },
  { id: "cnot", name: "CNOT" },
  { id: "t", name: "T Gate" },
];

// Sortable component for gates placed on the circuit
function SortableGate({ id, name }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

function Dashboard() {
  const { logout } = useAuth();
  const [circuitGates, setCircuitGates] = useState([]);
  const [showGatePalette, setShowGatePalette] = useState(false);

  const { setNodeRef } = useDroppable({ id: "circuit-board" });

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setCircuitGates((gates) => {
        const oldIndex = gates.findIndex((g) => g.instanceId === active.id);
        const newIndex = gates.findIndex((g) => g.instanceId === over.id);
        return arrayMove(gates, oldIndex, newIndex);
      });
    }
  }

  function handleDragStart(event) {
    // This function is a placeholder for adding gates from the palette
    const { active } = event;
    const newGate = AVAILABLE_GATES.find((g) => g.id === active.id);
    if (newGate && !circuitGates.find((g) => g.id === newGate.id)) {
      setCircuitGates((gates) => [
        ...gates,
        { ...newGate, instanceId: `${newGate.id}-${Date.now()}` },
      ]);
    }
  }

  return (
    <div className="dashboard-layout">
      {/* --- Sidebar Navigation --- */}
      <div className="sidebar">
        <div className="sidebar-logo"></div>
        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() => setShowGatePalette(true)}
          >
            <i className="bi bi-grid-fill"></i>
            <span className="nav-text">Gates</span>
          </button>
          <button className="nav-item">
            <i className="bi bi-gear-fill"></i>
            <span className="nav-text">Config</span>
          </button>
          <button className="nav-item">
            <i className="bi bi-person-circle"></i>
            <span className="nav-text">Account</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <button className="nav-item" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* --- Gate Palette Offcanvas --- */}
      <Offcanvas
        show={showGatePalette}
        onHide={() => setShowGatePalette(false)}
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Quantum Gates</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <DndContext onDragStart={handleDragStart} onDragEnd={() => {}}>
            {AVAILABLE_GATES.map((gate) => (
              <DraggableGate key={gate.id} id={gate.id} name={gate.name} />
            ))}
          </DndContext>
        </Offcanvas.Body>
      </Offcanvas>

      {/* --- Main Content Area --- */}
      <main className="main-content">
        <Container fluid>
          <h2 className="mb-4">Quantum Circuit Editor</h2>
          <DndContext onDragEnd={handleDragEnd}>
            <div className="circuit-board" ref={setNodeRef}>
              <SortableContext items={circuitGates.map((g) => g.instanceId)}>
                {circuitGates.length > 0 ? (
                  circuitGates.map((gate) => (
                    <SortableGate
                      key={gate.instanceId}
                      id={gate.instanceId}
                      name={gate.name}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted">
                    Drag gates from the palette to build your circuit.
                  </p>
                )}
              </SortableContext>
            </div>
          </DndContext>
        </Container>
      </main>
    </div>
  );
}

function DraggableGate({ id, name }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100, // Ensure dragged item is on top
      }
    : undefined;

  return (
    <div
      className="gate-item"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {name}
    </div>
  );
}

export default Dashboard;
