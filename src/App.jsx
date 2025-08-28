import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import { Container } from "react-bootstrap";

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
