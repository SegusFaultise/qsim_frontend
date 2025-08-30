import React from "react";
import "./ThemeToggle.css";

/**
 * <summary>
 * A theme toggle button visually represented as an animated Bloch Sphere.
 * The state vector of the sphere animates to point to |0⟩ or |1⟩,
 * corresponding to the dark and light themes respectively.
 * </summary>
 * <param name="toggleTheme" type="function">The callback function to be executed when the button is clicked to change the theme.</param>
 */
const ThemeToggle = ({ toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label="Toggle color scheme"
    >
      <svg viewBox="-55 -55 110 110" className="theme-icon-svg">
        <circle cx="0" cy="0" r="50" className="sphere-background" />

        <path d="M -50,0 A 50,20 0 1,1 50,0" className="sphere-line" />
        <path
          d="M -50,0 A 50,20 0 1,0 50,0"
          className="sphere-line"
          strokeDasharray="3,3"
        />
        <circle cx="0" cy="0" r="50" className="sphere-line" />

        <line x1="0" y1="-55" x2="0" y2="55" className="sphere-axis" />
        <text x="5" y="-48" className="pole-label">
          |0⟩
        </text>
        <text x="5" y="58" className="pole-label">
          |1⟩
        </text>

        <g className="state-vector">
          <line x1="0" y1="0" x2="0" y2="-45" className="vector-line" />
          <polygon points="0,-50 5,-42 -5,-42" className="vector-arrow" />
        </g>
      </svg>
    </button>
  );
};

export default ThemeToggle;
