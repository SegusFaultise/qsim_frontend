import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { nanoid } from "nanoid";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import ContextMenu from "./context/MenuContext";
import { circuitsApi, simulationApi } from "./services/api";
import "./Dashboard.css";

import Toolbar from "./components/Toolbar";
import TopBar from "./components/TopBar";
import CircuitGrid from "./components/CircuitGrid";
import { Gate } from "./components/GateComponents";
import GateEditModal from "./components/GateEditModal";
import BottomBar from "./components/BottomBar";

const createEmptyCircuit = (qubits, steps) =>
  Array.from({ length: qubits }, () => Array(steps).fill(null));

function Dashboard({ theme, toggleTheme }) {
  const { logout } = useAuth();
  const [numQubits, setNumQubits] = useState(3);
  const [numSteps, setNumSteps] = useState(25);
  const [circuit, setCircuit] = useState(() => createEmptyCircuit(3, 25));

  const [isDragging, setIsDragging] = useState(false);
  const [activeGate, setActiveGate] = useState(null);
  const [pendingGate, setPendingGate] = useState(null);

  const [menuState, setMenuState] = useState({
    show: false,
    x: 0,
    y: 0,
    gateId: null,
  });
  const [userCircuits, setUserCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentCircuitId, setCurrentCircuitId] = useState(null);
  const [currentCircuitName, setCurrentCircuitName] =
    useState("Untitled Circuit");

  const [editingGate, setEditingGate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const handleTabClick = (tabName) => {
    setActiveTab((prevTab) => (prevTab === tabName ? null : tabName));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const loadUserCircuits = async () => {
    try {
      setIsLoading(true);
      const circuits = await circuitsApi.getUserCircuits();
      setUserCircuits(circuits);
    } catch (error) {
      console.error("Failed to load circuits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserCircuits();
  }, []);

  const saveCircuit = async () => {
    const circuitName = prompt("Enter circuit name:", currentCircuitName);
    if (!circuitName) return;

    try {
      setIsLoading(true);
      const gatesToSave = [];
      const processedInstanceIds = new Set();

      circuit.forEach((row, q) => {
        row.forEach((gate, c) => {
          if (
            gate &&
            gate.instanceId &&
            !processedInstanceIds.has(gate.instanceId)
          ) {
            processedInstanceIds.add(gate.instanceId);

            if (gate.controlCount > 0) {
              const parts = [];
              circuit.forEach((r, q2) => {
                if (r[c]?.instanceId === gate.instanceId) {
                  parts.push({ qubit: q2, role: r[c].role });
                }
              });
              const controlQubits = parts
                .filter((p) => p.role === "control")
                .map((p) => p.qubit);
              const targetQubits = parts
                .filter((p) => p.role === "target")
                .map((p) => p.qubit);

              if (controlQubits.length > 0 && targetQubits.length > 0) {
                gatesToSave.push({
                  gate: gate.id,
                  time: c,
                  controls: controlQubits,
                  targets: targetQubits,
                  parameters: gate.parameters || {},
                });
              }
            } else {
              gatesToSave.push({
                gate: gate.id,
                time: c,
                controls: [],
                targets: [q],
                parameters: gate.parameters || {},
              });
            }
          }
        });
      });

      const circuitData = {
        name: circuitName,
        qubits: numQubits,
        gates: gatesToSave,
      };

      if (currentCircuitId) {
        await circuitsApi.updateCircuit(currentCircuitId, circuitData);
      } else {
        const response = await circuitsApi.createCircuit(circuitData);
        setCurrentCircuitId(response.id);
      }
      setCurrentCircuitName(circuitName);
      await loadUserCircuits();
    } catch (error) {
      console.error(
        "Failed to save circuit:",
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCircuit = async (circuitId) => {
    try {
      setIsLoading(true);
      const circuitData = await circuitsApi.getCircuit(circuitId);
      const { qubits, gates } = circuitData;

      const maxTime = gates.reduce((max, g) => Math.max(max, g.time), 0);
      const newNumSteps = Math.max(25, maxTime + 15);
      let newCircuit = createEmptyCircuit(qubits, newNumSteps);

      gates.forEach((apiGate) => {
        const { time, controls, targets, gate: gateId, parameters } = apiGate;
        const instanceId = nanoid();
        const gateInfo = {
          id: gateId,
          name: gateId.toUpperCase(),
          parameters,
          controlCount: controls.length,
          isParametric: ["rx", "ry", "rz"].includes(gateId),
        };

        controls.forEach((controlQubit) => {
          newCircuit[controlQubit][time] = {
            ...gateInfo,
            instanceId,
            role: "control",
          };
        });
        targets.forEach((targetQubit) => {
          newCircuit[targetQubit][time] = {
            ...gateInfo,
            instanceId,
            role: "target",
          };
        });
      });

      setNumQubits(qubits);
      setNumSteps(newNumSteps);
      setCircuit(newCircuit);
      setCurrentCircuitId(circuitId);
      setCurrentCircuitName(circuitData.name);
      setSimulationResult(null);
    } catch (error) {
      console.error("Failed to load circuit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!currentCircuitId) {
      alert("Please save your circuit before simulating.");
      return;
    }
    try {
      setIsLoading(true);
      setSimulationResult(null);
      const response = await simulationApi.startSimulation(currentCircuitId);
      setTimeout(() => checkSimulationResult(response.job_id), 3000);
    } catch (error) {
      console.error("Failed to start simulation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSimulationResult = async (jobId) => {
    try {
      const result = await simulationApi.getSimulationResult(jobId);
      if (result.status === "completed") {
        setSimulationResult(result.results);
      } else if (result.status === "pending" || result.status === "running") {
        setTimeout(() => checkSimulationResult(jobId), 2000);
      } else {
        throw new Error(`Simulation failed with status: ${result.status}`);
      }
    } catch (error) {
      console.error("Failed to get simulation result:", error);
    }
  };

  const handleNewCircuit = () => {
    const defaultQubits = 3;
    const defaultSteps = 25;
    setNumQubits(defaultQubits);
    setNumSteps(defaultSteps);
    setCircuit(createEmptyCircuit(defaultQubits, defaultSteps));
    setCurrentCircuitId(null);
    setCurrentCircuitName("Untitled Circuit");
    setSimulationResult(null);
    setPendingGate(null);
    setEditingGate(null);
  };

  const clearCircuit = () => {
    setCircuit(createEmptyCircuit(numQubits, numSteps));
    setPendingGate(null);
  };

  const addQubit = () => {
    if (numQubits < 8) {
      setCircuit((prev) => [...prev, Array(numSteps).fill(null)]);
      setNumQubits(numQubits + 1);
    }
  };

  const removeQubit = () => {
    if (numQubits > 1) {
      if (pendingGate && pendingGate.controlQubit === numQubits - 1) {
        cancelPendingGate();
      }
      setCircuit((prev) => prev.slice(0, -1));
      setNumQubits(numQubits - 1);
    }
  };

  const handleContextMenu = (event, gateId) => {
    event.preventDefault();
    setMenuState({ show: true, x: event.clientX, y: event.clientY, gateId });
  };

  const handleDelete = (instanceId) => {
    if (!instanceId) return;
    setCircuit((prev) =>
      prev.map((row) =>
        row.map((cell) => (cell?.instanceId === instanceId ? null : cell)),
      ),
    );
  };

  const handleGateDoubleClick = (gate) => {
    if (gate.isParametric) {
      setEditingGate(gate);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateGateParameters = (instanceId, newParams) => {
    setCircuit((prev) =>
      prev.map((row) =>
        row.map((cell) => {
          if (cell?.instanceId === instanceId) {
            return { ...cell, parameters: newParams };
          }
          return cell;
        }),
      ),
    );
    setIsEditModalOpen(false);
    setEditingGate(null);
  };

  const handleCellClick = (qubitIndex, columnIndex) => {
    if (!pendingGate || pendingGate.columnIndex !== columnIndex) return;

    const { gate, controlQubits } = pendingGate;
    const isOccupied = circuit[qubitIndex][columnIndex] !== null;
    const isControl = controlQubits.includes(qubitIndex);

    if (controlQubits.length < gate.controlCount) {
      if (isOccupied || isControl) return;
      setPendingGate((prev) => ({
        ...prev,
        controlQubits: [...prev.controlQubits, qubitIndex],
      }));
    } else {
      if (isOccupied || isControl) return;
      const instanceId = nanoid();
      setCircuit((prev) => {
        const newCircuit = prev.map((r) => [...r]);
        // Place controls
        controlQubits.forEach((q) => {
          newCircuit[q][columnIndex] = { ...gate, instanceId, role: "control" };
        });
        // Place target
        newCircuit[qubitIndex][columnIndex] = {
          ...gate,
          instanceId,
          role: "target",
        };
        return newCircuit;
      });
      setPendingGate(null);
    }
  };

  const cancelPendingGate = useCallback(() => {
    if (!pendingGate) return;
    setCircuit((prev) => {
      const newCircuit = prev.map((r) => [...r]);
      pendingGate.controlQubits.forEach((q) => {
        if (newCircuit[q][pendingGate.columnIndex]?.role === "control") {
          newCircuit[q][pendingGate.columnIndex] = null;
        }
      });
      return newCircuit;
    });
    setPendingGate(null);
  }, [pendingGate, circuit]);

  useEffect(() => {
    const handleKeyPress = (e) => e.key === "Escape" && cancelPendingGate();
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [cancelPendingGate]);

  const handleDragStart = (event) => {
    setIsDragging(true);
    if (event.active.data.current?.gateInfo) {
      setActiveGate(event.active.data.current.gateInfo);
    }
  };

  const handleDragEnd = (event) => {
    setIsDragging(false);
    setActiveGate(null);
    const { active, over } = event;

    if (!active || !over) return;
    if (pendingGate) cancelPendingGate();

    if (over.id === "trash-bin" && active.data.current?.isCircuitGate) {
      handleDelete(active.data.current.gateInfo.instanceId);
      return;
    }

    if (!over.data.current?.isCell) return;

    const { qubitIndex: targetQubit, columnIndex: targetColumn } =
      over.data.current;
    const gateInfo = active.data.current.gateInfo;

    const expandCircuitIfNeeded = (col) => {
      if (numSteps - col < 5) {
        const newSteps = numSteps + 10;
        setCircuit((prev) =>
          prev.map((row) => [...row, ...Array(10).fill(null)]),
        );
        setNumSteps(newSteps);
      }
    };

    if (active.data.current.isToolbarGate) {
      if (circuit[targetQubit][targetColumn]) return;
      expandCircuitIfNeeded(targetColumn);

      const instanceId = nanoid();
      const newGate = { ...gateInfo, instanceId };

      if (newGate.isParametric) {
        setEditingGate({ ...newGate, parameters: { theta: 0 } });
        setIsEditModalOpen(true);
        setCircuit((prev) => {
          const next = prev.map((r) => [...r]);
          next[targetQubit][targetColumn] = {
            ...newGate,
            parameters: { theta: 0 },
          };
          return next;
        });
      } else if (newGate.controlCount > 0) {
        setPendingGate({
          gate: newGate,
          controlQubits: [targetQubit],
          columnIndex: targetColumn,
        });
        setCircuit((prev) => {
          const next = prev.map((r) => [...r]);
          next[targetQubit][targetColumn] = { ...newGate, role: "control" };
          return next;
        });
      } else {
        setCircuit((prev) => {
          const next = prev.map((r) => [...r]);
          next[targetQubit][targetColumn] = newGate;
          return next;
        });
      }
    } else if (active.data.current.isCircuitGate) {
      const { instanceId } = gateInfo;
      setCircuit((prev) => {
        const sourceParts = [];
        prev.forEach((row, q) =>
          row.forEach((g, c) => {
            if (g?.instanceId === instanceId)
              sourceParts.push({ q, c, gate: g });
          }),
        );

        if (!sourceParts.length) return prev;

        const sourceControl =
          sourceParts.find((p) => p.gate.role === "control") || sourceParts[0];
        const qOffset = targetQubit - sourceControl.q;
        const cOffset = targetColumn - sourceControl.c;

        const newPositions = sourceParts.map((p) => ({
          q: p.q + qOffset,
          c: p.c + cOffset,
        }));

        const maxCol = Math.max(...newPositions.map((p) => p.c));
        if (numSteps - maxCol < 5) expandCircuitIfNeeded(maxCol);

        const isValidMove = newPositions.every(
          ({ q, c }) =>
            q >= 0 &&
            q < numQubits &&
            c >= 0 &&
            c < numSteps &&
            (!prev[q][c] || prev[q][c].instanceId === instanceId),
        );

        if (!isValidMove) return prev;

        const next = prev.map((r) => [...r]);
        sourceParts.forEach(({ q, c }) => {
          next[q][c] = null;
        });
        sourceParts.forEach(({ gate }, i) => {
          const { q, c } = newPositions[i];
          next[q][c] = gate;
        });

        return next;
      });
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div
        className="app-layout"
        onClick={() =>
          menuState.show && setMenuState({ ...menuState, show: false })
        }
      >
        <div className="animated-background">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        <Toolbar
          userCircuits={userCircuits}
          isLoading={isLoading}
          currentCircuitId={currentCircuitId}
          onLoadCircuit={loadCircuit}
          onSaveCircuit={saveCircuit}
          onNewCircuit={handleNewCircuit}
        />

        <div
          className={`main-container ${activeTab ? "main-container--results-open" : ""}`}
        >
          <TopBar
            currentCircuitName={currentCircuitName}
            numQubits={numQubits}
            isDragging={isDragging}
            isLoading={isLoading}
            currentCircuitId={currentCircuitId}
            onRemoveQubit={removeQubit}
            onAddQubit={addQubit}
            onClearCircuit={clearCircuit}
            onRunSimulation={runSimulation}
            onLogout={logout}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main className="main-content">
            <CircuitGrid
              circuit={circuit}
              numQubits={numQubits}
              numSteps={numSteps}
              pendingGate={pendingGate}
              onCellClick={handleCellClick}
              onContextMenu={handleContextMenu}
              onGateDoubleClick={handleGateDoubleClick}
            />
          </main>
          <BottomBar
            simulationResult={simulationResult}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onRunSimulation={runSimulation}
          />
        </div>

        <DragOverlay>
          {activeGate && <Gate name={activeGate.name} id={activeGate.id} />}
        </DragOverlay>
      </div>

      <ContextMenu
        show={menuState.show}
        x={menuState.x}
        y={menuState.y}
        onDelete={() => {
          handleDelete(menuState.gateId);
          setMenuState({ ...menuState, show: false });
        }}
      />

      <GateEditModal
        isOpen={isEditModalOpen}
        gate={editingGate}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateGateParameters}
      />
    </DndContext>
  );
}

export default Dashboard;
