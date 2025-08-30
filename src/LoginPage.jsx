import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "./context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { loginUser } from "./services/auth";
import "./LoginPage.css";

/**
 * <summary>
 * Renders the application's login page, featuring an animated background and a form for user authentication.
 * It manages form state, handles the login API call, and displays loading or error states.
 * </summary>
 * <param name="theme" type="string">The current application theme ('dark' or 'light').</param>
 * <param name="toggleTheme" type="function">A callback function to switch the application theme.</param>
 * <state name="username" type="string">Stores the value of the username input field.</state>
 * <state name="password" type="string">Stores the value of the password input field.</state>
 * <state name="error" type="string">Stores any error message received during the login attempt.</state>
 * <state name="isLoading" type="boolean">A flag to indicate when the login request is in progress.</state>
 */
function LoginPage({ theme, toggleTheme }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await loginUser({ username, password });
      login(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="notation-bg">
        <span>|0⟩</span>
        <span>H</span>
        <span>|ψ⟩</span>
        <span>(|00⟩</span>
        <span>+ |11⟩)/√2</span>
        <span>X</span>
        <span>CNOT</span>
        <span>Z</span>
        <span>(|01⟩</span>
        <span>- |10⟩)/√2</span>
        <span>|1⟩</span>
        <span>Y</span>
        <span>S</span>
        <span>T</span>
        <span>(|10⟩</span>
        <span>+ |01⟩)/√2</span>
        <span>I</span>
        <span>⟨ψ|</span>
        <span>⟨0|</span>
        <span>⟨1|</span>
        <span>H|0⟩</span>
        <span>(|000⟩</span>
        <span>+ |111⟩)/√2</span>
        <span>U</span>
        <span>Tr(ρ)</span>
        <span>ρ²</span>
        <span>√X</span>
        <span>Rz(θ)</span>
        <span>SWAP</span>
        <span>Toffoli</span>
        <span>(|ψ⁺⟩</span>
        <span>⟨ψ⁺|)</span>
        <span>GHZ</span>
        <span>QFT</span>
        <span> Grover's </span>
        <span> Shor's </span>
        <span> Deutsch-Jozsa </span>
        <span> HZH </span>
        <span> [X,Y] </span>
      </div>

      <Container style={{ zIndex: 2 }}>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <div className="text-center mb-4 text-primary">
              <h1 className="h2 text-light mt-3">qism</h1>
              <p className="text-white-50">
                Quantum Information & Simulation Manager
              </p>
            </div>
            <Card
              bg="dark"
              text="light"
              className="shadow-lg"
              style={{ "--bs-bg-opacity": 0.7, backdropFilter: "blur(10px)" }}
            >
              <Card.Body className="p-4">
                <Card.Title className="text-center h4 mb-4">Sign In</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="username..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;
