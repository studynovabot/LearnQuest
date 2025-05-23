// Helper function to determine the API URL
function getApiUrl() {
  // Always use local backend for now until deployment is fixed
  const localUrl = 'http://localhost:5000';
  console.log(`Using local backend: ${localUrl}`);
  return localUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'development',

  // Always use real backend - no mock data
  useMockData: false
};