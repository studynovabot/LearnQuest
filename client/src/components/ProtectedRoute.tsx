import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUserContext } from '@/context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useUserContext();
  const [, setLocation] = useLocation();

  // TEMPORARY: Bypass authentication for UI testing
  // TODO: Remove this when done testing
  const BYPASS_AUTH = true;

  useEffect(() => {
    if (!BYPASS_AUTH && !loading && !user) {
      // Redirect to login if not authenticated
      console.log('User not authenticated, redirecting to login');
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  // Show nothing while checking authentication
  if (!BYPASS_AUTH && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated or bypassing auth, render children
  return (BYPASS_AUTH || user) ? <>{children}</> : null;
};

export default ProtectedRoute;