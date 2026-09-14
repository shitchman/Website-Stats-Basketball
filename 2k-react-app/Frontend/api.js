import axios from 'axios'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (import.meta.env.PROD && !configuredApiBaseUrl) {
   throw new Error('VITE_API_BASE_URL must be configured for production');
}

const apiBaseUrl = (configuredApiBaseUrl || 'http://localhost:8000').replace(/\/$/, '');

if (import.meta.env.PROD && new URL(apiBaseUrl).protocol !== 'https:') {
   throw new Error('VITE_API_BASE_URL must use HTTPS in production');
}

const api = axios.create({
   baseURL: apiBaseUrl,
   withCredentials: true,
});

export default api;


// Used to easily make fetch requests to the backend API
export async function apiFetch(endpoint, options = {}) {

   return fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
         'Content-Type': 'application/json',
         ...options.headers,
      }
   });
}