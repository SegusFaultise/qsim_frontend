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
import "./LoginPage.css";

// This function handles the API call to the backend for authentication.
const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  // Ensure you have a .env file with VITE_API_BASE_URL=http://localhost:8000
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || "Login failed. Please check your credentials.",
    );
  }
  return response.json();
};

function LoginPage() {
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
      const data = await loginUser(username, password);
      login(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="notation-bg">
        {/* UPDATED: Added many more notations */}
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
              <h1 className="h2 text-light mt-3">QISM</h1>
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
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group
                    className="d-flex justify-content-between mb-3"
                    controlId="formCheckbox"
                  >
                    <Form.Check type="checkbox" label="Remember me" />
                    <a href="#" className="small text-decoration-none">
                      Forgot password?
                    </a>
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="dark" type="submit" disabled={isLoading}>
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
