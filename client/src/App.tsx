import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/context/UserContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ChatAgents from "@/pages/ChatAgents";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import OTPLogin from "@/pages/OTPLogin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Settings from "@/pages/Settings";
import Themes from "@/pages/Themes";
import Subscription from "@/pages/Subscription";
import FlowCharts from "@/pages/FlowCharts";
import NCERTSolutions from "@/pages/NCERTSolutions";
import ImageTools from "@/pages/ImageTools";
import PersonalizedAgent from "@/pages/PersonalizedAgent";
import ContentManager from "@/pages/ContentManager";
import DocumentSearch from "@/pages/DocumentSearch";
import VectorUploadPage from "@/pages/VectorUploadPage";
import LandingPage from "@/pages/LandingPage";
import Terms from "@/pages/Terms";
import AdminUsers from "@/pages/AdminUsers";
import AdminSolutions from "@/pages/AdminSolutions";
import Ranks from "@/pages/Ranks";
import GamificationPage from "@/pages/GamificationPage";
import StudyTracker from "@/pages/StudyTracker";
import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import { useAnalytics } from "@/hooks/useAnalytics";
// import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useEffect } from "react";
import { useUserContext } from "@/context/UserContext";
import PricingPage from "@/pages/PricingPage";
// import { Analytics } from "@vercel/analytics/react";
// import { SpeedInsights } from "@vercel/speed-insights/react";

function Router() {
  const [location] = useLocation();
  const { trackPageView } = useAnalytics();
  // const { user } = useUserContext();

  // Track page views when location changes
  useEffect(() => {
    trackPageView(location);
  }, [location, trackPageView]);

  return (
    <Switch>
      <Route path="/">
        <LandingPage />
      </Route>
      <Route path="/app">
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/demo">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      

      <Route path="/chat">
        <ProtectedRoute>
          <MainLayout>
            <ChatAgents />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/login">
        <Login />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route path="/otp-login">
        <OTPLogin mode="login" />
      </Route>
      <Route path="/otp-register">
        <OTPLogin mode="register" />
      </Route>
      <Route path="/privacy-policy">
        <PrivacyPolicy />
      </Route>
      <Route path="/terms">
        <Terms />
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/themes">
        <ProtectedRoute>
          <MainLayout>
            <Themes />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/subscription">
        <ProtectedRoute>
          <MainLayout>
            <Subscription />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/flow-charts">
        <ProtectedRoute>
          <MainLayout>
            <FlowCharts />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/ncert-solutions">
        <ProtectedRoute>
          <MainLayout>
            <NCERTSolutions />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/image-tools">
        <ProtectedRoute>
          <MainLayout>
            <ImageTools />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/personalized-agent">
        <ProtectedRoute>
          <MainLayout>
            <PersonalizedAgent />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/content-manager">
        <ProtectedRoute>
          <MainLayout>
            <AdminRoute>
              <ContentManager />
            </AdminRoute>
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/vector-upload">
        <ProtectedRoute>
          <MainLayout>
            <AdminRoute>
              <VectorUploadPage />
            </AdminRoute>
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin-users">
        <ProtectedRoute>
          <MainLayout>
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin-solutions">
        <ProtectedRoute>
          <MainLayout>
            <AdminRoute>
              <AdminSolutions />
            </AdminRoute>
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/document-search">
        <ProtectedRoute>
          <MainLayout>
            <DocumentSearch />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pricing">
        <PricingPage />
      </Route>
      <Route path="/ranks">
        <ProtectedRoute>
          <MainLayout>
            <Ranks />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/gamification">
        <ProtectedRoute>
          <MainLayout>
            <GamificationPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study-tracker">
        <ProtectedRoute>
          <MainLayout>
            <StudyTracker />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function InnerApp() {
  // Temporarily disable health check to isolate null errors
  // const { status } = useHealthCheck();

  // Log the backend connection status
  // useEffect(() => {
  //   console.log('Backend connection status:', status);
  // }, [status]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="learnquest-theme-mode"
    >
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
      {/* <Analytics />
      <SpeedInsights /> */}
    </QueryClientProvider>
  );
}

export default App;
