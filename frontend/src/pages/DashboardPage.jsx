/**
 * src/pages/DashboardPage.jsx
 * ────────────────────────────
 * Dashboard for Nyaya Sahayak.
 */

import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/client";
import { getResearchHistory } from "../api/researchApi";
import AppShell from "../components/AppShell";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, historyData] = await Promise.all([
          getCurrentUser(),
          getResearchHistory(),
        ]);
        setUser(userData);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <AppShell user={null}>
        <div className="dashboard-page">
          <p>Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  // Fallback if user fails to load for some reason, though ProtectedRoute should handle auth
  const displayName = user?.email ? user.email.split("@")[0] : "User";

  return (
    <AppShell user={user}>
      <div className="dashboard-page">
        <header className="dashboard-header">
          <h1>Welcome back, {displayName}</h1>
          <p>Here's an overview of your recent legal research activity.</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">12</span>
            <span className="stat-label">Active Cases</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">3</span>
            <span className="stat-label">Pending Hearings</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">48</span>
            <span className="stat-label">Research Queries</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">156</span>
            <span className="stat-label">Verified Citations</span>
          </div>
        </section>

        <section className="dashboard-sections">
          <div className="section-panel">
            <h2>Recent Research</h2>
            {history.length > 0 ? (
              <div className="history-list">
                {history.slice(0, 3).map((item) => (
                  <div key={item.query_id} className="list-item">
                    <div className="list-item-title">{item.query_text}</div>
                    <div className="list-item-meta">
                      {new Date(item.date).toLocaleDateString()} • Confidence: {Math.round(item.confidence_score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No recent research found.</div>
            )}
          </div>

          <div className="section-panel">
            <h2>Upcoming Hearings</h2>
            <div className="list-item">
              <div className="list-item-title">State v. Sharma</div>
              <div className="list-item-meta">Tomorrow • High Court • Room 14</div>
            </div>
            <div className="list-item">
              <div className="list-item-title">TechCorp Merger</div>
              <div className="list-item-meta">Oct 12 • Tribunal • Virtual</div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
