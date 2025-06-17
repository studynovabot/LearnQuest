import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/premium/PremiumCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medal, Trophy, Users, Crown, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  previousRank: number;
  level: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, className }) => {
  const [timeframe, setTimeframe] = React.useState('weekly');
  
  // Sort users by points
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  
  // Get top 3 users
  const topUsers = sortedUsers.slice(0, 3);
  
  // Get remaining users
  const remainingUsers = sortedUsers.slice(3);
  
  // Get rank change indicator
  const getRankChange = (user: LeaderboardUser) => {
    const diff = user.previousRank - user.rank;
    
    if (diff > 0) {
      return (
        <div className="flex items-center text-emerald-500">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span className="text-xs">{diff}</span>
        </div>
      );
    } else if (diff < 0) {
      return (
        <div className="flex items-center text-rose-500">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span className="text-xs">{Math.abs(diff)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="h-3 w-3 mr-1" />
          <span className="text-xs">0</span>
        </div>
      );
    }
  };

  return (
    <PremiumCard className={cn("overflow-hidden", className)}>
      <div className="p-8 border-b border-border/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Trophy className="h-6 w-6 mr-3 text-amber-500" />
            Leaderboard
          </h2>
          
          <Tabs defaultValue="weekly" value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <p className="text-muted-foreground">
          See how you rank against other learners. Earn more points to climb the leaderboard!
        </p>
      </div>
      
      {/* Top 3 Users */}
      <div className="p-8 bg-muted/20">
        <div className="flex justify-center items-end gap-4 mb-8">
          {topUsers.map((user, index) => {
            // Determine position (2nd, 1st, 3rd)
            const position = index === 0 ? 1 : index === 1 ? 0 : 2;
            const sizes = ['h-24 w-24', 'h-32 w-32', 'h-20 w-20'];
            const heights = ['h-24', 'h-32', 'h-20'];
            const medals = [
              <Medal key="silver" className="h-8 w-8 text-gray-400" />,
              <Crown key="gold" className="h-10 w-10 text-amber-500" />,
              <Medal key="bronze" className="h-7 w-7 text-amber-700" />
            ];
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: position * 0.1 }}
                className={cn(
                  "flex flex-col items-center",
                  user.isCurrentUser && "text-primary"
                )}
              >
                <div className="relative mb-2">
                  <Avatar className={cn(
                    sizes[position],
                    "border-4",
                    user.isCurrentUser ? "border-primary" : "border-background"
                  )}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-background rounded-full p-1">
                    {medals[position]}
                  </div>
                </div>
                
                <div className={cn(
                  heights[position],
                  "flex flex-col items-center justify-end"
                )}>
                  <p className={cn(
                    "font-semibold truncate max-w-[100px] text-center",
                    user.isCurrentUser ? "text-primary" : "text-foreground"
                  )}>
                    {user.name}
                  </p>
                  
                  <div className="flex items-center mt-1">
                    {Array.from({ length: user.level }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  
                  <p className="text-sm font-medium mt-1">
                    {user.points} pts
                  </p>
                  
                  <div className="mt-1">
                    {getRankChange(user)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Remaining Users */}
      <div className="p-8">
        <h3 className="text-lg font-semibold mb-6">Rankings</h3>
        
        <div className="space-y-4">
          {remainingUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex items-center p-4 rounded-xl border border-border/30",
                user.isCurrentUser ? "bg-primary/5 border-primary/30" : "bg-card/50"
              )}
            >
              <div className="w-8 font-bold text-center mr-4">
                {user.rank}
              </div>
              
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  user.isCurrentUser ? "text-primary" : "text-foreground"
                )}>
                  {user.name}
                </p>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {Array.from({ length: user.level }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <p className="font-medium mr-3">{user.points} pts</p>
                {getRankChange(user)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};

export default Leaderboard;