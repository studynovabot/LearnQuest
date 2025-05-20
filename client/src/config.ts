// Helper function to determine if we should use mock data
function shouldUseMockData() {
  // Only use mock data if explicitly set in localStorage
  // We're removing the automatic mock data for Vercel deployment
  return localStorage.getItem('useMockData') === 'true';
}

// Helper function to determine the API URL
function getApiUrl() {
  // If we're using mock data, return an empty string to use relative URLs
  if (shouldUseMockData()) {
    console.log('Using mock data - API URL set to empty string');
    return '';
  }

  // Always use the Render backend URL in production
  if (import.meta.env.PROD) {
    // Force the backend URL to be the Render URL
    const backendUrl = 'https://learnquest-backend.onrender.com';
    console.log(`Production mode - API URL set to: ${backendUrl}`);
    return backendUrl;
  }

  // In development, use the local API URL
  const devUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log(`Development mode - API URL set to: ${devUrl}`);
  return devUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'development',

  // Add a flag to enable/disable mock data
  useMockData: shouldUseMockData()
};