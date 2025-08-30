const AUTH_TOKEN_KEY = "authToken";

/**
 * <summary>Stores the JWT authentication token in local storage.</summary>
 * <param name="token" type="string">The JWT token to store.</param>
 */
export function storeAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * <summary>Retrieves the JWT authentication token from local storage.</summary>
 * <returns type="string|null">The stored JWT token, or null if it doesn't exist.</returns>
 */
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * <summary>Removes the JWT authentication token from local storage.</summary>
 */
export function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * <summary>
 * Authenticates a user with the backend and stores the returned JWT token.
 * </summary>
 * <param name="credentials" type="object">An object containing the user's username and password.</param>
 * <returns type="Promise<object>">A promise that resolves to the API response upon successful login.</returns>
 * <exception cref="Error">Throws an error if the login request fails.</exception>
 */
export async function loginUser(credentials) {
  const formData = new URLSearchParams();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);
  formData.append("grant_type", "password");

  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Login failed");
  }

  const data = await response.json();
  storeAuthToken(data.access_token);
  return data;
}
