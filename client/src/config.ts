// Helper function to determine the API URL
function getApiUrl() {
  // If a VITE_API_URL env variable is set, use it (for flexibility in deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using custom backend: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // In production, use relative URLs to avoid CORS issues
  if (import.meta.env.PROD) {
    const relativeApi = '/api';
    console.log(`Using relative API path: ${relativeApi}`);
    return relativeApi;
  }

  // For development, use localhost
  const localApi = 'http://localhost:5000/api';
  console.log(`Using local development API: ${localApi}`);
  return localApi;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Disable mock data since we're using real Vercel backend
  useMockData: false,

  // Enable mock fallback for development only
  enableMockFallback: import.meta.env.DEV
};