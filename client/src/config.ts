// Helper function to determine the API URL
function getApiUrl() {
  // Use the correct production backend URL
  const prodUrl = 'https://learnquest.onrender.com';
  // If a VITE_API_URL env variable is set, use it (for flexibility in deployment)
  if (import.meta.env.VITE_API_URL) {
    console.log(`Using custom backend: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }
  console.log(`Using production backend: ${prodUrl}`);
  return prodUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Always use real backend - no mock data
  useMockData: false
};