# Feature Access Control System

This document outlines the implementation of the feature access control system in LearnQuest, which manages user access to features based on their subscription plans.

## Subscription Plans

LearnQuest offers three subscription tiers:

1. **Free**
   - Basic access for new users
   - Limited usage of core features
   - Trial experience

2. **Pro**
   - Full access to standard features
   - Unlimited usage
   - Priority support

3. **Goat**
   - Premium access to all features
   - Advanced AI models
   - Expert sessions and personalized learning

## Implementation Components

### 1. User Model Enhancement

The User model has been enhanced to include subscription-related fields:

```typescript
interface User {
  // Existing fields
  id: string;
  email: string;
  displayName: string;
  isPro: boolean;
  
  // New subscription fields
  subscriptionPlan?: 'free' | 'pro' | 'goat';
  subscriptionStatus?: 'active' | 'trial' | 'expired' | 'canceled';
  subscriptionExpiry?: Date;
  
  // Other fields
  // ...
}
```

### 2. Feature Access Component

The `FeatureAccess` component provides a declarative way to conditionally render UI elements based on the user's subscription:

```tsx
<FeatureAccess featureKey="advanced_ai_models">
  <AdvancedAIComponent />
</FeatureAccess>
```

If the user doesn't have access to the feature, a fallback UI is shown with an upgrade prompt.

### 3. Feature Guard for Routes

The `FeatureGuard` component and `withSubscriptionGuard` HOC protect entire routes:

```tsx
// Protect a route
const ProtectedAnalyticsPage = withSubscriptionGuard(
  AnalyticsPage, 
  'advanced_analytics'
);

// In your route definitions
<Route path="/analytics" component={ProtectedAnalyticsPage} />
```

### 4. Feature Access Hook

The `useFeatureAccess` hook provides programmatic access to check feature permissions:

```tsx
const { hasAccess, getCurrentPlan } = useFeatureAccess();

if (hasAccess('custom_study_plans')) {
  // Enable premium functionality
}
```

## Feature Keys

Features are organized by subscription tier:

### Free Features
- `basic_chat` - Basic chat functionality
- `limited_sessions` - Limited number of chat sessions
- `basic_analytics` - Basic performance insights
- `autonomous_ai_agent_limited` - Limited usage of AI agent

### Pro Features
- `all_ai_tutors` - Access to all AI tutors
- `unlimited_chat_sessions` - Unlimited chat sessions
- `progress_tracking` - Progress tracking & analytics
- `custom_study_plans` - Custom study plans
- `priority_support` - Priority support
- `mobile_app_access` - Mobile app access
- `offline_content` - Offline content download
- `basic_performance_insights` - Basic performance insights

### Goat Features
- `advanced_ai_models` - Advanced AI tutoring models
- `personalized_learning_paths` - Personalized learning paths
- `realtime_performance_analysis` - Real-time performance analysis
- `expert_sessions` - 1-on-1 expert sessions
- `advanced_study_materials` - Advanced study materials
- `priority_queue` - Priority queue access
- `custom_ai_training` - Custom AI tutor training
- `advanced_analytics` - Advanced analytics dashboard
- `early_access` - Early access to new features

## Usage Examples

### Component-Level Access Control

```tsx
<FeatureAccess 
  featureKey="advanced_analytics" 
  fallback={<BasicAnalyticsComponent />}
>
  <AdvancedAnalyticsComponent />
</FeatureAccess>
```

### Programmatic Access Control

```tsx
const { hasAccess, getRequiredPlan } = useFeatureAccess();

// Check access
if (hasAccess('expert_sessions')) {
  // Show expert session booking UI
}

// Get required plan for a feature
const requiredPlan = getRequiredPlan('advanced_ai_models'); // Returns "Goat"
```

### Route Protection

```tsx
// Protect an entire page
export default withSubscriptionGuard(
  AnalyticsPage, 
  'advanced_analytics', 
  '/subscription' // Redirect path if access denied
);
```

## Extending the System

To add new features:

1. Add the feature key to the appropriate tier in `FEATURE_ACCESS` in `FeatureAccess.tsx`
2. Use the components and hooks to implement access control

To add a new subscription tier:

1. Add the new tier to `SUBSCRIPTION_PLANS` in `FeatureAccess.tsx`
2. Add a new array of features for the tier in `FEATURE_ACCESS`
3. Update the access control logic in `checkFeatureAccess()`

## Testing

You can test the feature access system using the example page:

```
/example-feature-access
```

This page demonstrates how different features are restricted based on the user's current subscription plan.