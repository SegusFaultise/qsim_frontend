import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

/**
 * <summary>
 * Provides authentication state and functions to its children components.
 * It manages the user's authentication token for session persistence.
 * </summary>
 * <param name="children" type="React.ReactNode">The child components that will have access to the auth context.</param>
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * <summary>
 * A custom hook for consuming the authentication context.
 * It provides an easy way to access the auth state and functions like login and logout.
 * </summary>
 * <returns type="object">The authentication context value, including the token, auth status, and login/logout functions.</returns>
 * <exception cref="Error">Throws an error if used outside of an AuthProvider.</exception>
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
