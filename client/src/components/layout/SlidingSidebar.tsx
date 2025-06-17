import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import NovaLogo from "@/components/ui/NovaLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin, shouldShowAdminFeature, ADMIN_FEATURES } from "@/lib/adminConfig";
import {
  HomeIcon,
  MessageIcon,
  BookOpenIcon,
  ImageIcon,
  SparklesIcon,
  UploadIcon,
  CreditCardIcon,
  PaletteIcon,
  DatabaseIcon,
  ShieldIcon,
  SettingsIcon,
  BookIcon,
  UserIcon,
  HashIcon,
  UsersIcon
} from "@/components/ui/icons";

interface SlidingSidebarProps {
  className?: string;
}

const SlidingSidebar: React.FC<SlidingSidebarProps> = ({ className }) => {
  const [location] = useLocation();
  const { user } = useAuth();

  // Check if current user is admin
  const userIsAdmin = isAdmin(user?.email) || user?.role === 'admin';

  // Complete navigation items
  const navigationItems = [
    {
      icon: HomeIcon,
      label: "Home",
      path: "/",
    },
    {
      icon: BookOpenIcon,
      label: "NCERT Solutions",
      path: "/ncert-solutions",
    },
    {
      icon: ImageIcon,
      label: "Image Tools",
      path: "/image-tools",
    },
    {
      icon: MessageIcon,
      label: "AI Chat",
      path: "/chat",
    },
    {
      icon: PaletteIcon,
      label: "Themes",
      path: "/themes",
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      path: "/settings",
    },
  ];

  // Admin-only navigation items
  const adminNavigationItems = [
    {
      icon: DatabaseIcon,
      label: "Vector Database",
      path: "/vector-upload",
      description: "Vector DB Editing",
      adminOnly: true,
      feature: ADMIN_FEATURES.VECTOR_UPLOAD
    },
    {
      icon: UploadIcon,
      label: "Content Manager",
      path: "/content-manager",
      description: "File Management",
      adminOnly: true,
      feature: ADMIN_FEATURES.CONTENT_MODERATION
    },
    {
      icon: UserIcon,
      label: "Admin Users",
      path: "/admin-users",
      description: "User Management",
      adminOnly: true,
      feature: ADMIN_FEATURES.USER_MANAGEMENT
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
          {/* Regular Navigation Items */}
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
                  </div>
                </button>
              </Link>
            );
          })}

          {/* Admin Section Separator */}
          {userIsAdmin && (
            <div className="py-2">
              <div className="border-t border-border/50 my-2"></div>
              <div className="overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">
                <div className="flex items-center gap-2 px-3 py-1">
                  <ShieldIcon size={14} className="text-orange-500" />

                  <span className="text-xs font-medium text-orange-500 whitespace-nowrap">
                    Admin Tools
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin-Only Navigation Items */}
          {userIsAdmin && adminNavigationItems.map((item) => {
            if (!shouldShowAdminFeature(user?.email || '', item.feature)) return null;

            const isActive = location === item.path;
            const IconComponent = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={cn(
                    // Base styles
                    "w-full flex items-center gap-3 p-3 rounded-lg",
                    "transition-all duration-200 group/item",
                    // Admin styling
                    "border border-orange-200/50 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800/50",
                    // Hover effects
                    "hover:bg-orange-100/50 hover:scale-[1.02] dark:hover:bg-orange-900/30",
                    // Active state
                    isActive
                      ? "bg-orange-100 text-orange-700 border-orange-300 shadow-sm dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                      : "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <IconComponent
                      size={20}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-orange-700 dark:text-orange-300" : "text-current"
                      )}
                    />
                  </div>

                  {/* Label - Visible on sidebar hover */}
                  <div className="overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isActive ? "text-orange-700 dark:text-orange-300" : "text-current"
                    )}>
                      {item.label}
                    </span>
                    <p className="text-xs text-orange-500/70 whitespace-nowrap dark:text-orange-400/70">
                      {item.description}
                    </p>
                  </div>

                  {/* Admin Badge */}
                  <div className="overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[50px] ml-auto">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
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
