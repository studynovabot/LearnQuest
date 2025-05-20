import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config';

interface HealthCheckResult {
  status: 'ok' | 'error' | 'warning' | 'unknown';
  message: string;
  firebase?: 'connected' | 'disconnected' | 'unknown';
  timestamp?: string;
}

export function useHealthCheck() {
  const [status, setStatus] = useState<HealthCheckResult>({
    status: 'unknown',
    message: 'Checking connection to backend...',
  });
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkHealth = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      setStatus({
        status: 'unknown',
        message: 'Checking connection to backend...',
      });

      // Set up retry logic for health check
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (retryCount <= maxRetries && !success) {
        try {
          console.log(`Checking backend health (attempt ${retryCount + 1}/${maxRetries + 1})`);

          // Add timeout for the request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          // Construct the health check URL
          let healthUrl = '/api/health';
          if (config.apiUrl) {
            healthUrl = `${config.apiUrl}/api/health`;
          }

          console.log(`Health check URL: ${healthUrl}`);

          // Try a different approach for cross-origin requests
          const isCrossOrigin = healthUrl.includes('http') && !healthUrl.includes(window.location.origin);

          const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            // Use appropriate credentials mode based on whether this is a cross-origin request
            credentials: isCrossOrigin ? 'include' : 'same-origin',
            // Use appropriate mode based on whether this is a cross-origin request
            mode: isCrossOrigin ? 'cors' : 'same-origin',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Health check failed with status: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          console.log('Health check response:', result);

          setStatus({
            status: result.status || 'unknown',
            message: result.message || 'Backend connection status unknown',
            firebase: result.firebase || 'unknown',
            timestamp: result.timestamp,
          });

          success = true;

          // Show toast based on status
          if (result.status === 'ok') {
            toast({
              title: 'Backend Connected',
              description: 'Successfully connected to the backend server.',
            });
          } else if (result.status === 'warning') {
            toast({
              title: 'Backend Warning',
              description: result.message || 'Backend connection has issues.',
              variant: 'warning',
            });
          } else if (result.status === 'error') {
            toast({
              title: 'Backend Error',
              description: result.message || 'Failed to connect to the backend server.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error(`Health check failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);

          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying health check (${retryCount}/${maxRetries})...`);
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          } else {
            // If all retries failed, try a fallback approach
            try {
              console.log('Trying fallback health check approach...');

              // Try a direct fetch with no-cors mode as a last resort
              const fallbackResponse = await fetch(healthUrl, {
                method: 'GET',
                mode: 'no-cors', // This will allow the request but limit response access
              });

              console.log('Fallback health check response:', fallbackResponse);

              // If we get here, the server is at least reachable
              setStatus({
                status: 'warning',
                message: 'Backend is reachable but health check failed. Some features may not work correctly.',
                firebase: 'unknown',
                timestamp: new Date().toISOString(),
              });

              toast({
                title: 'Backend Partially Connected',
                description: 'Backend is reachable but health check failed. Some features may not work correctly.',
                variant: 'warning',
              });
            } catch (fallbackError) {
              // If even the fallback fails, set error status
              console.error('Fallback health check also failed:', fallbackError);

              setStatus({
                status: 'error',
                message: error instanceof Error
                  ? `Failed to connect to backend: ${error.message}`
                  : 'Failed to connect to backend server',
              });

              toast({
                title: 'Backend Connection Failed',
                description: 'Could not connect to the backend server. Some features may not work correctly.',
                variant: 'destructive',
              });
            }
          }
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Run health check on component mount
  useEffect(() => {
    checkHealth();
  }, []);

  return {
    status,
    isChecking,
    checkHealth,
  };
}
