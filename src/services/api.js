import { getAuthToken } from "./auth";

const API_BASE_URL = "http://13.211.161.27:8080";

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Circuits API
export const circuitsApi = {
  // Get all user circuits
  getUserCircuits: () => apiRequest("/api/v1/circuits/"),

  // Get circuit by ID
  getCircuit: (circuitId) => apiRequest(`/api/v1/circuits/${circuitId}`),

  // Create new circuit
  createCircuit: (circuitData) =>
    apiRequest("/api/v1/circuits/", {
      method: "POST",
      body: JSON.stringify(circuitData),
    }),

  // Update circuit
  updateCircuit: (circuitId, circuitData) =>
    apiRequest(`/api/v1/circuits/${circuitId}`, {
      method: "PUT",
      body: JSON.stringify(circuitData),
    }),
};

// Simulation API
export const simulationApi = {
  // Start simulation
  startSimulation: (circuitId) =>
    apiRequest(`/api/v1/circuits/${circuitId}/simulate`, {
      method: "POST",
    }),

  // Get simulation result
  getSimulationResult: (jobId) => apiRequest(`/api/v1/results/${jobId}`),
};
