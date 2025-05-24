import { config } from '../config';

const API_URL = config.apiUrl;

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    // Make sure endpoint starts with a slash if API_URL is empty
    const formattedEndpoint = !API_URL && !endpoint.startsWith('/') ? `/${endpoint}` : endpoint;

    console.log(`API fetch: ${API_URL}${formattedEndpoint}`);

    const response = await fetch(`${API_URL}${formattedEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  // Add your API methods here
  async login(email: string, password: string) {
    return this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData: any) {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Add more API methods as needed
};