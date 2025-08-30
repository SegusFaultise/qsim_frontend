// SimulationStatus.jsx
import React from "react";

function SimulationStatus({ status, result }) {
  if (!status) return null;

  return (
    <div className={`simulation-status simulation-status--${status}`}>
      {status === "running" && (
        <>
          <div className="quantum-spinner"></div>
          <span className="simulation-status__text">
            Simulation in progress...
          </span>
        </>
      )}
      {status === "completed" && (
        <>
          <i className="bi bi-check-circle-fill text-success"></i>
          <span className="simulation-status__text">Simulation completed!</span>
        </>
      )}
      {status === "error" && (
        <>
          <i className="bi bi-exclamation-circle-fill text-danger"></i>
          <span className="simulation-status__text">Simulation failed</span>
        </>
      )}
    </div>
  );
}

export default SimulationStatus;
