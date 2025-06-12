import { useUserContext } from '@/context/UserContext';
import { 
  SUBSCRIPTION_PLANS, 
  FEATURE_ACCESS, 
  checkFeatureAccess, 
  getRequiredPlanForFeature 
} from '@/components/subscription/FeatureAccess';

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
      userPlan = user.subscriptionPlan;
    } 
    // Fallback to the isPro boolean for backward compatibility
    else if (user.isPro) {
      userPlan = SUBSCRIPTION_PLANS.PRO;
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
    return checkFeatureAccess(featureKey, userPlan);
  };
  
  /**
   * Get the required plan name for a feature
   */
  const getRequiredPlan = (featureKey: string): string => {
    return getRequiredPlanForFeature(featureKey);
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
    
    if (plan === SUBSCRIPTION_PLANS.PRO) {
      return userPlan === SUBSCRIPTION_PLANS.PRO || userPlan === SUBSCRIPTION_PLANS.GOAT;
    }
    
    if (plan === SUBSCRIPTION_PLANS.GOAT) {
      return userPlan === SUBSCRIPTION_PLANS.GOAT;
    }
    
    return false;
  };
  
  return {
    hasAccess,
    getRequiredPlan,
    getCurrentPlan,
    isOnPlanOrHigher,
    PLANS: SUBSCRIPTION_PLANS,
    FEATURES: FEATURE_ACCESS
  };
}

export default useFeatureAccess;