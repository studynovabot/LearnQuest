// Helper function to determine the API URL
function getApiUrl() {
  // Check if we have a specific backend URL set
  const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;

  if (import.meta.env.PROD) {
    // In production, use the Render backend URL
    const renderBackendUrl = backendUrl || 'https://learnquest-backend.onrender.com';
    console.log(`Production mode - using backend URL: ${renderBackendUrl}`);
    return renderBackendUrl;
  }

  // In development, use the local API URL
  const devUrl = backendUrl || 'http://localhost:5000';
  console.log(`Development mode - API URL set to: ${devUrl}`);
  return devUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'development',

  // Always use real backend - no mock data
  useMockData: false
};