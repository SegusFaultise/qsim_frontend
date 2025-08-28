import React from "react";
import "./ThemeToggle.css"; // This will be the updated CSS

/**
 * A theme toggle button designed as a Bloch Sphere (qubit) icon.
 * @param {object} props - Component props.
 * @param {function} props.toggleTheme - The function to call when the button is clicked.
 */
const ThemeToggle = ({ toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label="Toggle color scheme"
    >
      <svg viewBox="-55 -55 110 110" className="theme-icon-svg">
        {/* Sphere */}
        <circle cx="0" cy="0" r="50" className="sphere-background" />

        {/* Equator and Meridian lines */}
        <path d="M -50,0 A 50,20 0 1,1 50,0" className="sphere-line" />
        <path
          d="M -50,0 A 50,20 0 1,0 50,0"
          className="sphere-line"
          strokeDasharray="3,3"
        />
        <circle cx="0" cy="0" r="50" className="sphere-line" />

        {/* Z-axis (poles) */}
        <line x1="0" y1="-55" x2="0" y2="55" className="sphere-axis" />
        <text x="5" y="-48" className="pole-label">
          |0⟩
        </text>
        <text x="5" y="58" className="pole-label">
          |1⟩
        </text>

        {/* State Vector (the part that animates) */}
        <g className="state-vector">
          <line x1="0" y1="0" x2="0" y2="-45" className="vector-line" />
          <polygon points="0,-50 5,-42 -5,-42" className="vector-arrow" />
        </g>
      </svg>
    </button>
  );
};

export default ThemeToggle;
