// Helper function to determine the API URL
function getApiUrl() {
  // Always use the same origin with /api path for Vercel deployments
  // This ensures both frontend and backend are served from the same domain
  const origin = window.location.origin;
  const apiUrl = `${origin}/api`;
  
  console.log(`Using Vercel serverless API: ${apiUrl}`);
  return apiUrl;
}

// Helper function to get Supabase URL
function getSupabaseUrl() {
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  return 'https://nigjowsghhhtzlxuzjdx.supabase.co'; // Configured for development
}

// Helper function to get Supabase Key
function getSupabaseKey() {
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2pvd3NnaGhodHpseHV6amR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjQ4NTcsImV4cCI6MjA2NTU0MDg1N30.SkertvWzrpIlhZDk7_mIoiIvkikRDOoEnkIZfZ5ITzg'; // Configured for development
}

// Helper function to get Groq API Key
function getGroqApiKey() {
  if (import.meta.env.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  // For development purposes, we'll use a hardcoded key
  // In production, this should be set as an environment variable
  return 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with actual Groq API key in production
}

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.VITE_NODE_ENV || 'production',

  // Disable mock data
  useMockData: false,

  // Disable mock fallback
  enableMockFallback: false,

  // Supabase configuration
  supabaseUrl: getSupabaseUrl(),
  supabaseKey: getSupabaseKey(),

  // Groq API configuration for AI chat
  groqApiKey: getGroqApiKey(),
  
  // Class Server configuration
  classServerFeatures: {
    enabled: true,
    mediaUpload: true,
    aiChat: true,
    xpSystem: true
  },
  
  // Goat Nitro configuration
  goatNitroFeatures: {
    customProfiles: true,
    highlightedMessages: true,
    privateRooms: true,
    aiChatBot: true,
    xpDrops: true,
    topperLounge: true
  }
};