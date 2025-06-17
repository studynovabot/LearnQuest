import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUserContext } from '@/context/UserContext';
import FeatureAccess from '@/components/subscription/FeatureAccess';
import { 
  Zap, Trophy, Shield, Star, Award, 
  TrendingUp, Clock, Calendar, Crown
} from 'lucide-react';
import { Link } from 'wouter';

interface XPMultiplierSystemProps {
  className?: string;
}

const XPMultiplierSystem: React.FC<XPMultiplierSystemProps> = ({ className }) => {
  const { user } = useUserContext();
  const isPremium = user?.isPro || false;
  
  // Mock user XP data
  const [userXP, setUserXP] = useState({
    currentXP: 2450,
    level: 12,
    nextLevelXP: 3000,
    streak: 7,
    multiplier: isPremium ? 2 : 1,
    streakShields: isPremium ? 2 : 0,
    dailyXPEarned: 120,
    dailyXPCap: isPremium ? 500 : 200,
    rank: 342,
    totalUsers: 5000
  });
  
  // Calculate percentile
  const percentile = 100 - (userXP.rank / userXP.totalUsers * 100);
  
  // Calculate progress to next level
  const levelProgress = (userXP.currentXP / userXP.nextLevelXP) * 100;
  
  // Recent XP activities (mock data)
  const recentActivities = [
    { action: 'Completed quiz', xp: 50, timestamp: '2 hours ago', multiplied: true },
    { action: 'Answered question', xp: 10, timestamp: '3 hours ago', multiplied: true },
    { action: 'Daily login', xp: 20, timestamp: '5 hours ago', multiplied: false },
    { action: 'Streak bonus', xp: 30, timestamp: '1 day ago', multiplied: false },
    { action: 'Completed lesson', xp: 100, timestamp: '1 day ago', multiplied: true }
  ];
  
  // XP rewards for different actions
  const xpRewards = [
    { action: 'Daily login', xp: 20, premiumXP: 40 },
    { action: 'Answer question', xp: 10, premiumXP: 20 },
    { action: 'Complete quiz', xp: 50, premiumXP: 100 },
    { action: 'Complete lesson', xp: 100, premiumXP: 200 },
    { action: '7-day streak', xp: 100, premiumXP: 200 }
  ];
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Zap className="mr-2 h-5 w-5 text-amber-500" />
          XP & Streak System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* User XP Overview */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                {userXP.level}
              </div>
              <Badge className="absolute -top-2 -right-2 bg-indigo-500">
                <Star className="h-3 w-3 mr-1 fill-white" />
                <span>Level</span>
              </Badge>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Level Progress</span>
                <span className="text-sm">{userXP.currentXP} / {userXP.nextLevelXP} XP</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  <TrendingUp className="h-3 w-3" />
                  <span>Rank #{userXP.rank}</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                  <Trophy className="h-3 w-3" />
                  <span>Top {percentile.toFixed(1)}%</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  <Calendar className="h-3 w-3" />
                  <span>{userXP.streak}-Day Streak</span>
                </Badge>
              </div>
            </div>
          </div>
          
          {/* XP Multiplier for Premium */}
          <FeatureAccess 
            featureKey="xp_multiplier"
            teaser={!isPremium}
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center">
                  <Crown className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>Premium XP Boosts</span>
                </h3>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>2x XP</span>
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>XP Multiplier</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {userXP.multiplier}x (Premium)
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Daily XP Cap</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {userXP.dailyXPEarned} / {userXP.dailyXPCap} XP
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Streak Shields</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {userXP.streakShields} remaining
                  </span>
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Premium users earn 2x XP for all activities, have a higher daily XP cap, 
                    and get streak shields to protect their streak if they miss a day.
                  </p>
                </div>
              </div>
            </div>
          </FeatureAccess>
          
          {/* XP Rewards Table */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <Award className="h-4 w-4 mr-2 text-amber-500" />
              <span>XP Rewards</span>
            </h3>
            
            <div className="space-y-2">
              {xpRewards.map((reward, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                >
                  <span className="text-sm">{reward.action}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{reward.xp} XP</span>
                    
                    {isPremium && (
                      <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500">
                        {reward.premiumXP} XP
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span>Recent Activity</span>
            </h3>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center">
                    <span className="text-sm">{activity.action}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {activity.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">+{activity.xp} XP</span>
                    
                    {activity.multiplied && isPremium && (
                      <Badge className="ml-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                        2x
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Upgrade CTA for non-premium users */}
          {!isPremium && (
            <div className="pt-2">
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Link href="/subscription">
                  <Shield className="h-4 w-4 mr-2" />
                  Upgrade for 2x XP & Streak Shields
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default XPMultiplierSystem;