import React, { ReactNode } from 'react';
import { useUserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  PREMIUM_FEATURES, 
  FEATURE_DESCRIPTIONS, 
  FEATURE_SUBSCRIPTION_LEVEL,
  hasFeatureAccess
} from '@/constants/PremiumFeatures';

// Define the subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

interface FeatureAccessProps {
  children: ReactNode;
  featureKey: string;
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
  teaser?: boolean; // Show a teaser of the premium feature
  blurIntensity?: number; // How much to blur (0-10)
}

/**
 * Component to conditionally render content based on user's subscription plan
 */
const FeatureAccess: React.FC<FeatureAccessProps> = ({
  children,
  featureKey,
  fallback,
  showUpgradeButton = true,
  teaser = false,
  blurIntensity = 5
}) => {
  const { user } = useUserContext();
  
  // Determine user's plan
  const userPlan = user?.isPro ? SUBSCRIPTION_PLANS.PREMIUM : SUBSCRIPTION_PLANS.FREE;
  
  // Check if the user has access to this feature
  const hasAccess = hasFeatureAccess(featureKey, userPlan as 'free' | 'premium');
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If teaser is enabled, show a blurred version of the content
  if (teaser) {
    return (
      <div className="relative">
        {/* Blurred content */}
        <div 
          className={`filter blur-sm pointer-events-none opacity-80`} 
          style={{ filter: `blur(${blurIntensity}px)` }}
        >
          {children}
        </div>
        
        {/* Overlay with upgrade button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-4 p-6">
            <h3 className="text-lg font-semibold text-white">Premium Feature</h3>
            <p className="text-sm text-white/80">
              Upgrade to unlock {FEATURE_DESCRIPTIONS[featureKey] || 'this premium feature'}.
            </p>
            {showUpgradeButton && (
              <Button 
                asChild 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Link href="/subscription">🔓 Unlock Now</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // If no access and no teaser, show fallback or upgrade button
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      {fallback || (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Premium Feature</h3>
          <p className="text-sm text-muted-foreground">
            This feature requires a Premium subscription.
          </p>
          {showUpgradeButton && (
            <Button 
              asChild 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Link href="/subscription">🔓 Unlock Now</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeatureAccess;