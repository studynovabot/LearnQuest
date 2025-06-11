import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/adminConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldIcon, LockIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, fallback }) => {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user?.email) || user?.role === 'admin';

  if (!userIsAdmin) {
    return fallback || <AdminAccessDenied />;
  }

  return <>{children}</>;
};

const AdminAccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 dark:bg-red-900/20">
            <LockIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              This page is restricted to administrators only.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldIcon className="w-4 h-4" />
              <span>Admin privileges required</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Contact your administrator if you believe this is an error.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoute;
