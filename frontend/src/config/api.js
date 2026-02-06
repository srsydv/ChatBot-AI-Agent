/**
 * API base URL for backend.
 * - On Vercel: set VITE_API_URL in Environment Variables (e.g. https://chatbot-ai-agent.onrender.com)
 * - Local dev: leave unset to use same origin (Vite proxy forwards /api to backend)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
