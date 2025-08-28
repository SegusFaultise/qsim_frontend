import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import ThemeToggle from "./ThemeToggle";
import { Container } from "react-bootstrap";

function App() {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("qism-theme") || "dark",
  );

  // Effect to apply the theme to the root HTML element
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("qism-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <Container fluid className="p-0">
        {isAuthenticated ? <Dashboard /> : <LoginPage />}
      </Container>
    </>
  );
}

export default App;
