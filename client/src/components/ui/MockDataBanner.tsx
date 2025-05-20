import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, ServerIcon, XIcon } from 'lucide-react';
import { config } from '@/config';

export function MockDataBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  // Only show the banner if we're using mock data
  if (!config.useMockData || dismissed) {
    return null;
  }
  
  const handleDisable = () => {
    localStorage.removeItem('useMockData');
    window.location.reload();
  };
  
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <div className="flex items-start">
        <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-blue-700 dark:text-blue-300 flex items-center">
            Using Mock Data Mode
            <ServerIcon className="h-4 w-4 ml-2" />
          </AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
            <p className="mb-2">
              The app is currently running with simulated data because the backend server is unavailable.
              All features will work, but changes won't be saved permanently.
            </p>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                onClick={handleDisable}
              >
                Try to Connect to Backend
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900"
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-6 w-6 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={() => setDismissed(true)}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </Alert>
  );
}
