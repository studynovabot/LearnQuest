import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateAvatar } from "@/lib/utils";
import { FlashlightIcon, FireIcon, HomeIcon, MessageIcon, TrophyIcon, StoreIcon, CreditCardIcon, SettingsIcon, BookOpenIcon, ImageIcon, HamburgerIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ProfileSettingsModal from "@/components/profile/ProfileSettingsModal";
import NovaLogo from "@/components/ui/NovaLogo";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";

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
    <div className="min-h-screen relative flex flex-col">
      {/* Hamburger menu always visible */}
      <Drawer>
        <div className="absolute top-4 left-4 z-50">
          <DrawerTrigger asChild>
            <button className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary">
              <HamburgerIcon size={28} />
            </button>
          </DrawerTrigger>
        </div>
        <DrawerContent className="w-64 max-w-full h-full fixed left-0 top-0 bg-card shadow-lg flex flex-col p-4 z-[100]">
          <div className="flex flex-col gap-4 mt-8">
            {navItems.map((item, idx) => (
              <Link key={idx} href={item.path}>
                <button className={cn(
                  "flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-muted transition",
                  location === item.path ? "bg-muted text-secondary" : ""
                )}>
                  <item.icon size={22} />
                  <span className="text-base font-medium">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Header with logo and logout */}
      <header className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3">
            <NovaLogo size="sm" iconOnly={true} />
            <div>
              <h1 className="text-lg font-bold">Nova AI</h1>
              <p className="text-xs text-muted-foreground">Your AI Study Buddy</p>
            </div>
          </div>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            setLocation("/login");
          }}
        >
          Logout
        </Button>
      </header>

      {/* Desktop logout button (top right) */}
      <div className="hidden lg:block absolute top-4 right-4 z-50">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-10">
        <div className="flex justify-around items-center">
          {mobileNavItems.map((item, index) => (
            <Link key={index} href={item.path}>
              <button className="nav-icon flex flex-col items-center p-2 min-w-[48px] min-h-[48px] justify-center">
                <item.icon
                  className={cn("text-xl", item.active ? "text-secondary" : "")}
                  size={22}
                />
                <span className={cn("text-xs mt-1", item.active ? "text-secondary" : "")}>{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl flex-grow flex flex-col lg:flex-row gap-6 mb-16 lg:mb-0 lg:pt-6">
        {/* Left sidebar - desktop only */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Main content */}
          {children}
        </div>
        {/* Profile/Settings Modal */}
        {showProfileModal && <ProfileSettingsModal onClose={() => setShowProfileModal(false)} />}
      </div>

    </div>
  );
};

export default MainLayout;
