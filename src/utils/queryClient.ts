// ...existing code...

async function makeRequest(url: string, options: RequestOptions) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// ...existing code...
