// src/components/ContextMenu.jsx
import React from "react";
import "./MenuContext.css"; // You'll need to create this CSS file

const MenuContext = ({ show, x, y, onDelete }) => {
  if (!show) {
    return null;
  }

  const menuStyle = {
    top: `${y}px`,
    left: `${x}px`,
  };

  return (
    <div className="context-menu" style={menuStyle}>
      <ul className="list-group">
        <li
          className="list-group-item list-group-item-action"
          onClick={onDelete}
        >
          Delete Gate
        </li>
      </ul>
    </div>
  );
};

export default MenuContext;
