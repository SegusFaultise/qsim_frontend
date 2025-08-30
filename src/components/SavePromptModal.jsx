import React from "react";

/**
 * <summary>
 * A modal dialog that prompts the user to save their circuit before running a simulation
 * if unsaved changes are detected.
 * </summary>
 * <param name="isOpen" type="boolean">Controls whether the modal is visible.</param>
 * <param name="circuitName" type="string">The name of the circuit that has unsaved changes.</param>
 * <param name="onSave" type="function">Callback function executed when the user chooses to save and then run.</param>
 * <param name="onRunWithoutSave" type="function">Callback function executed when the user chooses to run without saving.</param>
 * <param name="onCancel" type="function">Callback function to cancel the operation and close the modal.</param>
 */
function SavePromptModal({
  isOpen,
  circuitName,
  onSave,
  onRunWithoutSave,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-glass">
      <div
        className="glass-modal-content save-prompt-modal"
        style={{ maxWidth: "500px" }}
      >
        <div className="glass-modal-header">
          <h5 className="glass-modal-title">
            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
            Unsaved Circuit
          </h5>
        </div>
        <div className="glass-modal-body p-4">
          <p>
            Your circuit "<strong>{circuitName}</strong>" has unsaved changes.
          </p>
          <p>Would you like to save before running?</p>
        </div>
        <div className="glass-modal-footer save-prompt-footer">
          <div className="save-prompt-buttons">
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={onRunWithoutSave}
            >
              Run Without Saving
            </button>
            <button className="btn btn-primary" onClick={onSave}>
              <i className="bi bi-save me-2"></i>Save & Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavePromptModal;
