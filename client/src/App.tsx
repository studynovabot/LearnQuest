import { Switch, Route } from "wouter";
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

function Router() {
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
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
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
    </QueryClientProvider>
  );
}

export default App;
