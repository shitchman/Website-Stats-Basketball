import axios from 'axios'

const api = axios.create({
   baseURL: 'http://localhost:8000',
   withCredentials: true,
});

export default api;


// Used to easily make fetch requests to the backend API
export async function apiFetch(endpoint, options = {}) {

   return fetch(`http://localhost:8000${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
         'Content-Type': 'application/json',
         ...options.headers,
      }
   });
}