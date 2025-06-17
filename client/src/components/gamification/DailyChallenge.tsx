import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Flame, 
  Gift, 
  HelpCircle, 
  MessageSquare, 
  Target, 
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'streak';
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresIn?: string;
}

interface DailyChallengeProps {
  challenges: Challenge[];
  streak: number;
  className?: string;
}

const ChallengeItem: React.FC<Challenge> = ({
  title,
  description,
  type,
  points,
  progress,
  target,
  completed,
  expiresIn
}) => {
  const progressPercentage = Math.round((progress / target) * 100);
  
  const getIcon = () => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-5 w-5" />;
      case 'weekly':
        return <Target className="h-5 w-5" />;
      case 'streak':
        return <Flame className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };
  
  const getColor = () => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'weekly':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'streak':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-6 rounded-xl border border-border/30",
        completed ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30" : "bg-card/50"
      )}
    >
      <div className="flex items-start">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg mr-4 flex-shrink-0",
          completed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : getColor()
        )}>
          {completed ? <CheckCircle className="h-5 w-5" /> : getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium ml-2">
              <Gift className="h-4 w-4 mr-1" />
              {points} pts
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress} of {target} completed</span>
              {expiresIn && !completed && (
                <span className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Expires in {expiresIn}
                </span>
              )}
            </div>
            
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2",
                completed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted/50"
              )}
            />
          </div>
          
          {completed && (
            <div className="mt-3 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-1" />
              Challenge completed!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DailyChallenge: React.FC<DailyChallengeProps> = ({ challenges, streak, className }) => {
  // Calculate completed challenges
  const completedChallenges = challenges.filter(c => c.completed).length;
  
  // Calculate total available points
  const totalAvailablePoints = challenges.reduce((sum, challenge) => sum + challenge.points, 0);
  
  // Calculate earned points
  const earnedPoints = challenges
    .filter(c => c.completed)
    .reduce((sum, challenge) => sum + challenge.points, 0);

  return (
    <PremiumCard className={cn("overflow-hidden", className)}>
      <div className="p-8 border-b border-border/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Target className="h-6 w-6 mr-3 text-primary" />
            Daily Challenges
          </h2>
          
          <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full">
            <Flame className="h-5 w-5 mr-2" />
            <span className="font-semibold">{streak} Day Streak</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            Complete challenges to earn points and increase your rank!
          </p>
          
          <div className="text-sm font-medium">
            {completedChallenges} of {challenges.length} completed
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{earnedPoints} / {totalAvailablePoints} points</span>
        </div>
        
        <Progress 
          value={(completedChallenges / challenges.length) * 100} 
          className="h-2 mt-2"
        />
      </div>
      
      <div className="p-8">
        <div className="space-y-5">
          {challenges.map(challenge => (
            <ChallengeItem key={challenge.id} {...challenge} />
          ))}
        </div>
        
        {challenges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No challenges available</p>
            <p className="text-sm text-muted-foreground">Check back tomorrow for new challenges</p>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button className="px-8 py-6 rounded-xl text-base">
            <Zap className="h-5 w-5 mr-2" />
            Get More Challenges
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
};

export default DailyChallenge;