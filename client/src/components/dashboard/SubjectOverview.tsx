import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "@/components/ui/premium-card";
import { PremiumProgress, PremiumProgressCard } from "@/components/ui/premium-progress";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { cn, getStatusColor } from "@/lib/utils";
import { Subject } from "@/types";
import { useUserContext } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  CalculatorIcon,
  FlaskIcon,
  BookIcon,
  LandmarkIcon,
  TrendingUpIcon,
  BarChartIcon
} from "@/components/ui/icons";

const SubjectOverview = () => {
  const { user } = useUserContext();

  // Enhanced subjects data with icons and colors
  const subjects: (Subject & { icon: React.ReactNode; color: "primary" | "secondary" | "success" | "warning" | "danger" })[] = [
    {
      id: 1,
      name: "Mathematics",
      progress: 75,
      status: "good",
      icon: <CalculatorIcon size={20} />,
      color: "primary"
    },
    {
      id: 2,
      name: "Science",
      progress: 60,
      status: "average",
      icon: <FlaskIcon size={20} />,
      color: "success"
    },
    {
      id: 3,
      name: "English",
      progress: 85,
      status: "excellent",
      icon: <BookIcon size={20} />,
      color: "secondary"
    },
    {
      id: 4,
      name: "History",
      progress: 45,
      status: "needs_improvement",
      icon: <LandmarkIcon size={20} />,
      color: "warning"
    },
  ];
  const isLoading = false;

  const getStatusText = (status: string): string => {
    if (!status) return 'Unknown';
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + (word || '').slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <PremiumCard variant="glass" glow={true}>
        <PremiumCardHeader>
          <PremiumCardTitle>
            <Skeleton className="h-6 w-40" />
          </PremiumCardTitle>
        </PremiumCardHeader>
        <PremiumCardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex justify-between text-sm mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </motion.div>
          ))}
          <Skeleton className="h-12 w-full mt-6 rounded-xl" />
        </PremiumCardContent>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard variant="glass" glow={true} className="overflow-hidden">
      <PremiumCardHeader>
        <PremiumCardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent flex items-center gap-2">
          <TrendingUpIcon size={24} className="text-primary" />
          Subject Overview
        </PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent className="space-y-6">
        {!Array.isArray(subjects) || subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground py-8 glass-card rounded-xl p-6"
          >
            <BarChartIcon size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No subjects available.</p>
            <p className="text-sm mt-2">Start learning to track your progress!</p>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-4">
              {subjects.map((subject, index: number) => (
                <motion.div
                  key={`${subject.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="glass-card p-4 rounded-xl hover:shadow-premium transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        subject.color === "primary" && "bg-blue-500/20 text-blue-500",
                        subject.color === "secondary" && "bg-purple-500/20 text-purple-500",
                        subject.color === "success" && "bg-green-500/20 text-green-500",
                        subject.color === "warning" && "bg-yellow-500/20 text-yellow-500",
                        subject.color === "danger" && "bg-red-500/20 text-red-500"
                      )}>
                        {subject.icon}
                      </div>
                      <span className="font-semibold">{subject.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {getStatusText(subject.status || 'unknown')}
                    </span>
                  </div>

                  <PremiumProgress
                    value={subject.progress || 0}
                    color={subject.color}
                    variant="gradient"
                    size="md"
                    showValue={true}
                    animated={true}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GradientButton
                gradient="primary"
                className="w-full shadow-glow"
                size="lg"
              >
                <BarChartIcon size={18} className="mr-2" />
                View Detailed Analysis
              </GradientButton>
            </motion.div>
          </>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
};

export default SubjectOverview;
