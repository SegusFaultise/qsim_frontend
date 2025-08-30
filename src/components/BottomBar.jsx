import React from "react";
import SimulationResults from "./SimulationResults";

function BottomBar({
  simulationResult,
  simulationStatus,
  activeTab,
  onTabClick,
  onRunSimulation,
}) {
  const renderTabContent = () => {
    // Show loading state when simulation is running in probabilities tab
    if (simulationStatus === "running" && activeTab === "probabilities") {
      return (
        <div className="progress-status">
          <div className="simulation-status__text">
            Processing Quantum Circuit
          </div>
          <div className="simulation-status__subtext">
            Calculating probabilities...
          </div>

          {/* Glowing progress dots */}
          <div className="progress-dots">
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
          </div>
        </div>
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

  // Determine if we should show the processing glow effect
  const showProcessingGlow = simulationStatus === "running";

  return (
    <div
      className={`bottom-bar ${showProcessingGlow ? "bottom-bar--processing bottom-bar--results" : ""}`}
    >
      {/* Processing border animation - only visible when processing */}
      {showProcessingGlow && (
        <>
          <div className="glow-top"></div>
          <div className="glow-bottom"></div>
          <div className="glow-right"></div>
          <div className="glow-left"></div>
        </>
      )}

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
