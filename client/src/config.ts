// Helper function to determine if we should use mock data
function shouldUseMockData() {
  // Force clear mock data flag in development to ensure we use real backend
  if (import.meta.env.DEV) {
    localStorage.removeItem('useMockData');
    console.log('Development mode - forcing real backend usage');
    return false;
  }

  // Check if mock data is explicitly enabled in localStorage
  if (localStorage.getItem('useMockData') === 'true') {
    console.log('Using mock data (explicitly enabled in localStorage)');
    return true;
  }

  // Never use mock data in production - always try real backend
  console.log('Production mode - using real backend');
  return false;
}

// Helper function to determine the API URL
function getApiUrl() {
  // If we're using mock data, return an empty string to use relative URLs
  if (shouldUseMockData()) {
    console.log('Using mock data - API URL set to empty string');
    return '';
  }

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

  // Add a flag to enable/disable mock data
  useMockData: shouldUseMockData()
};