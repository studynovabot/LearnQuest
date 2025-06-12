import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon, CrownIcon } from '@/components/ui/icons';

interface FeatureGuardProps {
  children: ReactNode;
  featureKey: string;
  redirectTo?: string;
}

/**
 * Component to guard routes or sections that require specific subscription plans
 * Will redirect to subscription page or show upgrade prompt if user doesn't have access
 */
const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  featureKey,
  redirectTo = '/subscription'
}) => {
  const { hasAccess, getRequiredPlan } = useFeatureAccess();
  const [, setLocation] = useLocation();
  
  // If user has access to the feature, render children
  if (hasAccess(featureKey)) {
    return <>{children}</>;
  }
  
  // Get the required plan for this feature
  const requiredPlan = getRequiredPlan(featureKey);
  
  // If user doesn't have access, show upgrade prompt
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {requiredPlan === 'Pro' ? (
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <StarIcon size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <CrownIcon size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-center text-2xl">Premium Feature</CardTitle>
          <CardDescription className="text-center">
            This feature requires a {requiredPlan} subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Upgrade your account to access this feature and many more premium benefits.
          </p>
          <ul className="text-left space-y-2 mb-6">
            {requiredPlan === 'Pro' ? (
              <>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Access to all AI tutors
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Unlimited chat sessions
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Custom study plans
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Priority support
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Advanced AI tutoring models
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> 1-on-1 expert sessions
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Advanced analytics dashboard
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span> Early access to new features
                </li>
              </>
            )}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => setLocation(redirectTo)}
            className={requiredPlan === 'Pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
          >
            View Subscription Plans
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FeatureGuard;