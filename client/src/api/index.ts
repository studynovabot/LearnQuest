import { config } from '../config';

const API_URL = config.apiUrl;

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
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
  async login(username: string, password: string) {
    return this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async register(userData: any) {
    return this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Add more API methods as needed
}; 