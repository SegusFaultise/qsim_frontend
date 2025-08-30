import React from "react";

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
      <div className="glass-modal-content" style={{ maxWidth: "500px" }}>
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
        <div className="glass-modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-outline-danger" onClick={onRunWithoutSave}>
            Run Without Saving
          </button>
          <button className="btn btn-primary" onClick={onSave}>
            <i className="bi bi-save me-2"></i>Save & Run
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavePromptModal;
