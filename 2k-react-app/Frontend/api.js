import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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