import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateAvatar } from "@/lib/utils";
import { FlashlightIcon, FireIcon, HomeIcon, MessageIcon, TrophyIcon, StoreIcon, SettingsIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ProfileSettingsModal from "@/components/profile/ProfileSettingsModal";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mobile navigation items
  const mobileNavItems = [
    { icon: HomeIcon, label: "Home", path: "/", active: location === "/" },
    { icon: MessageIcon, label: "Chat", path: "/chat", active: location === "/chat" },
    { icon: TrophyIcon, label: "Tasks", path: "/tasks", active: location === "/tasks" },
    { icon: StoreIcon, label: "Store", path: "/store", active: location === "/store" },
    { icon: SettingsIcon, label: "Settings", path: "/settings", active: location === "/settings" },
  ];

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Study Nova</h1>
          <p className="mb-8">Please log in to continue</p>
          <div className="flex gap-4 justify-center">
            <Link href="/login"><Button>Login</Button></Link>
            <Link href="/register"><Button variant="outline">Register</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Logout button (top right) */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => {
            logout();
            setLocation("/login");
          }}
        >
          Logout
        </Button>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-10">
        <div className="flex justify-around items-center">
          {mobileNavItems.map((item, index) => (
            <Link key={index} href={item.path}>
              <button className="nav-icon flex flex-col items-center">
                <item.icon 
                  className={cn("text-xl", item.active ? "text-secondary" : "")} 
                  size={24} 
                />
                <span className={cn("text-xs mt-1", item.active ? "text-secondary" : "")}>{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl flex-grow flex flex-col lg:flex-row gap-6 mb-16 lg:mb-0">
        {/* Left sidebar - desktop only */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Top header */}
          {/* Remove user-dependent header, or replace with static header if needed */}
          {children}
        </div>
        {/* Profile/Settings Modal */}
        {showProfileModal && <ProfileSettingsModal onClose={() => setShowProfileModal(false)} />}
      </div>
      {/* Desktop settings icon overlay */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-card border border-border rounded-full p-4 shadow-lg hover:bg-muted transition"
        onClick={() => setShowProfileModal(true)}
        title="Settings"
      >
        <SettingsIcon size={28} />
      </button>
    </div>
  );
};

export default MainLayout;
