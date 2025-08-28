import { Button } from "react-bootstrap";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <Button
      variant="outline-secondary"
      onClick={toggleTheme}
      aria-label="Toggle color scheme"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 1050, // Ensure it's above other content
      }}
    >
      {/* Using Bootstrap Icons */}
      <i
        className={
          theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill"
        }
      ></i>
    </Button>
  );
}

export default ThemeToggle;
