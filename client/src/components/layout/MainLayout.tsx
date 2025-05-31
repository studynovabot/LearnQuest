import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import SlidingSidebar from "./SlidingSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateAvatar } from "@/lib/utils";
import { FlashlightIcon, FireIcon, HomeIcon, MessageIcon, TrophyIcon, StoreIcon, CreditCardIcon, SettingsIcon, BookOpenIcon, ImageIcon, HamburgerIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ProfileSettingsModal from "@/components/profile/ProfileSettingsModal";
import NovaLogo from "@/components/ui/NovaLogo";
import { ThemeToggle, ThemeToggleCompact } from "@/components/ui/theme-toggle";
import { FloatingNav } from "@/components/ui/floating-nav";

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
    { icon: FlashlightIcon, label: "Flash", path: "/flash-notes", active: location === "/flash-notes" },
    { icon: BookOpenIcon, label: "NCERT", path: "/ncert-solutions", active: location === "/ncert-solutions" },
    { icon: ImageIcon, label: "Images", path: "/image-tools", active: location === "/image-tools" },
  ];

  const navItems = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: MessageIcon, label: "Chat", path: "/chat" },
    { icon: FlashlightIcon, label: "Flash Notes", path: "/flash-notes" },
    { icon: BookOpenIcon, label: "NCERT Solutions", path: "/ncert-solutions" },
    { icon: ImageIcon, label: "Image Tools", path: "/image-tools" },
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
    <div className="min-h-screen relative flex">
      {/* Desktop Sliding Sidebar - only visible on desktop */}
      <div className="hidden lg:block">
        <SlidingSidebar />
      </div>

      {/* Main content area */}
      <div className={cn(
        "flex-1 flex flex-col",
        "lg:ml-20" // Add left margin for sidebar on desktop
      )}>
        {/* Header with logout - mobile only */}
        <header className="lg:hidden bg-card border-b border-border mobile-header pt-safe flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-4">
              <NovaLogo size="sm" iconOnly={true} />
              <div>
                <h1 className="mobile-subtitle">Nova AI</h1>
                <p className="mobile-caption">Your AI Study Buddy</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggleCompact />
            <Button
              variant="outline"
              className="mobile-button"
              onClick={() => {
                logout();
                setLocation("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Desktop controls (top right) */}
        <div className="hidden lg:flex absolute top-4 right-4 z-50 items-center gap-3">
          <ThemeToggle size="default" variant="outline" />
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

        {/* Main content container */}
        <div className={cn(
          "flex-1 container mx-auto max-w-7xl",
          "lg:px-4 lg:py-6 lg:mb-0", // Desktop styling
          "mobile-content" // Mobile styling with proper spacing
        )}>
          {/* Main content */}
          <div className="flex-grow flex flex-col gap-6">
            {children}
          </div>

          {/* Profile/Settings Modal */}
          {showProfileModal && <ProfileSettingsModal onClose={() => setShowProfileModal(false)} />}
        </div>

        {/* Premium Floating Navigation for Mobile - replaces bottom nav */}
        <div className="lg:hidden">
          <FloatingNav variant="bottom" />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
