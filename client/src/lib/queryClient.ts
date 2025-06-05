import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { config } from "../config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;

    // Log the full response for debugging
    console.error("Response error details:", {
      status: res.status,
      statusText: res.statusText,
      body: text,
    });

    // Check if this is a Firestore API error
    if (text.includes("Cloud Firestore API has not been used") ||
        text.includes("PERMISSION_DENIED") ||
        text.includes("Firestore") ||
        text.includes("firebase")) {
      console.error("Firebase API error:", text);

      // Show a more user-friendly error message
      throw new Error("Firebase connection issue. Please ensure you've enabled the Firestore API in your Google Cloud Console.");
    }

    // Throw a generic error with status and text
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { signal?: AbortSignal }
): Promise<Response> {
  // Get userId from localStorage if available
  const userId = getUserId() || 'guest';
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add both X-User-ID header and Authorization header for compatibility
  headers["X-User-ID"] = userId;
  headers["Authorization"] = `Bearer ${userId}`;
  
  // Explicitly request JSON response
  headers["Accept"] = "application/json";

  // Add debugging information
  console.log(`🌐 Making API request: ${method} ${url}`);
  console.log(`👤 User ID: ${userId}`);
  console.log(`📋 Headers:`, headers);
  console.log(`📦 Data:`, data);

  try {
    // Ensure URL has the correct format
    let requestUrl = url;

    // Handle API URLs based on environment
    if (url.includes('/api/')) {
      if (config.apiUrl) {
        // For development with localhost:5000
        if (config.apiUrl.includes('localhost')) {
          // Use the full URL directly
          requestUrl = `${config.apiUrl}${url.replace('/api/', '/')}`;
        } 
        // For production with relative paths
        else if (config.apiUrl === '/api') {
          // Keep the URL as is for relative paths in production
          requestUrl = url;
        }
        // For custom API URLs
        else {
          // config.apiUrl already includes /api, so we need to remove /api from the url
          const cleanUrl = url.replace('/api/', '/');
          requestUrl = `${config.apiUrl}${cleanUrl}`;
        }
      }
    }
    // Otherwise make sure URLs are properly formatted
    else if (!url.startsWith('http') && !url.startsWith('/')) {
      requestUrl = '/' + url;
    }

    console.log(`Final request URL: ${requestUrl}`);

    // Determine if this is a cross-origin request
    const isCrossOrigin = requestUrl.includes('http') && !requestUrl.includes(window.location.origin);

    // Log the request details for debugging
    console.log('Request details:', {
      url: requestUrl,
      method,
      headers,
      isCrossOrigin,
      body: data ? JSON.stringify(data).substring(0, 100) + '...' : undefined
    });

    // Set up retry logic for API requests
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        const res = await fetch(requestUrl, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          // Use 'same-origin' for same-origin requests and 'cors' for cross-origin
          credentials: isCrossOrigin ? "include" : "same-origin",
          // Always use 'cors' mode for cross-origin requests
          mode: isCrossOrigin ? 'cors' : 'same-origin',
          signal: options?.signal,
        });

        // Log response status
        console.log(`API response status: ${res.status} ${res.statusText} for ${method} ${requestUrl}`);

        // For 404 errors, provide more detailed logging
        if (res.status === 404) {
          console.error(`404 Not Found: ${method} ${requestUrl}`, {
            headers: headers,
            data: data ? JSON.stringify(data) : undefined
          });

          // Special handling for common API endpoints
          if (url.includes('/api/tasks')) {
            throw new Error('Task service is currently unavailable. Please try again later.');
          }
          if (url.includes('/api/chat')) {
            throw new Error('Chat service is currently unavailable. Please try again later.');
          }
        }

        // If we get here, the request was successful
        return res;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`Retrying API request (${retryCount}/${maxRetries}): ${method} ${requestUrl}`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        }
      }
    }

    // If we get here, all retries failed
    console.error(`API request failed after ${maxRetries} attempts: ${method} ${requestUrl}`, lastError);
    throw lastError;
  } catch (error) {
    console.error(`API request failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const userId = getUserId() || 'guest';

    // Ensure URL has the correct format
    let requestUrl = queryKey[0] as string;

    // Handle API URLs based on environment
    if (requestUrl.includes('/api/')) {
      if (config.apiUrl) {
        // For development with localhost:5000
        if (config.apiUrl.includes('localhost')) {
          // Use the full URL directly
          requestUrl = `${config.apiUrl}${requestUrl.replace('/api/', '/')}`;
        } 
        // For production with relative paths
        else if (config.apiUrl === '/api') {
          // Keep the URL as is for relative paths in production
          requestUrl = requestUrl;
        }
        // For custom API URLs
        else {
          // config.apiUrl already includes /api, so we need to remove /api from the url
          const cleanUrl = requestUrl.replace('/api/', '/');
          requestUrl = `${config.apiUrl}${cleanUrl}`;
        }
      }
    }
    // Otherwise make sure URLs are properly formatted
    else if (!requestUrl.startsWith('http') && !requestUrl.startsWith('/')) {
      requestUrl = '/' + requestUrl;
    }

    console.log(`Query request URL: ${requestUrl}`);

    // Determine if this is a cross-origin request
    const isCrossOrigin = requestUrl.includes('http') && !requestUrl.includes(window.location.origin);

    // Create headers object with both X-User-ID and Authorization headers
    const headers: Record<string, string> = { 
      "X-User-ID": userId,
      "Authorization": `Bearer ${userId}`,
      // Explicitly request JSON response
      "Accept": "application/json"
    };

    // Log the query details for debugging
    console.log('Query details:', {
      url: requestUrl,
      headers,
      isCrossOrigin
    });

    // For all endpoints, use retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        const res = await fetch(requestUrl, {
          // Use 'same-origin' for same-origin requests and 'cors' for cross-origin
          credentials: isCrossOrigin ? "include" : "same-origin",
          // Always use 'cors' mode for cross-origin requests
          mode: isCrossOrigin ? 'cors' : 'same-origin',
          headers,
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }

        // For 404 errors, provide more detailed logging
        if (res.status === 404) {
          console.error(`404 Not Found: GET ${requestUrl}`, {
            headers: headers
          });

          // Special handling for common API endpoints
          if (requestUrl.includes('/api/tasks')) {
            throw new Error('Task service is currently unavailable. Please try again later.');
          }
          if (requestUrl.includes('/api/chat')) {
            throw new Error('Chat service is currently unavailable. Please try again later.');
          }
        }

        // Check if response is OK
        if (!res.ok) {
          const text = await res.text();
          console.error("Response error details:", {
            status: res.status,
            statusText: res.statusText,
            body: text,
          });
          throw new Error(`${res.status}: ${text}`);
        }

        // Try to parse the response as JSON
        try {
          // First check the content type
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await res.json();
          } else {
            // If not JSON content type, try to get the text and parse it
            const text = await res.text();
            try {
              // Try to parse as JSON anyway
              return JSON.parse(text);
            } catch (parseError) {
              console.error('Failed to parse non-JSON response:', parseError);
              throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
            }
          }
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError);
          
          // For tutors endpoint, provide a more specific error
          if (requestUrl.includes('/tutors')) {
            throw new Error('Failed to load tutors data. The API returned an invalid response format.');
          }
          
          // Re-throw the error for other cases
          throw jsonError;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`Retrying query request (${retryCount}/${maxRetries}): GET ${requestUrl}`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        }
      }
    }

    // If we get here, all retries failed
    console.error(`Query request failed after ${maxRetries} attempts: GET ${requestUrl}`, lastError);
    throw lastError;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function getUserId(): string | null {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed && parsed.id) {
        return String(parsed.id);
      }
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
}
