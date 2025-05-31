import { ReactNode, useState, useEffect } from "react";
import SlidingSidebar from "./SlidingSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateAvatar } from "@/lib/utils";
import { FlashlightIcon, FireIcon, HomeIcon, MessageIcon, TrophyIcon, StoreIcon, CreditCardIcon, SettingsIcon, BookOpenIcon, ImageIcon, HamburgerIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
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
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint is 1024px
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="bg-white p-4 rounded">
        <h1 className="text-2xl font-bold mb-4">Layout Debug Test</h1>
        <p>Screen width: {typeof window !== 'undefined' ? window.innerWidth : 'unknown'}</p>
        <p>Is mobile: {isMobile ? 'Yes' : 'No'}</p>
        <p>User: {user?.displayName || 'Unknown'}</p>

        {/* Test SlidingSidebar rendering */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold">SlidingSidebar Test:</h2>
          {!isMobile ? (
            <div>
              <p>Should render SlidingSidebar (desktop mode)</p>
              <SlidingSidebar />
            </div>
          ) : (
            <p>SlidingSidebar hidden (mobile mode)</p>
          )}
        </div>

        {/* Original content */}
        <div className="mt-8 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Original Content:</h3>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
