// Helper function to determine the API URL
function getApiUrl() {
  // If a VITE_API_URL env variable is set, use it (for flexibility in deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using custom backend: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // In development, use the local CORS-fixed server
  if (import.meta.env.DEV) {
    const localUrl = 'http://localhost:5004';
    console.log(`Using local development backend: ${localUrl}`);
    return localUrl;
  }

  // Use Vercel production backend URL (FREE and reliable)
  const prodUrl = 'https://learnquest-backend.vercel.app';
  console.log(`Using Vercel production backend: ${prodUrl}`);
  return prodUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Use mock data when backend is not available (temporary fix for Render deployment issue)
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,

  // Fallback to mock data if backend health check fails
  enableMockFallback: true
};