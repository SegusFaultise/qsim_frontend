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
import SimulationResults from "./components/SimulationResults";
import { Gate } from "./components/GateComponents";
import GateEditModal from "./components/GateEditModal"; // NEW: Import the modal
import BottomBar from "./components/BottomBar"; // Add this import

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

  // NEW: State for the gate edit modal
  const [editingGate, setEditingGate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(null);

  const handleTabClick = (tabName) => {
    // If the clicked tab is already active, collapse the bar. Otherwise, open it.
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
      alert("Failed to load your circuits");
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

      for (let c = 0; c < numSteps; c++) {
        for (let q = 0; q < numQubits; q++) {
          const gate = circuit[q][c];
          if (
            gate &&
            gate.instanceId &&
            !processedInstanceIds.has(gate.instanceId)
          ) {
            processedInstanceIds.add(gate.instanceId);

            // Handle multi-qubit gates
            if (gate.controlCount > 0) {
              const parts = [];
              for (let q2 = 0; q2 < numQubits; q2++) {
                const part = circuit[q2][c];
                if (part?.instanceId === gate.instanceId) {
                  parts.push({ qubit: q2, role: part.role });
                }
              }
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
              // Handle single-qubit gates
              gatesToSave.push({
                gate: gate.id,
                time: c,
                controls: [], // Always include controls list
                targets: [q],
                parameters: gate.parameters || {},
              });
            }
          }
        }
      }

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
      alert("Circuit saved successfully!");
    } catch (error) {
      console.error(
        "Failed to save circuit:",
        error.response?.data || error.message,
      );
      alert("Failed to save circuit");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCircuit = async (circuitId) => {
    try {
      setIsLoading(true);
      const circuitData = await circuitsApi.getCircuit(circuitId);
      const newNumQubits = circuitData.qubits;

      // Determine the number of steps needed
      const maxTime = circuitData.gates.reduce(
        (max, g) => Math.max(max, g.time),
        0,
      );
      const newNumSteps = Math.max(25, maxTime + 15);

      let newCircuit = createEmptyCircuit(newNumQubits, newNumSteps);

      circuitData.gates.forEach((apiGate) => {
        const columnIndex = apiGate.time;
        const instanceId = nanoid();
        const gateInfo = {
          id: apiGate.gate,
          name: apiGate.gate.toUpperCase(), // Basic name
          parameters: apiGate.parameters,
          // You may need to fetch full gate info from a local AVAILABLE_GATES list
        };

        // Place all control parts
        apiGate.controls.forEach((controlQubit) => {
          newCircuit[controlQubit][columnIndex] = {
            ...gateInfo,
            instanceId,
            role: "control",
            controlCount: apiGate.controls.length, // Pass this for rendering logic
          };
        });

        // Place all target parts
        apiGate.targets.forEach((targetQubit) => {
          newCircuit[targetQubit][columnIndex] = {
            ...gateInfo,
            instanceId,
            role: "target",
            controlCount: apiGate.controls.length,
          };
        });
      });

      setNumQubits(newNumQubits);
      setNumSteps(newNumSteps);
      setCircuit(newCircuit);
      setCurrentCircuitId(circuitId);
      setCurrentCircuitName(circuitData.name);
      setSimulationResult(null);
    } catch (error) {
      console.error("Failed to load circuit:", error);
      alert("Failed to load circuit");
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
      alert(
        `Simulation started! Job ID: ${response.job_id}. Results will appear shortly.`,
      );
      setTimeout(() => checkSimulationResult(response.job_id), 3000);
    } catch (error) {
      console.error("Failed to start simulation:", error);
      alert("Failed to start simulation.");
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
      alert("Failed to retrieve simulation results.");
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

  const expandCircuitIfNeeded = (columnIndex) => {
    if (numSteps - columnIndex < 5) {
      const newSteps = numSteps + 10;
      setCircuit((prev) =>
        prev.map((row) => [...row, ...Array(10).fill(null)]),
      );
      setNumSteps(newSteps);
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

  // NEW: Handlers for the gate edit modal
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

  // NEW: Updated cell click logic for multi-control gates
  const handleCellClick = (qubitIndex, columnIndex) => {
    if (!pendingGate || pendingGate.columnIndex !== columnIndex) return;

    const { gate, controlQubits } = pendingGate;
    const isOccupied = circuit[qubitIndex][columnIndex] !== null;
    const isControl = controlQubits.includes(qubitIndex);

    // If we are still selecting controls
    if (controlQubits.length < gate.controlCount) {
      if (isOccupied || isControl) {
        alert("Invalid control: Must be an empty cell on a different qubit.");
        return;
      }
      setPendingGate((prev) => ({
        ...prev,
        controlQubits: [...prev.controlQubits, qubitIndex],
      }));
    } else {
      // We are selecting the target
      if (isOccupied || isControl) {
        alert("Invalid target: Must be an empty cell on a different qubit.");
        return;
      }
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

    // Remove the temporary control dots from the circuit
    setCircuit((prev) => {
      const newCircuit = prev.map((r) => [...r]);
      pendingGate.controlQubits.forEach((q) => {
        // Check to ensure we are removing the correct pending gate
        if (newCircuit[q][pendingGate.columnIndex]?.role === "control") {
          newCircuit[q][pendingGate.columnIndex] = null;
        }
      });
      return newCircuit;
    });

    setPendingGate(null);
  }, [pendingGate]); // Add pendingGate to dependency array

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") cancelPendingGate();
    };
    const handleClickOutside = (e) => {
      if (
        pendingGate &&
        !e.target.closest(".circuit-render-area, .gate-item")
      ) {
        cancelPendingGate();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cancelPendingGate, pendingGate]);

  const handleDragStart = (event) => {
    setIsDragging(true);
    const { active } = event;
    if (
      active.data.current?.isToolbarGate ||
      active.data.current?.isCircuitGate
    ) {
      setActiveGate(active.data.current.gateInfo);
    }
  };

  // NEW: Heavily updated drag end logic
  const handleDragEnd = (event) => {
    setIsDragging(false);
    setActiveGate(null);
    const { active, over } = event;

    if (!active || !over) return;
    if (pendingGate) cancelPendingGate();

    if (over.id === "trash-bin" && active.data.current?.isCircuitGate) {
      handleDelete(
        active.data.current.gateInfo.instanceId ||
          active.data.current.gateInfo.id,
      );
      return;
    }

    if (!over.data.current?.isCell) return;

    const { qubitIndex: targetQubit, columnIndex: targetColumn } =
      over.data.current;
    const gateInfo = active.data.current?.gateInfo;
    const isToolbarGate = active.data.current?.isToolbarGate;

    // --- LOGIC FOR PLACING A NEW GATE FROM THE TOOLBAR ---
    if (isToolbarGate) {
      if (circuit[targetQubit][targetColumn] !== null) {
        alert("Target cell is already occupied.");
        return;
      }

      // Check for expansion before setting state
      if (numSteps - targetColumn < 5) {
        const newSteps = numSteps + 10;
        setCircuit((prev) =>
          prev.map((row) => [...row, ...Array(10).fill(null)]),
        );
        setNumSteps(newSteps);
      }

      const instanceId = nanoid();
      const newGate = { ...gateInfo, instanceId };

      if (newGate.isParametric) {
        setEditingGate(newGate);
        setIsEditModalOpen(true);
        setCircuit((prev) => {
          const newCircuit = prev.map((r) => [...r]);
          newCircuit[targetQubit][targetColumn] = {
            ...newGate,
            parameters: { theta: 0 },
          };
          return newCircuit;
        });
      } else if (newGate.controlCount > 0) {
        setPendingGate({
          gate: newGate,
          controlQubits: [targetQubit],
          columnIndex: targetColumn,
        });
        setCircuit((prev) => {
          const newCircuit = prev.map((r) => [...r]);
          newCircuit[targetQubit][targetColumn] = {
            ...newGate,
            role: "control",
          };
          return newCircuit;
        });
      } else {
        setCircuit((prev) => {
          const newCircuit = prev.map((r) => [...r]);
          newCircuit[targetQubit][targetColumn] = newGate;
          return newCircuit;
        });
      }

      // --- LOGIC FOR MOVING AN EXISTING GATE ON THE CIRCUIT ---
    } else if (active.data.current?.isCircuitGate) {
      const instanceId = gateInfo.instanceId || gateInfo.id;

      setCircuit((prevCircuit) => {
        const sourceParts = [];
        prevCircuit.forEach((row, q) =>
          row.forEach((g, c) => {
            if (g?.instanceId === instanceId)
              sourceParts.push({ q, c, gate: g });
          }),
        );

        if (sourceParts.length === 0) return prevCircuit;

        const sourceControlPart =
          sourceParts.find((p) => p.gate.role === "control") || sourceParts[0];
        const qubitOffset = targetQubit - sourceControlPart.q;
        const columnOffset = targetColumn - sourceControlPart.c;

        let finalCircuit = prevCircuit;
        let currentNumSteps = numSteps;

        // 1. Check if expansion is needed and expand if necessary
        const maxTargetColumn = Math.max(
          ...sourceParts.map((p) => p.c + columnOffset),
        );
        if (currentNumSteps - maxTargetColumn < 5) {
          const newSteps = currentNumSteps + 10;
          finalCircuit = finalCircuit.map((row) => [
            ...row,
            ...Array(10).fill(null),
          ]);
          setNumSteps(newSteps); // Update numSteps state separately
          currentNumSteps = newSteps;
        }

        // 2. Perform validity check on the (potentially expanded) circuit
        let isMoveValid = true;
        for (const part of sourceParts) {
          const newQubit = part.q + qubitOffset;
          const newColumn = part.c + columnOffset;
          if (
            newQubit < 0 ||
            newQubit >= numQubits ||
            newColumn < 0 ||
            newColumn >= currentNumSteps ||
            (finalCircuit[newQubit][newColumn] &&
              finalCircuit[newQubit][newColumn].instanceId !== instanceId)
          ) {
            isMoveValid = false;
            break;
          }
        }

        if (!isMoveValid) {
          alert("Cannot move gate here, path is obstructed or out of bounds.");
          return prevCircuit; // Return original state if move is invalid
        }

        // 3. If valid, perform the move
        const newCircuit = finalCircuit.map((r) => [...r]);
        sourceParts.forEach((p) => {
          newCircuit[p.q][p.c] = null; // Clear old positions
        });
        sourceParts.forEach((part) => {
          const newQubit = part.q + qubitOffset;
          const newColumn = part.c + columnOffset;
          newCircuit[newQubit][newColumn] = part.gate; // Set new positions
        });

        return newCircuit;
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
        onClick={() => setMenuState({ ...menuState, show: false })}
      >
        <Toolbar
          userCircuits={userCircuits}
          isLoading={isLoading}
          currentCircuitId={currentCircuitId}
          onLoadCircuit={loadCircuit}
          onSaveCircuit={saveCircuit}
          onNewCircuit={handleNewCircuit}
        />
        <div
          className={`main-container ${activeTab ? "has-results-open" : ""}`}
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
          {/* The BottomBar is now a permanent part of the layout */}
          <BottomBar
            simulationResult={simulationResult}
            activeTab={activeTab}
            onTabClick={handleTabClick} // Use the new handler
            onRunSimulation={runSimulation}
          />
        </div>
        <DragOverlay>
          {activeGate && (
            <Gate
              name={activeGate.name || activeGate.gateType?.toUpperCase()}
              id={activeGate.id || activeGate.gateType}
              isMulti={!!activeGate.span}
              span={activeGate.span}
            />
          )}
        </DragOverlay>
      </div>
      <ContextMenu
        show={menuState.show}
        x={menuState.x}
        y={menuState.y}
        onDelete={() => {
          handleDelete(menuState.gateId);
          setMenuState({ show: false });
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
