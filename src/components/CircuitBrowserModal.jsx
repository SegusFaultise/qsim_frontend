import React from "react";

/**
 * <summary>
 * A modal dialog for browsing and loading a user's saved quantum circuits.
 * It handles loading states, an empty state if no circuits are found, and lists the available circuits.
 * </summary>
 * <param name="isOpen" type="boolean">Controls whether the modal is visible.</param>
 * <param name="onClose" type="function">Callback function to close the modal.</param>
 * <param name="userCircuits" type="Array<object>">An array of the user's saved circuit objects.</param>
 * <param name="isLoading" type="boolean">If true, a loading spinner is displayed instead of the circuit list.</param>
 * <param name="currentCircuitId" type="string|number">The ID of the currently loaded circuit, used for highlighting.</param>
 * <param name="onLoadCircuit" type="function">Callback function triggered when a user selects a circuit to load.</param>
 */
function CircuitBrowserModal({
  isOpen,
  onClose,
  userCircuits,
  isLoading,
  currentCircuitId,
  onLoadCircuit,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="modal modern-modal show fade d-block"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content modern-modal-content">
            <div className="modal-header modern-modal-header">
              <h5 className="modal-title modern-modal-title">
                <i className="bi bi-lightning-charge-fill me-2"></i>
                My Circuits
              </h5>
              <button
                type="button"
                className="btn-close modern-btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body modern-modal-body">
              {isLoading ? (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border modern-spinner" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : userCircuits.length === 0 ? (
                <div className="text-center py-4 modern-empty-state">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="mt-3 text-muted">No circuits saved yet</p>
                </div>
              ) : (
                <ul className="list-group modern-list-group">
                  {userCircuits.map((c) => (
                    <li
                      key={c.id}
                      className={`list-group-item list-group-item-action modern-list-item ${
                        currentCircuitId === c.id ? "active" : ""
                      }`}
                      onClick={() => {
                        onLoadCircuit(c.id);
                        onClose();
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="bi bi-diagram-3 me-3 modern-circuit-icon"></i>
                        <div className="flex-grow-1">
                          <div className="modern-circuit-name">{c.name}</div>
                          {c.description && (
                            <div className="modern-circuit-desc text-muted">
                              {c.description}
                            </div>
                          )}
                        </div>
                        {currentCircuitId === c.id && (
                          <span className="badge modern-active-badge">
                            Active
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-footer modern-modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary modern-btn-close"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CircuitBrowserModal;
