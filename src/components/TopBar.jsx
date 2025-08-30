import React from "react";

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

  // Determine if save button should be disabled
  const isSaveDisabled = isLoading || (isCircuitSaved && !hasUnsavedChanges);

  // Determine if run button should be disabled
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
        {/* Add save indicator */}
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

        {/* Save Circuit Button */}
        <button
          className="btn btn-outline-primary"
          onClick={onSaveCircuit}
          disabled={isSaveDisabled}
          title={isSaveDisabled ? "No changes to save" : "Save Circuit"}
        >
          <i
            className={`bi ${isCircuitSaved && !hasUnsavedChanges ? "bi-check" : "bi-save"}`}
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

        {/* Running Button with Animation in Center */}
        <button
          className={`running-button ${simulationStatus === "running" ? "active" : ""}`}
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
