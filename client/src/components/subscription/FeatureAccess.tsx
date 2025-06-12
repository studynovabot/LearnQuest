import React, { ReactNode } from 'react';
import { useUserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Define the subscription plans and their features
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  GOAT: 'goat'
};

// Define feature access levels
export const FEATURE_ACCESS = {
  // Features available to all users (free included)
  FREE: [
    'basic_chat',
    'limited_sessions',
    'basic_analytics',
    'autonomous_ai_agent_limited',
  ],
  
  // Features available to Pro users
  PRO: [
    'all_ai_tutors',
    'unlimited_chat_sessions',
    'progress_tracking',
    'custom_study_plans',
    'priority_support',
    'mobile_app_access',
    'offline_content',
    'basic_performance_insights',
  ],
  
  // Features available to Goat users
  GOAT: [
    'advanced_ai_models',
    'personalized_learning_paths',
    'realtime_performance_analysis',
    'expert_sessions',
    'advanced_study_materials',
    'priority_queue',
    'custom_ai_training',
    'advanced_analytics',
    'early_access',
  ]
};

interface FeatureAccessProps {
  children: ReactNode;
  featureKey: string;
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
}

/**
 * Component to conditionally render content based on user's subscription plan
 */
const FeatureAccess: React.FC<FeatureAccessProps> = ({
  children,
  featureKey,
  fallback,
  showUpgradeButton = true
}) => {
  const { user } = useUserContext();
  
  // Determine user's plan
  let userPlan = SUBSCRIPTION_PLANS.FREE;
  
  if (user?.isPro) {
    // In the current implementation, isPro is a boolean
    // We'll need to enhance this to distinguish between Pro and Goat
    // For now, we'll assume isPro means Pro plan
    userPlan = SUBSCRIPTION_PLANS.PRO;
    
    // Additional check could be added here when the user type is enhanced
    // to include a specific plan field
    // if (user.plan === SUBSCRIPTION_PLANS.GOAT) {
    //   userPlan = SUBSCRIPTION_PLANS.GOAT;
    // }
  }
  
  // Check if the user has access to this feature
  const hasAccess = checkFeatureAccess(featureKey, userPlan);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If no access, show fallback or upgrade button
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      {fallback || (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Premium Feature</h3>
          <p className="text-sm text-muted-foreground">
            This feature requires a {getRequiredPlanForFeature(featureKey)} subscription.
          </p>
          {showUpgradeButton && (
            <Button asChild>
              <Link href="/subscription">Upgrade Now</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Check if a user with the given plan has access to a specific feature
 */
export function checkFeatureAccess(featureKey: string, userPlan: string): boolean {
  // Free users can access only free features
  if (userPlan === SUBSCRIPTION_PLANS.FREE) {
    return FEATURE_ACCESS.FREE.includes(featureKey);
  }
  
  // Pro users can access free and pro features
  if (userPlan === SUBSCRIPTION_PLANS.PRO) {
    return FEATURE_ACCESS.FREE.includes(featureKey) || 
           FEATURE_ACCESS.PRO.includes(featureKey);
  }
  
  // Goat users can access all features
  if (userPlan === SUBSCRIPTION_PLANS.GOAT) {
    return true;
  }
  
  return false;
}

/**
 * Get the minimum plan required for a feature
 */
export function getRequiredPlanForFeature(featureKey: string): string {
  if (FEATURE_ACCESS.FREE.includes(featureKey)) {
    return 'Free';
  }
  
  if (FEATURE_ACCESS.PRO.includes(featureKey)) {
    return 'Pro';
  }
  
  return 'Goat';
}

export default FeatureAccess;