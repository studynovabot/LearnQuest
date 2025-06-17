import { useUserContext } from '@/context/UserContext';
import { SUBSCRIPTION_PLANS } from '@/components/subscription/FeatureAccess';
import { 
  PREMIUM_FEATURES, 
  hasFeatureAccess,
  FEATURE_SUBSCRIPTION_LEVEL
} from '@/constants/PremiumFeatures';

/**
 * Hook to check if the current user has access to specific features
 * based on their subscription plan
 */
export function useFeatureAccess() {
  const { user } = useUserContext();
  
  // Determine user's plan
  let userPlan = SUBSCRIPTION_PLANS.FREE;
  
  if (user) {
    // First check the new subscriptionPlan field
    if (user.subscriptionPlan) {
      userPlan = user.subscriptionPlan === 'pro' ? SUBSCRIPTION_PLANS.PREMIUM : SUBSCRIPTION_PLANS.FREE;
    } 
    // Fallback to the isPro boolean for backward compatibility
    else if (user.isPro) {
      userPlan = SUBSCRIPTION_PLANS.PREMIUM;
    }
    
    // Check subscription status - if expired or canceled, revert to free
    if (user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'canceled') {
      userPlan = SUBSCRIPTION_PLANS.FREE;
    }
    
    // Check subscription expiry date
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      userPlan = SUBSCRIPTION_PLANS.FREE;
    }
  }
  
  /**
   * Check if the user has access to a specific feature
   */
  const hasAccess = (featureKey: string): boolean => {
    return hasFeatureAccess(featureKey, userPlan.toLowerCase() as 'free' | 'premium');
  };
  
  /**
   * Get the required plan name for a feature
   */
  const getRequiredPlan = (featureKey: string): string => {
    return FEATURE_SUBSCRIPTION_LEVEL[featureKey] || 'premium';
  };
  
  /**
   * Get the current user's subscription plan
   */
  const getCurrentPlan = (): string => {
    return userPlan;
  };
  
  /**
   * Check if the user is on a specific plan or higher
   */
  const isOnPlanOrHigher = (plan: string): boolean => {
    if (plan === SUBSCRIPTION_PLANS.FREE) {
      return true; // Everyone has at least free access
    }
    
    if (plan === SUBSCRIPTION_PLANS.PREMIUM) {
      return userPlan === SUBSCRIPTION_PLANS.PREMIUM;
    }
    
    return false;
  };
  
  return {
    hasAccess,
    getRequiredPlan,
    getCurrentPlan,
    isOnPlanOrHigher,
    PLANS: SUBSCRIPTION_PLANS,
    FEATURES: PREMIUM_FEATURES
  };
}

export default useFeatureAccess;