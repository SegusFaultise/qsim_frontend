import React from "react";

/**
 * <summary>
 * Displays the current status of the quantum simulation, showing different
 * animations and messages for 'running', 'completed', and 'error' states.
 * </summary>
 * <param name="status" type="string">The current status of the simulation (e.g., 'running', 'completed', 'error').</param>
 * <param name="result" type="object">The result object from the simulation, which might be used in future extensions.</param>
 */
function SimulationStatus({ status, result }) {
  if (!status) return null;

  return (
    <div className={`simulation-status simulation-status--${status}`}>
      {status === "running" && (
        <>
          <div className="quantum-spinner-enhanced">
            <div className="quantum-core"></div>
            <div className="quantum-orbits">
              <div className="orbit orbit-1">
                <div className="quantum-particle p1"></div>
              </div>
              <div className="orbit orbit-2">
                <div className="quantum-particle p2"></div>
              </div>
              <div className="orbit orbit-3">
                <div className="quantum-particle p3"></div>
              </div>
            </div>
            <div className="energy-waves">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
            </div>
          </div>
          <span className="simulation-status__text">
            Quantum simulation in progress...
          </span>
          <p className="simulation-status__subtext">
            Calculating probability distributions
          </p>
        </>
      )}
      {status === "completed" && (
        <>
          <div className="success-animation">
            <i className="bi bi-check-circle-fill"></i>
            <div className="success-particles">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="success-particle"></div>
              ))}
            </div>
          </div>
          <span className="simulation-status__text">Simulation completed!</span>
        </>
      )}
      {status === "error" && (
        <>
          <div className="error-animation">
            <i className="bi bi-exclamation-circle-fill"></i>
            <div className="error-ripple"></div>
          </div>
          <span className="simulation-status__text">Simulation failed</span>
        </>
      )}
    </div>
  );
}

export default SimulationStatus;
