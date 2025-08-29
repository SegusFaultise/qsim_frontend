import React from "react";
import ThemeToggle from "../ThemeToggle";

function TopBar({
  currentCircuitName,
  numQubits,
  isDragging,
  isLoading,
  currentCircuitId,
  onRemoveQubit,
  onAddQubit,
  onClearCircuit,
  onRunSimulation,
  onLogout,
  theme,
  toggleTheme,
}) {
  return (
    <header className="top-bar">
      <div className="top-bar-section">
        <h4 className="circuit-title">{currentCircuitName}</h4>
      </div>
      <div className="top-bar-section top-bar-right">
        <div className="qubit-controls">
          <span>Qubits: {numQubits}</span>
          <button
            onClick={onRemoveQubit}
            disabled={isLoading || numQubits <= 1}
            title="Remove Qubit"
          >
            <i className="bi bi-dash"></i>
          </button>
          <button
            onClick={onAddQubit}
            disabled={isLoading || numQubits >= 8}
            title="Add Qubit"
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
        <button
          className="top-bar-button danger"
          onClick={onClearCircuit}
          disabled={isLoading}
        >
          <i className="bi bi-trash"></i>
          <span className="text-label">Clear</span>
        </button>
        <button
          className="top-bar-button quantum"
          onClick={onRunSimulation}
          disabled={isLoading || !currentCircuitId}
        >
          <i className="bi bi-play-circle"></i>
          <span className="text-label">Run</span>
        </button>
        <button className="top-bar-button" onClick={onLogout} title="Logout">
          <i className="bi bi-box-arrow-right"></i>
          <span className="text-label">Logout</span>
        </button>
        <div className="theme-toggle-wrapper">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
