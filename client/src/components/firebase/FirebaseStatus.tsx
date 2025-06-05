import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Database } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAnalytics } from '@/hooks/useAnalytics';
import { config } from '@/config';

export function FirebaseStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const { trackError } = useAnalytics();

  const checkFirebaseStatus = async () => {
    setIsChecking(true);

    try {
      // Use the tutors endpoint to check Firebase connectivity
      const response = await apiRequest('GET', '/api/tutors');
      
      try {
        const data = await response.json();
        
        // Check if we got a proper response with tutors data
        if (data && (
            (Array.isArray(data) && data.length > 0) || 
            (data.data && Array.isArray(data.data) && data.data.length > 0)
          )) {
          setStatus('connected');
        } else {
          setStatus('error');
          setErrorMessage('No tutors data found - Firebase may not be properly connected');
          trackError('firebase', 'No tutors data found');
        }
      } catch (jsonError) {
        // Handle JSON parsing errors
        console.warn('Firebase check: JSON parsing error', jsonError);
        
        // If we at least got a 200 response, consider it partially working
        if (response.status === 200) {
          setStatus('connected');
        } else {
          setStatus('error');
          setErrorMessage('Invalid response format from API');
          trackError('firebase', 'Invalid response format');
        }
      }
    } catch (error) {
      console.error('Firebase connectivity check error:', error);
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Unknown error connecting to Firebase';
      setErrorMessage(message);
      trackError('firebase', message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  // Always use real database - no mock data mode

  // If connected to real database, don't show anything
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
