/**
 * src/components/ProtectedRoute.jsx
 * ──────────────────────────────────
 * Wraps any route that requires authentication.
 * If no access_token is found in localStorage, redirects to /login.
 */

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
