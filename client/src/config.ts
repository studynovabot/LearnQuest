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

  // Use Vercel serverless functions (same domain, no CORS issues!)
  const prodUrl = '/api';
  console.log(`Using Vercel serverless functions: ${prodUrl}`);
  return prodUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Disable mock data since we're using real Vercel backend
  useMockData: false,

  // Disable mock fallback since Vercel is reliable
  enableMockFallback: false
};