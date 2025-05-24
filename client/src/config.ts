// Helper function to determine the API URL
function getApiUrl() {
  // If a VITE_API_URL env variable is set, use it (for flexibility in deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using custom backend: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // Check if we're in development or production
  if (import.meta.env.DEV) {
    // In development, try to use local API first, fallback to Vercel
    const localApi = 'http://localhost:5000/api';
    console.log(`Development mode - using local API: ${localApi}`);
    return localApi;
  } else {
    // In production, use the current domain's API endpoints
    const currentDomain = window.location.origin;
    const apiUrl = `${currentDomain}/api`;
    console.log(`Production mode - using same domain API: ${apiUrl}`);
    return apiUrl;
  }
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Disable mock data since we're using real Vercel backend
  useMockData: false,

  // Disable mock fallback since Vercel is reliable
  enableMockFallback: false
};