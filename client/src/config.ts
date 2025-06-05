// Helper function to determine the API URL
function getApiUrl() {
  // If a VITE_API_URL env variable is set, use it (for flexibility in deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using custom backend: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // In production, use the actual deployed API URL
  if (import.meta.env.PROD) {
    // Use the current origin with /api path
    const origin = window.location.origin;
    const relativeApi = `${origin}/api`;
    console.log(`Using production API path: ${relativeApi}`);
    return relativeApi;
  }

  // For development, always use the full URL with http://localhost:5000/api
  // This ensures we're making requests to the actual dev server
  const localApi = 'http://localhost:5000/api';
  console.log(`Using local development API: ${localApi}`);
  return localApi;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Disable mock data
  useMockData: false,

  // Disable mock fallback
  enableMockFallback: false
};