import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FirebaseError: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5 mr-2" />
      <AlertTitle className="text-lg font-semibold mb-2">Firebase Connection Error</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          We're having trouble connecting to our database. This could be due to network issues or 
          server maintenance.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleRefresh} variant="outline">
            Refresh Page
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://status.firebase.google.com/', '_blank')}
          >
            Check Firebase Status
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default FirebaseError;