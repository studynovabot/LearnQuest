export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  environment: import.meta.env.VITE_NODE_ENV || 'development'
}; 