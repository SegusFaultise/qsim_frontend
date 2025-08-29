import React from "react";
import SimulationResults from "./SimulationResults";

function BottomBar({
  simulationResult,
  activeTab,
  onTabClick, // Changed from setActiveTab to onTabClick
  onRunSimulation,
}) {
  const renderTabContent = () => {
    if (!simulationResult) {
      return (
        <div className="run-simulation-prompt">
          <h4>No results to display</h4>
          <p>
            Click the button below to run the simulation for the current
            circuit.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onRunSimulation}>
            <i className="bi bi-play-circle"></i> Run Simulation
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "probabilities":
        return <SimulationResults simulationResult={simulationResult} />;
      case "statistics":
        return (
          <div className="p-4">
            <h4>Statistics View</h4>
            <p>This area will show detailed statistics soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bottom-bar">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "probabilities" ? "active" : ""}`}
            onClick={() => onTabClick("probabilities")}
          >
            Probabilities
            {/* Conditionally render open/close icon */}
            <i
              className={`bi ${activeTab === "probabilities" ? "bi-chevron-up" : "bi-chevron-down"} tab-icon`}
            ></i>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "statistics" ? "active" : ""}`}
            onClick={() => onTabClick("statistics")}
          >
            Statistics
            {/* Conditionally render open/close icon */}
            <i
              className={`bi ${activeTab === "statistics" ? "bi-chevron-up" : "bi-chevron-down"} tab-icon`}
            ></i>
          </button>
        </li>
      </ul>
      {/* The content area is only visible if a tab is active */}
      {activeTab && (
        <div className="bottom-bar-content">{renderTabContent()}</div>
      )}
    </div>
  );
}

export default BottomBar;
