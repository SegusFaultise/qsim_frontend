import React from "react";
import "./MenuContext.css";

/**
 * <summary>
 * Renders a custom context menu at a specified position on the screen.
 * This menu provides actions, such as deleting an item.
 * </summary>
 * <param name="show" type="boolean">If true, the context menu is displayed.</param>
 * <param name="x" type="number">The horizontal coordinate (in pixels) for the menu's top-left corner.</param>
 * <param name="y" type="number">The vertical coordinate (in pixels) for the menu's top-left corner.</param>
 * <param name="onDelete" type="function">Callback function to be executed when the delete option is clicked.</param>
 */
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
