import React, { ComponentType } from 'react';
import FeatureGuard from './FeatureGuard';

/**
 * Higher-order component to protect routes that require specific subscription plans
 * 
 * @param Component The component to wrap
 * @param featureKey The feature key to check access for
 * @param redirectTo Optional redirect path if access is denied
 */
export function withSubscriptionGuard<P extends object>(
  Component: ComponentType<P>,
  featureKey: string,
  redirectTo?: string
) {
  const WithSubscriptionGuard = (props: P) => {
    return (
      <FeatureGuard featureKey={featureKey} redirectTo={redirectTo}>
        <Component {...props} />
      </FeatureGuard>
    );
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithSubscriptionGuard.displayName = `withSubscriptionGuard(${displayName})`;

  return WithSubscriptionGuard;
}

export default withSubscriptionGuard;