import { useHealthCheck } from "@/hooks/useHealthCheck";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, RefreshCw, WifiOff, Database, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { config } from "@/config";

export function ConnectionStatus() {
  // Component disabled to prevent annoying popups
  return null;

  const { status, isChecking, checkHealth } = useHealthCheck();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show the connection status if there's an error or warning (but not for success)
  useEffect(() => {
    if (status.status === 'error' || status.status === 'warning') {
      setIsVisible(true);
      setIsDismissed(false); // Reset dismissal for errors/warnings
    }
  }, [status]);

  // Don't show success messages at all to avoid annoyance
  useEffect(() => {
    if (status.status === 'ok') {
      setIsVisible(false);
      setShowDetails(false);
    }
  }, [status]);

  // Always show during development for testing (but only errors/warnings)
  const isDevelopment = import.meta.env.DEV;

  // If dismissed by user, don't show again
  if (isDismissed) {
    return null;
  }

  // If we're using mock data, only show in development mode
  if (config.useMockData && !isDevelopment) {
    return null;
  }

  // Only show for errors and warnings, not for success
  if (!isVisible && status.status !== 'error' && status.status !== 'warning') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex flex-col rounded-lg p-3 shadow-lg max-w-md ${
        status.status === 'ok'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          : status.status === 'warning'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
          : status.status === 'error'
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          {status.status === 'ok' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : status.status === 'warning' ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          ) : status.status === 'error' ? (
            <WifiOff className="h-5 w-5 flex-shrink-0" />
          ) : (
            <RefreshCw className={`h-5 w-5 flex-shrink-0 ${isChecking ? 'animate-spin' : ''}`} />
          )}

          <div className="flex flex-col flex-grow">
            <span className="text-sm font-medium">
              {status.status === 'ok'
                ? 'Connected to backend'
                : status.status === 'warning'
                ? 'Backend warning'
                : status.status === 'error'
                ? 'Backend connection error'
                : 'Checking connection...'}
            </span>
            <span className="text-xs">
              {status.message}
            </span>
            {status.firebase && (
              <span className="text-xs">
                Firebase: {status.firebase}
              </span>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 flex-shrink-0"
              onClick={() => setShowDetails(!showDetails)}
              title="Show details"
            >
              <Info className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 flex-shrink-0"
              onClick={() => checkHealth()}
              title="Retry connection"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 flex-shrink-0 hover:bg-white/20"
              onClick={() => {
                setIsVisible(false);
                setShowDetails(false);
                setIsDismissed(true); // Permanently dismiss
              }}
              title="Close"
            >
              <span className="text-lg font-bold">×</span>
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-2 text-xs border-t pt-2 space-y-1">
            <div><strong>API URL:</strong> {config.apiUrl || 'Using relative URLs'}</div>
            <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
            <div><strong>Mock Data:</strong> {config.useMockData ? 'Enabled' : 'Disabled'}</div>
            <div><strong>Firebase:</strong> {status.firebase || 'Unknown'}</div>
            <div><strong>Last Check:</strong> {status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'Unknown'}</div>
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>
                {config.useMockData
                  ? 'Using mock data instead of real database'
                  : status.firebase === 'connected'
                  ? 'Database is connected and working properly'
                  : status.firebase === 'partially_connected'
                  ? 'Database is partially connected'
                  : status.firebase === 'disconnected'
                  ? 'Database is disconnected'
                  : 'Database connection status unknown'}
              </span>
            </div>

            {config.useMockData && (
              <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-100">
                <strong>NOTICE:</strong> The app is currently using mock data due to backend connection issues.
                Your changes will not be saved to the database. This is a temporary measure until the backend
                connection issues are resolved.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
