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
  headers["Authorization"] = userId;

  // Add debugging information
  console.log(`Making API request: ${method} ${url}`);

  try {
    // Ensure URL has the correct format
    let requestUrl = url;

    // If we're in production and using a backend URL, prepend it to API requests
    if (import.meta.env.PROD && config.apiUrl && url.includes('/api/')) {
      // Remove leading slash if present to avoid double slashes
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      requestUrl = `${config.apiUrl}/${cleanUrl}`;
    }
    // Otherwise make sure URLs are properly formatted
    else if (!url.startsWith('http') && !url.startsWith('/')) {
      requestUrl = '/' + url;
    }

    console.log(`Final request URL: ${requestUrl}`);

    // Determine if this is a cross-origin request
    const isCrossOrigin = requestUrl.includes('http') && !requestUrl.includes(window.location.origin);

    const res = await fetch(requestUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // Use 'same-origin' for same-origin requests and 'include' for cross-origin
      credentials: isCrossOrigin ? "include" : "same-origin",
      // Add mode: 'cors' for cross-origin requests
      mode: isCrossOrigin ? 'cors' : undefined,
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

    await throwIfResNotOk(res);
    return res;
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

    // If we're in production and using a backend URL, prepend it to API requests
    if (import.meta.env.PROD && config.apiUrl && requestUrl.includes('/api/')) {
      // Remove leading slash if present to avoid double slashes
      const cleanUrl = requestUrl.startsWith('/') ? requestUrl.substring(1) : requestUrl;
      requestUrl = `${config.apiUrl}/${cleanUrl}`;
    }
    // Otherwise make sure URLs are properly formatted
    else if (!requestUrl.startsWith('http') && !requestUrl.startsWith('/')) {
      requestUrl = '/' + requestUrl;
    }

    console.log(`Query request URL: ${requestUrl}`);

    // Determine if this is a cross-origin request
    const isCrossOrigin = requestUrl.includes('http') && !requestUrl.includes(window.location.origin);

    const res = await fetch(requestUrl, {
      // Use 'same-origin' for same-origin requests and 'include' for cross-origin
      credentials: isCrossOrigin ? "include" : "same-origin",
      // Add mode: 'cors' for cross-origin requests
      mode: isCrossOrigin ? 'cors' : undefined,
      headers: { "Authorization": userId },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
      if (parsed && parsed.id) return String(parsed.id);
    }
  } catch {}
  return null;
}
