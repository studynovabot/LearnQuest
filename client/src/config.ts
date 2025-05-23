// Helper function to determine the API URL
function getApiUrl() {
  // In production, use relative URLs for Vercel deployment (same domain)
  if (import.meta.env.PROD) {
    console.log('Production mode - using relative API URLs for Vercel deployment');
    return '';
  }

  // In development, use the local API URL
  const devUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log(`Development mode - API URL set to: ${devUrl}`);
  return devUrl;
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'development',

  // Always use real backend - no mock data
  useMockData: false
};