export const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

if (import.meta.env.MODE === 'production' && API_URL.includes("localhost")) {
  console.warn("⚠️ WARNING: Frontend is running in production mode but connecting to localhost API. Check your deployment environment variables!");
}
