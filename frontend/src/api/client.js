/**
 * src/api/client.js
 * ─────────────────
 * Single source of truth for all backend communication.
 * Every component must import from here — never call axios/fetch directly.
 */

import axios from "axios";

// ─── Axios instance ────────────────────────────────────────────────────────

const api = axios.create({
  // Relative URL — in dev, Vite proxies /api/* to http://localhost:8000.
  // In production, deploy the frontend behind the same origin as FastAPI.
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach JWT if present ────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: unwrap errors cleanly ──────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const detail = data?.detail;
    let message = "";

    if (typeof detail === "string" && detail.trim()) {
      message = detail;
    } else if (Array.isArray(detail) && detail.length > 0) {
      message = detail
        .map((item) => {
          if (!item) return "";
          if (typeof item === "string") return item;
          const field = Array.isArray(item.loc)
            ? item.loc.filter((loc) => loc !== "body").join(".")
            : "";
          const msg = item.msg || item.message || JSON.stringify(item);
          return field ? `${field}: ${msg}` : msg;
        })
        .filter(Boolean)
        .join("; ");
    } else if (data?.message && typeof data.message === "string") {
      message = data.message;
    } else if (error?.message && typeof error.message === "string") {
      message = error.message;
    }

    if (!message) {
      message = "Something went wrong, please try again.";
    }

    return Promise.reject(new Error(message));
  }
);

// ─── Auth API functions ────────────────────────────────────────────────────

/**
 * Register a new user account.
 * @param {string} email
 * @param {string} password
 * @param {string} role  – one of LAWYER | RESEARCHER | ADMIN | INSTITUTION_ADMIN
 * @returns {Promise<Object>} created user (without password_hash)
 */
export async function registerUser(email, password, role) {
  const { data } = await api.post("/auth/register", { email, password, role });
  return data;
}

/**
 * Log in and receive an access token.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

/**
 * Fetch the currently authenticated user's profile.
 * Requires a token already stored in localStorage.
 * @returns {Promise<Object>} user profile
 */
export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export default api;
