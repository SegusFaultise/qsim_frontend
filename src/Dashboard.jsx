import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Navbar,
  Container,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useAuth } from "./context/AuthContext";

function Dashboard() {
  const { token, logout } = useAuth();
  const [circuits, setCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newQubits, setNewQubits] = useState(2);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const fetchCircuits = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/circuits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch your circuits.");
      const data = await response.json();
      setCircuits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCircuits();
  }, [fetchCircuits]);

  const handleCreateCircuit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/circuits/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName, qubits: newQubits, gates: [] }),
        },
      );
      if (!response.ok) throw new Error("Failed to create the circuit.");

      handleClose();
      setNewName("");
      setNewQubits(2);
      fetchCircuits();
    } catch (err) {
      console.error(err);
      // You could add an error state to the modal form here
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home">QISM Dashboard</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Button variant="outline-light" onClick={logout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Quantum Circuit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateCircuit}>
              <Form.Group className="mb-3">
                <Form.Label>Circuit Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Bell State"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Number of Qubits</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="18"
                  value={newQubits}
                  onChange={(e) => setNewQubits(Number(e.target.value))}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Create Circuit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3">My Circuits</h2>
          <Button onClick={handleShow}>New Circuit</Button>
        </div>

        {isLoading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        {!isLoading &&
          !error &&
          (circuits.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {circuits.map((circuit) => (
                <Col key={circuit.id}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{circuit.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {circuit.qubits} qubits
                      </Card.Subtitle>
                      <Button variant="outline-primary" className="mt-auto">
                        Open Simulator
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center p-5 bg-light rounded">
              <h4>No circuits yet!</h4>
              <p>Get started by creating your first quantum circuit.</p>
              <Button onClick={handleShow}>Create First Circuit</Button>
            </div>
          ))}
      </Container>
    </>
  );
}

export default Dashboard;
