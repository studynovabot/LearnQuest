import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  Trophy, 
  Upload, 
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'question_answered' | 'streak' | 'challenge_completed' | 'upvote_received' | 'material_shared' | 'quiz_completed' | 'study_session' | 'rank_up';
  points: number;
  description: string;
  timestamp: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'question_answered':
      return <MessageSquare className="h-5 w-5" />;
    case 'streak':
      return <Zap className="h-5 w-5" />;
    case 'challenge_completed':
      return <CheckCircle className="h-5 w-5" />;
    case 'upvote_received':
      return <ThumbsUp className="h-5 w-5" />;
    case 'material_shared':
      return <Upload className="h-5 w-5" />;
    case 'quiz_completed':
      return <HelpCircle className="h-5 w-5" />;
    case 'study_session':
      return <Clock className="h-5 w-5" />;
    case 'rank_up':
      return <Trophy className="h-5 w-5" />;
    default:
      return <Star className="h-5 w-5" />;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'question_answered':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'streak':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'challenge_completed':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'upvote_received':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'material_shared':
      return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'quiz_completed':
      return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
    case 'study_session':
      return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
    case 'rank_up':
      return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

interface PointsActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const PointsActivity: React.FC<PointsActivityProps> = ({ activities, className }) => {
  // Calculate total points
  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0);
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PremiumCard className={cn("overflow-hidden", className)}>
      <div className="p-8 border-b border-border/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Zap className="h-6 w-6 mr-3 text-amber-500" />
            Points Activity
          </h2>
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {totalPoints} Total Points
          </span>
        </div>
        
        <p className="text-muted-foreground">
          Track your learning progress and see how you're earning points. Complete more activities to increase your rank!
        </p>
      </div>
      
      <div className="p-8">
        <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
        
        <div className="space-y-5">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center p-4 rounded-xl border border-border/30 bg-card/50"
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg mr-4",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{activity.description}</p>
                <p className="text-sm text-muted-foreground">{formatTime(activity.timestamp)}</p>
              </div>
              
              <div className="flex items-center justify-center px-3 py-1 bg-primary/10 text-primary rounded-full font-medium ml-4">
                +{activity.points} pts
              </div>
            </motion.div>
          ))}
        </div>
        
        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No activity recorded yet</p>
            <p className="text-sm text-muted-foreground">Complete learning activities to start earning points</p>
          </div>
        )}
      </div>
    </PremiumCard>
  );
};

export default PointsActivity;