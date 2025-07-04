import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUserContext } from '@/context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useUserContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      console.log('User not authenticated, redirecting to login');
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;