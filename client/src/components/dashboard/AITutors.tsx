import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "@/components/ui/premium-card";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import {
  RobotIcon,
  UserIcon,
  CompassIcon,
  SmileIcon,
  CalculatorIcon,
  LanguagesIcon,
  LockIcon,
  FlaskIcon,
  BookIcon,
  LandmarkIcon,
  CodeIcon,
  PaletteIcon,
  LeafIcon,
  BrainIcon,
  TrendingUpIcon,
  GlobeIcon,
  FlexIcon,
  BookOpenIcon,
  SparklesIcon
} from "@/components/ui/icons";
import { useChat } from "@/hooks/useChat";
import { AITutor } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { motion } from "framer-motion";

const AITutors = () => {
  const { agents, unlockedAgents, lockedAgents, isLoading } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlockingId, setUnlockingId] = useState<string | null>(null);



  const getAgentIcon = (iconName?: string, size = 24) => {
    switch (iconName) {
      case 'user': return <UserIcon size={size} />;
      case 'robot': return <RobotIcon size={size} />;
      case 'compass': return <CompassIcon size={size} />;
      case 'smile': return <SmileIcon size={size} />;
      case 'calculator': return <CalculatorIcon size={size} />;
      case 'languages': return <LanguagesIcon size={size} />;
      case 'flask': return <FlaskIcon size={size} />;
      case 'book': return <BookIcon size={size} />;
      case 'landmark': return <LandmarkIcon size={size} />;
      case 'code': return <CodeIcon size={size} />;
      case 'palette': return <PaletteIcon size={size} />;
      case 'leaf': return <LeafIcon size={size} />;
      case 'brain': return <BrainIcon size={size} />;
      case 'trending-up': return <TrendingUpIcon size={size} />;
      case 'globe': return <GlobeIcon size={size} />;
      case 'flex': return <FlexIcon size={size} />;
      case 'book-open': return <BookOpenIcon size={size} />;
      case 'sparkles': return <SparklesIcon size={size} />;
      default: return <RobotIcon size={size} />;
    }
  };

  const getAgentColorClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'gradient-blue';
      case 'purple': return 'gradient-purple';
      case 'green': return 'gradient-green';
      case 'orange': return 'gradient-orange';
      case 'amber': return 'gradient-warning';
      case 'cyan': return 'gradient-success';
      case 'pink': return 'gradient-secondary';
      case 'emerald': return 'gradient-green';
      case 'indigo': return 'gradient-purple';
      case 'violet': return 'gradient-purple';
      case 'red': return 'gradient-secondary';
      case 'teal': return 'gradient-success';
      case 'yellow': return 'gradient-warning';
      case 'slate': return 'gradient-primary';
      case 'rose': return 'gradient-secondary';
      default: return 'gradient-primary';
    }
  };

  const getGlowClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'glow-blue';
      case 'green': return 'glow-green';
      case 'orange': return 'glow-orange';
      default: return 'glow';
    }
  };

  const handleUnlockAgent = async (agent: AITutor) => {
    toast({
      title: "Unlock Not Available",
      description: "Unlocking agents is not implemented.",
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <PremiumCard variant="glass" glow={true}>
        <PremiumCardHeader>
          <PremiumCardTitle>
            <Skeleton className="h-6 w-24" />
          </PremiumCardTitle>
        </PremiumCardHeader>
        <PremiumCardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-4 flex flex-col items-center"
              >
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-4 w-16" />
              </motion.div>
            ))}
          </div>
        </PremiumCardContent>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard variant="glass" glow={true} className="overflow-hidden">
      <PremiumCardHeader>
        <PremiumCardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          AI Tutors
        </PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Unlocked Agents */}
          {unlockedAgents.map((agent: AITutor, index: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/chat">
                <div className={cn(
                  "premium-card p-4 flex flex-col items-center cursor-pointer",
                  "hover:shadow-premium-lg transition-all duration-300",
                  getGlowClass(agent.color)
                )}>
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                  {/* Icon container with gradient */}
                  <div className={cn(
                    "w-16 h-16 rounded-full mb-3 flex items-center justify-center overflow-hidden relative",
                    "shadow-premium hover:shadow-glow transition-all duration-300",
                    getAgentColorClass(agent.color)
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    <div className="relative z-10 text-white">
                      {getAgentIcon(agent.iconName, 32)}
                    </div>
                  </div>

                  <span className="font-semibold text-center relative z-10 text-sm leading-tight">
                    {agent.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Locked Agents */}
          {lockedAgents.map((agent: AITutor, index: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: (unlockedAgents.length + index) * 0.1, duration: 0.3 }}
              className="relative"
            >
              <div className="premium-card p-4 flex flex-col items-center transition-all duration-300 opacity-60 hover:opacity-80">
                {/* Locked overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/10 rounded-2xl backdrop-blur-sm"></div>

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 mb-3 flex items-center justify-center overflow-hidden shadow-premium relative z-10">
                  <LockIcon size={32} className="text-white" />
                </div>

                <span className="font-semibold text-center relative z-10 text-sm leading-tight mb-1">
                  {agent.name}
                </span>
                <span className="text-xs text-muted-foreground mb-2 relative z-10">Available</span>

                <GlassButton
                  size="sm"
                  onClick={() => handleUnlockAgent(agent)}
                  disabled={true}
                  className="relative z-10"
                >
                  Unlock
                </GlassButton>
              </div>
            </motion.div>
          ))}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
};

export default AITutors;
