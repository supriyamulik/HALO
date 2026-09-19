/**
 * src/main.jsx
 * ─────────────
 * Application entry point. Wraps everything in BrowserRouter
 * so react-router-dom's <Routes> and <Navigate> work throughout.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
