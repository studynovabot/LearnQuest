export const config = {
  // In production, use the Render backend URL
  apiUrl: import.meta.env.PROD
    ? (import.meta.env.VITE_BACKEND_URL || 'https://learnquest-backend.onrender.com')
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000'),
  environment: import.meta.env.VITE_NODE_ENV || 'development'
};