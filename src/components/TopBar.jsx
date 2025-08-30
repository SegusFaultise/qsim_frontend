import React from "react";

/**
 * <summary>
 * Renders the top application bar, which includes controls for managing the circuit's name,
 * adjusting the number of qubits, and performing primary actions like saving, clearing, and running the simulation.
 * </summary>
 * <param name="currentCircuitName" type="string">The name of the currently active circuit.</param>
 * <param name="isEditingName" type="boolean">If true, displays an input field for editing the circuit name.</param>
 * <param name="onNameEdit" type="function">Callback function to enable the name editing mode.</param>
 * <param name="onNameChange" type="function">Callback function to handle changes in the name input field.</param>
 * <param name="onNameSave" type="function">Callback function to save the new circuit name.</param>
 * <param name="onNameKeyPress" type="function">Callback function for key press events in the name input (e.g., to save on Enter).</param>
 * <param name="nameInputRef" type="React.RefObject">A ref attached to the name input field for focusing.</param>
 * <param name="numQubits" type="number">The current number of qubits in the circuit.</param>
 * <param name="isDragging" type="boolean">If true, indicates that a drag operation is in progress.</param>
 * <param name="isLoading" type="boolean">A general loading state flag to disable controls.</param>
 * <param name="simulationStatus" type="string">The current status of the simulation (e.g., 'running').</param>
 * <param name="currentCircuitId" type="string|number">The ID of the currently loaded circuit.</param>
 * <param name="isCircuitSaved" type="boolean">If true, indicates the circuit is saved in its current state.</param>
 * <param name="hasUnsavedChanges" type="boolean">If true, indicates there are changes that have not been saved.</param>
 * <param name="onRemoveQubit" type="function">Callback to remove the last qubit from the circuit.</param>
 * <param name="onAddQubit" type="function">Callback to add a new qubit to the circuit.</param>
 * <param name="onClearCircuit" type="function">Callback to clear all gates from the circuit.</param>
 * <param name="onRunSimulation" type="function">Callback to start the quantum simulation.</param>
 * <param name="onSaveCircuit" type="function">Callback to save the current state of the circuit.</param>
 * <param name="onLogout" type="function">Callback to log the user out.</param>
 */
function TopBar({
  currentCircuitName,
  isEditingName,
  onNameEdit,
  onNameChange,
  onNameSave,
  onNameKeyPress,
  nameInputRef,
  numQubits,
  isDragging,
  isLoading,
  simulationStatus,
  currentCircuitId,
  isCircuitSaved,
  hasUnsavedChanges,
  onRemoveQubit,
  onAddQubit,
  onClearCircuit,
  onRunSimulation,
  onSaveCircuit,
  onLogout,
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

  const isSaveDisabled = isLoading || (isCircuitSaved && !hasUnsavedChanges);

  const isRunDisabled =
    isLoading || simulationStatus === "running" || numQubits === 0;

  return (
    <header className="header">
      <div className="header__section">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            className="header__circuit-title-input"
            value={currentCircuitName}
            onChange={onNameChange}
            onBlur={onNameSave}
            onKeyPress={onNameKeyPress}
            maxLength={50}
          />
        ) : (
          <div className="header__title-container">
            <h4
              className="header__circuit-title"
              onClick={onNameEdit}
              title="Click to edit name"
            >
              {currentCircuitName}
            </h4>
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={onNameEdit}
              title="Edit circuit name"
            >
              <i className="bi bi-pencil"></i>
            </button>
          </div>
        )}
        {hasUnsavedChanges && (
          <span className="badge bg-warning ms-2" title="Unsaved changes">
            Unsaved
          </span>
        )}
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
          className="btn btn-outline-primary"
          onClick={onSaveCircuit}
          disabled={isSaveDisabled}
          title={isSaveDisabled ? "No changes to save" : "Save Circuit"}
        >
          <i
            className={`bi ${
              isCircuitSaved && !hasUnsavedChanges ? "bi-check" : "bi-save"
            }`}
          ></i>
          <span className="d-none d-md-inline ms-2">
            {isCircuitSaved && !hasUnsavedChanges ? "Saved" : "Save"}
          </span>
        </button>

        <button
          className="btn btn-danger"
          onClick={onClearCircuit}
          disabled={isLoading || numQubits === 0}
        >
          <i className="bi bi-trash"></i>
          <span className="d-none d-md-inline ms-2">Clear</span>
        </button>

        <button
          className={`running-button ${
            simulationStatus === "running" ? "active" : ""
          }`}
          onClick={onRunSimulation}
          disabled={isRunDisabled}
        >
          <span>Run</span>
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
      </div>
    </header>
  );
}

export default TopBar;
