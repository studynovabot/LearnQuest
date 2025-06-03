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
import FlashNotes from "@/pages/FlashNotes";
import FlowCharts from "@/pages/FlowCharts";
import NCERTSolutions from "@/pages/NCERTSolutions";
import ImageTools from "@/pages/ImageTools";
import PersonalizedAgent from "@/pages/PersonalizedAgent";
import ContentManager from "@/pages/ContentManager";
import DocumentSearch from "@/pages/DocumentSearch";
import VectorUploadPage from "@/pages/VectorUploadPage";
import AdminRoute from "@/components/AdminRoute";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
// import { Analytics } from "@vercel/analytics/react";
// import { SpeedInsights } from "@vercel/speed-insights/react";

function Router() {
  const [location] = useLocation();
  const { trackPageView } = useAnalytics();

  // Track page views when location changes
  useEffect(() => {
    trackPageView(location);
  }, [location, trackPageView]);

  return (
    <Switch>
      <Route path="/">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      <Route path="/chat">
        <MainLayout>
          <ChatAgents />
        </MainLayout>
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
      <Route path="/settings">
        <MainLayout>
          <Settings />
        </MainLayout>
      </Route>
      <Route path="/themes">
        <MainLayout>
          <Themes />
        </MainLayout>
      </Route>
      <Route path="/subscription">
        <MainLayout>
          <Subscription />
        </MainLayout>
      </Route>

      <Route path="/flash-notes">
        <MainLayout>
          <FlashNotes />
        </MainLayout>
      </Route>
      <Route path="/flow-charts">
        <MainLayout>
          <FlowCharts />
        </MainLayout>
      </Route>
      <Route path="/ncert-solutions">
        <MainLayout>
          <NCERTSolutions />
        </MainLayout>
      </Route>
      <Route path="/textbook-solutions">
        <MainLayout>
          <TextbookSolutions />
        </MainLayout>
      </Route>
      <Route path="/image-tools">
        <MainLayout>
          <ImageTools />
        </MainLayout>
      </Route>
      <Route path="/personalized-agent">
        <MainLayout>
          <PersonalizedAgent />
        </MainLayout>
      </Route>
      <Route path="/content-manager">
        <MainLayout>
          <AdminRoute>
            <ContentManager />
          </AdminRoute>
        </MainLayout>
      </Route>
      <Route path="/vector-upload">
        <MainLayout>
          <AdminRoute>
            <VectorUploadPage />
          </AdminRoute>
        </MainLayout>
      </Route>

      <Route path="/document-search">
        <MainLayout>
          <DocumentSearch />
        </MainLayout>
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
