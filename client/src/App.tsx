import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/context/UserContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import Store from "@/pages/Store";
import ChatAgents from "@/pages/ChatAgents";
import TaskManagement from "@/pages/TaskManagement";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MainLayout from "./components/layout/MainLayout";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useEffect } from "react";
import { ConnectionStatus } from "@/components/ConnectionStatus";

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
      <Route path="/leaderboard">
        <MainLayout>
          <Leaderboard />
        </MainLayout>
      </Route>
      <Route path="/store">
        <MainLayout>
          <Store />
        </MainLayout>
      </Route>
      <Route path="/chat">
        <MainLayout>
          <ChatAgents />
        </MainLayout>
      </Route>
      <Route path="/tasks">
        <MainLayout>
          <TaskManagement />
        </MainLayout>
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function InnerApp() {
  // Use the health check hook to verify backend connection
  const { status, isChecking } = useHealthCheck();

  // Log the backend connection status
  useEffect(() => {
    console.log('Backend connection status:', status);
  }, [status]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ConnectionStatus />
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );
}

export default App;
