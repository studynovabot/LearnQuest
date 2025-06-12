import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeatureAccess from '@/components/subscription/FeatureAccess';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const ExampleFeatureAccessPage: React.FC = () => {
  const { hasAccess, getCurrentPlan, PLANS } = useFeatureAccess();
  const currentPlan = getCurrentPlan();
  
  return (
    <>
      <Helmet>
        <title>Feature Access Example - Study Nova</title>
      </Helmet>
      
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Feature Access Example</h1>
          <p className="text-muted-foreground">
            This page demonstrates how features are restricted based on subscription plans.
            Your current plan: <span className="font-semibold">{currentPlan.toUpperCase()}</span>
          </p>
        </div>
        
        <Tabs defaultValue="free">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="free">Free Features</TabsTrigger>
            <TabsTrigger value="pro">Pro Features</TabsTrigger>
            <TabsTrigger value="goat">Goat Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="free" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Free Feature Example */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Basic chat functionality available to all users.
                  </p>
                  <FeatureAccess featureKey="basic_chat">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Limited Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Limited chat sessions per day.
                  </p>
                  <FeatureAccess featureKey="limited_sessions">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pro" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pro Feature Example */}
              <Card>
                <CardHeader>
                  <CardTitle>All AI Tutors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access to all AI tutors in the platform.
                  </p>
                  <FeatureAccess featureKey="all_ai_tutors">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Unlimited Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unlimited chat sessions with AI tutors.
                  </p>
                  <FeatureAccess featureKey="unlimited_chat_sessions">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Custom Study Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create personalized study plans.
                  </p>
                  <FeatureAccess featureKey="custom_study_plans">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="goat" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Goat Feature Example */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced AI Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access to advanced AI tutoring models.
                  </p>
                  <FeatureAccess featureKey="advanced_ai_models">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Expert Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    1-on-1 sessions with expert tutors.
                  </p>
                  <FeatureAccess featureKey="expert_sessions">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced analytics dashboard.
                  </p>
                  <FeatureAccess featureKey="advanced_analytics">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                      You have access to this feature!
                    </div>
                  </FeatureAccess>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 p-6 border rounded-lg bg-slate-50 dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-4">How to Use Feature Access Control</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Wrap components with FeatureAccess</h3>
              <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto text-sm mt-2">
                {`<FeatureAccess featureKey="advanced_ai_models">
  <AdvancedAIComponent />
</FeatureAccess>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">2. Use the useFeatureAccess hook</h3>
              <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto text-sm mt-2">
                {`const { hasAccess } = useFeatureAccess();

if (hasAccess('custom_study_plans')) {
  // Show or enable premium functionality
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">3. Protect entire routes</h3>
              <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto text-sm mt-2">
                {`// In your route definitions:
const ProtectedAnalyticsPage = withSubscriptionGuard(
  AnalyticsPage, 
  'advanced_analytics'
);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExampleFeatureAccessPage;