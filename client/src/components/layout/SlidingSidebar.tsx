import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import NovaLogo from "@/components/ui/NovaLogo";
import {
  HomeIcon, MessageIcon, FlashlightIcon, BookOpenIcon,
  ImageIcon, SparklesIcon, UploadIcon, CreditCardIcon
} from "@/components/ui/icons";

interface SlidingSidebarProps {
  className?: string;
}

const SlidingSidebar: React.FC<SlidingSidebarProps> = ({ className }) => {
  const [location] = useLocation();

  // Navigation items with full names
  const navItems = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: MessageIcon, label: "Chat", path: "/chat" },
    { icon: FlashlightIcon, label: "Flash Notes", path: "/flash-notes" },
    { icon: BookOpenIcon, label: "NCERT Solutions", path: "/ncert-solutions" },
    { icon: ImageIcon, label: "Image Tools", path: "/image-tools" },
    { icon: SparklesIcon, label: "Personalized Agent", path: "/personalized-agent" },
    { icon: UploadIcon, label: "Content Manager", path: "/content-manager" },
    { icon: CreditCardIcon, label: "Subscription", path: "/subscription" },
  ];

  return (
    <>
      {/* Sliding Sidebar */}
      <div
        id="sliding-sidebar"
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out",
          "flex flex-col shadow-lg group",
          "w-20 hover:w-64",
          className
        )}
      >
        {/* Header with logo only */}
        <div className="flex items-center p-4 border-b border-border">
          {/* Logo - always visible */}
          <div className="flex items-center gap-3 transition-all duration-300">
            <NovaLogo size="sm" iconOnly={true} />
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs"
            )}>
              <h1 className="text-lg font-bold whitespace-nowrap">Nova AI</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Your AI Study Buddy</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <Link key={index} href={item.path}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
                    "group relative",
                    location === item.path ? "bg-muted text-secondary" : ""
                  )}
                >
                  <item.icon size={22} className="flex-shrink-0" />

                  {/* Label - visible on hover */}
                  <span className={cn(
                    "text-base font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                    "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs"
                  )}>
                    {item.label}
                  </span>
                </button>
              </Link>
            ))}
          </div>
        </nav>


      </div>

      {/* Spacer for desktop layout */}
      <div className="w-20" />
    </>
  );
};

export default SlidingSidebar;
