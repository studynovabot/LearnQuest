import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import NovaLogo from "@/components/ui/NovaLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle";
import {
  HomeIcon,
  MessageIcon,
  FlashlightIcon,
  BookOpenIcon,
  ImageIcon,
  SparklesIcon,
  UploadIcon,
  CreditCardIcon,
  PaletteIcon
} from "@/components/ui/icons";

interface SlidingSidebarProps {
  className?: string;
}

const SlidingSidebar: React.FC<SlidingSidebarProps> = ({ className }) => {
  const [location] = useLocation();

  // Complete navigation items
  const navigationItems = [
    {
      icon: HomeIcon,
      label: "Home",
      path: "/",
      description: "Dashboard"
    },
    {
      icon: MessageIcon,
      label: "Chat",
      path: "/chat",
      description: "AI Tutors"
    },
    {
      icon: FlashlightIcon,
      label: "Flash Notes",
      path: "/flash-notes",
      description: "Quick Notes"
    },
    {
      icon: BookOpenIcon,
      label: "NCERT Solutions",
      path: "/ncert-solutions",
      description: "Study Materials"
    },
    {
      icon: ImageIcon,
      label: "Image Tools",
      path: "/image-tools",
      description: "OCR & Generation"
    },
    {
      icon: SparklesIcon,
      label: "Personalized Agent",
      path: "/personalized-agent",
      description: "AI Assistant"
    },
    {
      icon: UploadIcon,
      label: "Content Manager",
      path: "/content-manager",
      description: "File Management"
    },
    {
      icon: PaletteIcon,
      label: "Themes",
      path: "/themes",
      description: "Customize UI"
    },
    {
      icon: CreditCardIcon,
      label: "Subscription",
      path: "/subscription",
      description: "Premium Plans"
    }
  ];

  return (
    <aside
      className={cn(
        // Base layout
        "fixed left-0 top-0 h-screen z-50",
        "w-20 hover:w-64 transition-all duration-300 ease-in-out",
        // Styling
        "bg-card/95 backdrop-blur-xl border-r border-border",
        "shadow-xl overflow-hidden",
        // Flex layout
        "flex flex-col",
        "group",
        className
      )}
    >
      {/* Header Section */}
      <div className="flex items-center p-4 border-b border-border/50">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo - Always visible */}
          <div className="flex-shrink-0">
            <NovaLogo size="sm" iconOnly={true} />
          </div>
          
          {/* Text - Visible on hover */}
          <div className="overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">
            <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
              Nova AI
            </h1>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Your AI Study Buddy
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            const IconComponent = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={cn(
                    // Base styles
                    "w-full flex items-center gap-3 p-3 rounded-lg",
                    "transition-all duration-200 group/item",
                    // Hover effects
                    "hover:bg-muted/50 hover:scale-[1.02]",
                    // Active state
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <IconComponent
                      size={20}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-primary" : "text-current"
                      )}
                    />
                  </div>

                  {/* Label - Visible on sidebar hover */}
                  <div className="overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isActive ? "text-primary" : "text-current"
                    )}>
                      {item.label}
                    </span>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.description}
                    </p>
                  </div>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggleCompact />
          </div>
          
          {/* Label - Visible on hover */}
          <div className="overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Toggle Theme
            </span>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Switch appearance
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SlidingSidebar;
