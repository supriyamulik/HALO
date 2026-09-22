/**
 * src/App.jsx
 * ────────────
 * Root router configuration for Nyaya Sahayak.
 *
 * Routes:
 *   /          → redirect to /login
 *   /login     → LoginPage (public)
 *   /dashboard → DashboardPage (protected — requires JWT in localStorage)
 */

import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ResearchPage from "./pages/ResearchPage";
import ResearchResultPage from "./pages/ResearchResultPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import AppShell from "./components/AppShell";
import ClaimVerificationPage from "./pages/ClaimVerificationPage";

export default function App() {
  return (
    <Routes>
      {/* Default: redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/research"
        element={
          <ProtectedRoute>
            <ResearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/research/:queryId"
        element={
          <ProtectedRoute>
            <ResearchResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/research/:queryId/verify"
        element={
          <ProtectedRoute>
            <ClaimVerificationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <AppShell user={null}>
              <PlaceholderPage title="Cases" />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppShell user={null}>
              <PlaceholderPage title="History" />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect unknown paths to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
