export const config = {
  // In production, use empty string to make API calls relative to the current domain
  apiUrl: import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000'),
  environment: import.meta.env.VITE_NODE_ENV || 'development'
};