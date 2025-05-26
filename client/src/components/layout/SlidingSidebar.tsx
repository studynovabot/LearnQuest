import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import NovaLogo from "@/components/ui/NovaLogo";
import {
  HomeIcon, MessageIcon, FlashlightIcon, BookOpenIcon,
  ImageIcon, SparklesIcon, UploadIcon, CreditCardIcon, HamburgerIcon
} from "@/components/ui/icons";

interface SlidingSidebarProps {
  className?: string;
}

const SlidingSidebar: React.FC<SlidingSidebarProps> = ({ className }) => {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sliding-sidebar');
      const target = event.target as Node;

      if (isExpanded && sidebar && !sidebar.contains(target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Close sidebar on route change
  useEffect(() => {
    setIsExpanded(false);
  }, [location]);

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sliding Sidebar */}
      <div
        id="sliding-sidebar"
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out",
          "flex flex-col shadow-lg group",
          isExpanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isExpanded ? "w-64" : "w-20",
          "lg:w-20 lg:hover:w-64",
          className
        )}
      >
        {/* Header with hamburger and logo */}
        <div className="flex items-center p-4 border-b border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
          >
            <HamburgerIcon size={24} />
          </button>

          {/* Logo - always visible on desktop, visible when expanded on mobile */}
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isExpanded ? "opacity-100 ml-2" : "opacity-0 lg:opacity-100",
            "lg:ml-0"
          )}>
            <NovaLogo size="sm" iconOnly={true} />
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-xs"
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

                  {/* Label - visible when expanded or on desktop hover */}
                  <span className={cn(
                    "text-base font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isExpanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0",
                    "lg:group-hover:opacity-100 lg:group-hover:max-w-xs"
                  )}>
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state on desktop */}
                  <div className={cn(
                    "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md z-50",
                    "opacity-0 pointer-events-none transition-opacity duration-200",
                    "lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto",
                    isExpanded && "lg:opacity-0 lg:pointer-events-none"
                  )}>
                    {item.label}
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </nav>

        {/* Hamburger button for desktop (bottom of sidebar) */}
        <div className="hidden lg:block p-4 border-t border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <HamburgerIcon size={24} />
          </button>
        </div>
      </div>

      {/* Spacer for desktop layout */}
      <div className={cn(
        "hidden lg:block transition-all duration-300",
        isExpanded ? "w-64" : "w-20"
      )} />
    </>
  );
};

export default SlidingSidebar;
