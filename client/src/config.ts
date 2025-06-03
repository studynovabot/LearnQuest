// Helper function to determine the API URL
function getApiUrl() {
  // If a VITE_API_URL env variable is set, use it (for flexibility in deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using custom backend: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }

  // Always use the production Vercel API
  const vercelApi = 'https://studynovaai.vercel.app/api';
  console.log(`Using Vercel production API: ${vercelApi}`);
  return vercelApi;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Disable mock data since we're using real Vercel backend
  useMockData: false,

  // Disable mock fallback since Vercel is reliable
  enableMockFallback: false
};