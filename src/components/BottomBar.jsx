import React from "react";
import SimulationResults from "./SimulationResults";
import SimulationStatus from "./SimulationStatus";

function BottomBar({
  simulationResult,
  simulationStatus,
  activeTab,
  onTabClick,
  onRunSimulation,
}) {
  const renderTabContent = () => {
    // Show loading state when simulation is running
    if (simulationStatus === "running") {
      return (
        <>
          <SimulationStatus status={simulationStatus} />
          <div className="simulation-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-text">Processing quantum states...</div>
          </div>
        </>
      );
    }

    if (!simulationResult) {
      return (
        <div className="bottom-bar__prompt">
          <h4>No results to display</h4>
          <p>Run the simulation to see the measurement probabilities.</p>
          <button className="btn btn-primary btn-lg" onClick={onRunSimulation}>
            <i className="bi bi-play-circle me-2"></i> Run Simulation
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
      <div className="bottom-bar__tabs">
        <button
          className={`bottom-bar__tab ${activeTab === "probabilities" ? "bottom-bar__tab--active" : ""}`}
          onClick={() => onTabClick("probabilities")}
        >
          Probabilities
          <i
            className={`bi ${activeTab === "probabilities" ? "bi-chevron-up" : "bi-chevron-down"} ms-2`}
          ></i>
        </button>
        <button
          className={`bottom-bar__tab ${activeTab === "statistics" ? "bottom-bar__tab--active" : ""}`}
          onClick={() => onTabClick("statistics")}
        >
          Statistics
          <i
            className={`bi ${activeTab === "statistics" ? "bi-chevron-up" : "bi-chevron-down"} ms-2`}
          ></i>
        </button>
      </div>
      {activeTab && (
        <div className="bottom-bar__content">{renderTabContent()}</div>
      )}
    </div>
  );
}

export default BottomBar;
