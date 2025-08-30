import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

/**
 * <summary>
 * The main entry point for the React application.
 * This file is responsible for rendering the root component (`App`) into the DOM.
 * It also wraps the entire application with the `AuthProvider` to make authentication
 * state and functions available to all components. `React.StrictMode` is used
 * to highlight potential problems in the application during development.
 * </summary>
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
