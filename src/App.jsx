import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import { Container } from "react-bootstrap";

/**
 * <summary>
 * The root component of the application. It serves as the main entry point and handles
 * top-level state management, including theme switching (dark/light) and conditional
 * rendering of the LoginPage or Dashboard based on authentication status.
 * </summary>
 * <state name="theme" type="string">Manages the current theme ('dark' or 'light') and persists it to local storage.</state>
 */
function App() {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("qism-theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("qism-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Container fluid className="p-0">
      {isAuthenticated ? (
        <Dashboard theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <LoginPage theme={theme} toggleTheme={toggleTheme} />
      )}
    </Container>
  );
}

export default App;
