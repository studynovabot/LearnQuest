import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Crown, Medal, Zap, BookOpen, Brain, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankProps {
  name: string;
  level: number;
  icon: React.ReactNode;
  color: string;
  pointsRequired: number;
  isCurrentRank?: boolean;
}

const Rank: React.FC<RankProps> = ({ 
  name, 
  level, 
  icon, 
  color, 
  pointsRequired, 
  isCurrentRank = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center p-6 rounded-2xl border border-border/40 bg-card/50",
        isCurrentRank && "border-primary/30 bg-primary/5 shadow-lg"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-14 h-14 rounded-xl mr-5",
        `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-semibold text-lg",
            isCurrentRank && "text-primary"
          )}>
            {name}
          </h3>
          <span className="text-sm font-medium text-muted-foreground">Level {level}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{pointsRequired} points required</p>
        {isCurrentRank && (
          <div className="flex items-center text-xs text-primary font-medium">
            <Star className="h-3 w-3 mr-1 fill-primary" />
            Current Rank
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface RankingSystemProps {
  currentPoints: number;
  nextRankPoints: number;
  currentRank: string;
  className?: string;
}

const RankingSystem: React.FC<RankingSystemProps> = ({ 
  currentPoints, 
  nextRankPoints, 
  currentRank,
  className
}) => {
  // Calculate progress percentage to next rank
  const progressPercentage = Math.min(Math.round((currentPoints / nextRankPoints) * 100), 100);
  
  // Define all ranks
  const ranks = [
    { name: "Novice Learner", level: 1, icon: <BookOpen className="h-6 w-6" />, color: "blue", pointsRequired: 0 },
    { name: "Knowledge Seeker", level: 2, icon: <Brain className="h-6 w-6" />, color: "indigo", pointsRequired: 100 },
    { name: "Dedicated Scholar", level: 3, icon: <Target className="h-6 w-6" />, color: "purple", pointsRequired: 500 },
    { name: "Subject Expert", level: 4, icon: <Medal className="h-6 w-6" />, color: "amber", pointsRequired: 1000 },
    { name: "Master Mentor", level: 5, icon: <Users className="h-6 w-6" />, color: "emerald", pointsRequired: 2500 },
    { name: "Knowledge Champion", level: 6, icon: <Trophy className="h-6 w-6" />, color: "orange", pointsRequired: 5000 },
    { name: "Learning Legend", level: 7, icon: <Crown className="h-6 w-6" />, color: "rose", pointsRequired: 10000 },
  ];

  return (
    <PremiumCard className={cn("overflow-hidden", className)}>
      <div className="p-8 border-b border-border/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Trophy className="h-6 w-6 mr-3 text-amber-500" />
            Your Learning Rank
          </h2>
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {currentPoints} Points
          </span>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2">{currentRank}</span>
              <div className="flex">
                {Array.from({ length: ranks.find(r => r.name === currentRank)?.level || 1 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentPoints} / {nextRankPoints} points
            </span>
          </div>
          
          <Progress value={progressPercentage} className="h-3 bg-muted/50" />
          
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Current Level</span>
            <span>Next Level</span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-emerald-500" />
            <span>Complete daily challenges to earn more points</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-amber-500" />
            <span>Help others by answering questions to level up faster</span>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <h3 className="text-lg font-semibold mb-6">Ranking Levels</h3>
        <div className="grid gap-4">
          {ranks.map((rank) => (
            <Rank
              key={rank.name}
              {...rank}
              isCurrentRank={rank.name === currentRank}
            />
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};

export default RankingSystem;