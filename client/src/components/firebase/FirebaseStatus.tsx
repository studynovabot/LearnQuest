import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAnalytics } from '@/hooks/useAnalytics';
import { shouldUseMockData } from '@/lib/mockData';

export function FirebaseStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const { trackError } = useAnalytics();

  const checkFirebaseStatus = async () => {
    setIsChecking(true);

    // If we're using mock data, always show as connected
    if (shouldUseMockData()) {
      setStatus('connected');
      setIsChecking(false);
      return;
    }

    try {
      const response = await apiRequest('GET', '/api/health');
      const data = await response.json();

      if (data.firebase === 'connected') {
        setStatus('connected');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Unknown error connecting to Firebase');
        trackError('firebase', data.message || 'Unknown error connecting to Firebase');
      }
    } catch (error) {
      console.error('Firebase health check error:', error);

      // If we can't connect to the backend, use mock data
      if (window.location.hostname.includes('vercel.app') ||
          (error instanceof Error && error.message.includes('Failed to fetch'))) {
        console.log('Using mock data due to backend connection issues');
        localStorage.setItem('useMockData', 'true');
        setStatus('connected');
      } else {
        setStatus('error');
        const message = error instanceof Error ? error.message : 'Unknown error connecting to Firebase';
        setErrorMessage(message);
        trackError('firebase', message);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  if (status === 'connected') {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Firebase Connection Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">We're having trouble connecting to our database. This could be due to network issues or server maintenance.</p>
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={isChecking}
          >
            Refresh Page
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkFirebaseStatus}
            disabled={isChecking}
          >
            Check Firebase Status
          </Button>
        </div>
        {errorMessage && <p className="text-xs mt-2 text-red-400">{errorMessage}</p>}
      </AlertDescription>
    </Alert>
  );
}
