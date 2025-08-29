import React, { useState, useEffect } from "react";

function GateEditModal({ gate, isOpen, onClose, onSave }) {
  const [params, setParams] = useState({});

  useEffect(() => {
    if (gate && gate.parameters) {
      setParams(gate.parameters);
    } else {
      setParams({ theta: 0 });
    }
  }, [gate, isOpen]);

  if (!isOpen || !gate) return null;

  const handleParamChange = (paramName, value) => {
    setParams((prev) => ({ ...prev, [paramName]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(gate.instanceId, params);
  };

  const renderInputs = () => {
    if (["rx", "ry", "rz"].includes(gate.id)) {
      return (
        <div className="mb-3">
          <label htmlFor="theta" className="form-label">
            Rotation Angle θ (in radians)
          </label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            id="theta"
            value={params.theta || 0}
            onChange={(e) => handleParamChange("theta", e.target.value)}
            autoFocus
          />
          <div className="form-text">
            Common values: π/2 ≈ 1.57, π ≈ 3.14, 2π ≈ 6.28
          </div>
        </div>
      );
    }
    return <p>This gate has no editable parameters.</p>;
  };

  return (
    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit {gate.name} Gate</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{renderInputs()}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GateEditModal;
