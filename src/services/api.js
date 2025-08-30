import { getAuthToken } from "./auth";

const API_BASE_URL = "http://localhost:8000";

/**
 * <summary>
 * A generic wrapper for making authenticated API requests using the Fetch API.
 * It automatically includes the JWT token in the Authorization header.
 * </summary>
 * <param name="endpoint" type="string">The API endpoint to call (e.g., '/api/v1/circuits/').</param>
 * <param name="options" type="object">Standard Fetch API options object (e.g., method, body, headers).</param>
 * <returns type="Promise<object>">A promise that resolves to the JSON response from the API.</returns>
 * <exception cref="Error">Throws an error if the network response is not OK, including details from the API if available.</exception>
 */
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

/**
 * <summary>
 * An object containing methods for interacting with the circuits API endpoints.
 * </summary>
 */
export const circuitsApi = {
  /**
   * <summary>Fetches all circuits belonging to the authenticated user.</summary>
   */
  getUserCircuits: () => apiRequest("/api/v1/circuits/"),

  /**
   * <summary>Fetches a specific circuit by its unique ID.</summary>
   * <param name="circuitId" type="string|number">The ID of the circuit to retrieve.</param>
   */
  getCircuit: (circuitId) => apiRequest(`/api/v1/circuits/${circuitId}`),

  /**
   * <summary>Creates a new circuit with the provided data.</summary>
   * <param name="circuitData" type="object">The data for the new circuit (e.g., name, circuit state).</param>
   */
  createCircuit: (circuitData) =>
    apiRequest("/api/v1/circuits/", {
      method: "POST",
      body: JSON.stringify(circuitData),
    }),

  /**
   * <summary>Updates an existing circuit with new data.</summary>
   * <param name="circuitId" type="string|number">The ID of the circuit to update.</param>
   * <param name="circuitData" type="object">The new data for the circuit.</param>
   */
  updateCircuit: (circuitId, circuitData) =>
    apiRequest(`/api/v1/circuits/${circuitId}`, {
      method: "PUT",
      body: JSON.stringify(circuitData),
    }),
};

/**
 * <summary>
 * An object containing methods for interacting with the simulation API endpoints.
 * </summary>
 */
export const simulationApi = {
  /**
   * <summary>Starts a new simulation for a given circuit.</summary>
   * <param name="circuitId" type="string|number">The ID of the circuit to simulate.</param>
   */
  startSimulation: (circuitId) =>
    apiRequest(`/api/v1/circuits/${circuitId}/simulate`, {
      method: "POST",
    }),

  /**
   * <summary>Retrieves the results of a simulation using its job ID.</summary>
   * <param name="jobId" type="string">The job ID returned from the startSimulation call.</param>
   */
  getSimulationResult: (jobId) => apiRequest(`/api/v1/results/${jobId}`),
};
