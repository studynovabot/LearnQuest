import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  FlashlightIcon,
  HomeIcon,
  MessageIcon,
  ChartIcon,
  TrophyIcon,
  StoreIcon,
  CreditCardIcon,
  SettingsIcon,
  BookOpenIcon,
  GitBranchIcon,
  FileTextIcon,
  ImageIcon,
  SparklesIcon
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
    { icon: ChartIcon, path: "/leaderboard", active: location === "/leaderboard" },
    { icon: TrophyIcon, path: "/tasks", active: location === "/tasks" },
    { icon: StoreIcon, path: "/store", active: location === "/store" },
    { icon: CreditCardIcon, path: "/subscription", active: location === "/subscription" },
  ];

  return (
    <div className="hidden lg:block w-20 bg-card rounded-2xl p-4 flex flex-col items-center space-y-8 h-fit sticky top-6">
      <Link href="/">
        <div className="flex items-center justify-center w-12 h-12 cursor-pointer hover:scale-105 transition-transform">
          <NovaLogo size="md" iconOnly={true} />
        </div>
      </Link>

      <nav className="flex flex-col space-y-6 items-center flex-grow">
        {navItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <button
              className={cn(
                "nav-icon rounded-xl p-2",
                item.active ? "bg-muted text-secondary" : ""
              )}
            >
              <item.icon size={24} />
            </button>
          </Link>
        ))}
      </nav>

      <Link href="/settings">
        <button className={cn(
          "nav-icon rounded-xl p-2",
          location === "/settings" ? "bg-muted text-secondary" : ""
        )}>
          <SettingsIcon size={24} />
        </button>
      </Link>
    </div>
  );
};

export default Sidebar;
