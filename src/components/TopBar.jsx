import React from "react";
import ThemeToggle from "../ThemeToggle";

function TopBar({
  currentCircuitName,
  numQubits,
  isDragging,
  isLoading,
  simulationStatus,
  currentCircuitId,
  onRemoveQubit,
  onAddQubit,
  onClearCircuit,
  onRunSimulation,
  onLogout,
  theme,
  toggleTheme,
}) {
  const trashBinClasses = [
    "btn",
    "btn-danger",
    "btn--icon",
    "header__trash-bin",
    isDragging && "header__trash-bin--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className="header">
      <div className="header__section">
        <h4 className="header__circuit-title">{currentCircuitName}</h4>
      </div>
      <div className="header__section">
        <div className="header__qubit-controls">
          <span>Qubits: {numQubits}</span>
          <button
            className="btn btn-secondary btn-sm btn--icon"
            onClick={onRemoveQubit}
            disabled={isLoading || numQubits <= 1}
            title="Remove Qubit"
          >
            <i className="bi bi-dash"></i>
          </button>
          <button
            className="btn btn-secondary btn-sm btn--icon"
            onClick={onAddQubit}
            disabled={isLoading || numQubits >= 8}
            title="Add Qubit"
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
        <button
          className="btn btn-danger"
          onClick={onClearCircuit}
          disabled={isLoading}
        >
          <i className="bi bi-trash"></i>
          <span className="d-none d-md-inline ms-2">Clear</span>
        </button>

        {/* Running Button with Animation */}
        <button
          className={`running-button ${simulationStatus === "running" ? "active" : ""}`}
          onClick={onRunSimulation}
          disabled={
            isLoading || simulationStatus === "running" || !currentCircuitId
          }
        >
          <span className="default">Run Simulation</span>
          <div className="running">
            <div className="outer">
              <div className="body">
                <div className="arm front"></div>
                <div className="arm behind"></div>
                <div className="leg front"></div>
                <div className="leg behind"></div>
              </div>
            </div>
          </div>
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={onLogout}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
}

export default TopBar;
