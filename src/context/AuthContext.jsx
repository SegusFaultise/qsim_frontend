import { createContext, useState, useEffect, useContext } from "react";

// Create a context for authentication
const AuthContext = createContext(null);

/**
 * Provides authentication state to its children components.
 * It manages the user's token and authentication status.
 */
export const AuthProvider = ({ children }) => {
  // Initialize token from localStorage for session persistence
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));

  // Effect to synchronize the token with localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  // Function to update the token upon successful login
  const login = (newToken) => {
    setToken(newToken);
  };

  // Function to clear the token upon logout
  const logout = () => {
    setToken(null);
  };

  // The value provided to consuming components
  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token, // Boolean flag for easy checking of auth status
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to easily access the authentication context.
 * This avoids the need to import useContext and AuthContext in every component.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
