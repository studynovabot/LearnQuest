import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  FlashlightIcon,
  HomeIcon,
  MessageIcon,
  CreditCardIcon,
  SettingsIcon,
  BookOpenIcon,
  GitBranchIcon,
  ImageIcon,
  SparklesIcon,
  UploadIcon
} from "@/components/ui/icons";
import NovaLogo from "@/components/ui/NovaLogo";

const Sidebar = () => {
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    { icon: HomeIcon, path: "/", active: location === "/" },
    { icon: MessageIcon, path: "/chat", active: location === "/chat" },
    { icon: FlashlightIcon, path: "/flash-notes", active: location === "/flash-notes" },
    { icon: GitBranchIcon, path: "/flow-charts", active: location === "/flow-charts" },
    { icon: BookOpenIcon, path: "/ncert-solutions", active: location === "/ncert-solutions" },
    { icon: ImageIcon, path: "/image-tools", active: location === "/image-tools" },
    { icon: SparklesIcon, path: "/personalized-agent", active: location === "/personalized-agent" },
    { icon: UploadIcon, path: "/content-manager", active: location === "/content-manager" },
    { icon: CreditCardIcon, path: "/subscription", active: location === "/subscription" },
  ];

  return (
    <div className="hidden lg:block w-20 glass-card-strong rounded-2xl p-4 flex flex-col items-center space-y-8 h-fit sticky top-6 shadow-premium">
      <Link href="/">
        <div className="flex items-center justify-center w-12 h-12 cursor-pointer hover:scale-110 transition-all duration-300 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-subtle"></div>
          <NovaLogo size="md" iconOnly={true} className="relative z-10" />
        </div>
      </Link>

      <nav className="flex flex-col space-y-6 items-center flex-grow">
        {navItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <button
              className={cn(
                "nav-icon rounded-xl p-3 transition-all duration-300 relative group",
                "hover:shadow-glow hover:scale-110",
                item.active
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-glow"
                  : "text-muted-foreground hover:text-primary glass-card"
              )}
            >
              {/* Active indicator with animation */}
              {item.active && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl animate-pulse-subtle"></div>
              )}

              {/* Icon with glow effect */}
              <div className="relative z-10">
                <item.icon
                  size={24}
                  className={cn(
                    "transition-all duration-300",
                    item.active && "drop-shadow-sm filter"
                  )}
                />
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </Link>
        ))}
      </nav>

      <Link href="/settings">
        <button className={cn(
          "nav-icon rounded-xl p-2 transition-colors",
          location === "/settings"
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-foreground hover:text-primary"
        )}>
          <SettingsIcon size={24} />
        </button>
      </Link>
    </div>
  );
};

export default Sidebar;
