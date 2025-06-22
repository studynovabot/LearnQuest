import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  HomeIcon,
  MessageIcon,
  FlashlightIcon,
  BookOpenIcon,
  BookIcon,
  ImageIcon,
  SparklesIcon,
  UploadIcon,
  CreditCardIcon,
  SettingsIcon,
  HashIcon
} from "@/components/ui/icons";

interface FloatingNavProps {
  className?: string;
  variant?: "top" | "bottom";
  show?: boolean;
}

const FloatingNav: React.FC<FloatingNavProps> = ({
  className,
  variant = "bottom",
  show = true
}) => {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = React.useState(show);

  // Navigation items
  const navItems = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: BookOpenIcon, label: "NCERT Solutions", path: "/ncert-solutions" },
    { icon: ImageIcon, label: "Image Tools", path: "/image-tools" },
    { icon: MessageIcon, label: "AI Chat", path: "/chat" },
  ];

  // Auto-hide on scroll for bottom variant
  React.useEffect(() => {
    if (variant !== "bottom") return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      setIsVisible(scrollY < lastScrollY || scrollY < 100);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", requestTick);
    return () => window.removeEventListener("scroll", requestTick);
  }, [variant]);

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: variant === "top" ? -20 : 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: variant === "top" ? -20 : 20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const positionClasses = variant === "top"
    ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    : "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(positionClasses, className)}
        >
          <div className="glass-card-strong rounded-full px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center space-x-2">
              {navItems.map((item, index) => {
                const isActive = location === item.path;

                return (
                  <motion.div
                    key={item.path}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={item.path}>
                      <button
                        className={cn(
                          "relative p-3 rounded-full transition-all duration-300 group",
                          "hover:bg-white/10 active:scale-95",
                          isActive
                            ? "bg-primary/20 text-primary shadow-glow"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={item.label}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}

                        {/* Icon */}
                        <div className="relative z-10">
                          <item.icon
                            size={20}
                            className={cn(
                              "transition-all duration-300",
                              isActive && "drop-shadow-sm"
                            )}
                          />
                        </div>

                        {/* Hover tooltip */}
                        <div className={cn(
                          "absolute -top-12 left-1/2 transform -translate-x-1/2",
                          "bg-black/80 text-white text-xs px-2 py-1 rounded-md",
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                          "pointer-events-none whitespace-nowrap",
                          variant === "bottom" ? "-top-12" : "top-12"
                        )}>
                          {item.label}
                          <div className={cn(
                            "absolute left-1/2 transform -translate-x-1/2 w-0 h-0",
                            "border-l-4 border-r-4 border-transparent",
                            variant === "bottom"
                              ? "top-full border-t-4 border-t-black/80"
                              : "bottom-full border-b-4 border-b-black/80"
                          )} />
                        </div>
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Floating animation background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 animate-pulse-subtle -z-10" />
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export { FloatingNav };
