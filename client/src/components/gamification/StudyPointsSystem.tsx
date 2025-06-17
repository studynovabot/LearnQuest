import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Zap, Award, Target, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const StudyPointsSystem: React.FC = () => {
  const { user } = useUserContext();
  const { getDailySPCap, getSPMultiplier } = useFeatureAccess();
  
  // Calculate user level based on study points
  const studyPoints = user?.studyPoints || 0;
  const level = Math.floor(studyPoints / 500) + 1;
  const nextLevelPoints = level * 500;
  const pointsToNextLevel = nextLevelPoints - studyPoints;
  const progress = (studyPoints % 500) / 500 * 100;
  
  // Get daily SP cap and multiplier based on subscription
  const dailySPCap = getDailySPCap();
  const spMultiplier = getSPMultiplier();
  
  // Daily SP earned (mock data for now)
  const dailySPEarned = user?.dailySPEarned || 120;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-amber-500" />
          Study Points System
        </CardTitle>
        <CardDescription>Earn Study Points (SP) for every activity you complete</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white">
              <div className="text-3xl font-bold">{studyPoints.toLocaleString()}</div>
            </div>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Level {level}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Your Study Points</h3>
          <p className="text-muted-foreground mb-4">{pointsToNextLevel} SP until Level {level + 1}</p>
          <div className="w-full mb-6">
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-500">{dailySPEarned}</div>
              <div className="text-xs text-muted-foreground">Today's SP</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-500">{dailySPCap}</div>
              <div className="text-xs text-muted-foreground">Daily Cap</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">How to Earn Study Points</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start p-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Complete Quizzes</h4>
                <p className="text-xs text-muted-foreground">10-50 SP per quiz based on score</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Ask AI Questions</h4>
                <p className="text-xs text-muted-foreground">5 SP per question asked</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Daily Streak</h4>
                <p className="text-xs text-muted-foreground">10-30 SP based on streak length</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Study Sessions</h4>
                <p className="text-xs text-muted-foreground">5 SP per 5 minutes of study time</p>
              </div>
            </div>
          </div>
        </div>
        
        {spMultiplier > 1 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-amber-500" />
                <h3 className="font-medium">GOAT Multiplier Active</h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-sm font-bold">
                      {spMultiplier}x
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>All SP earnings are multiplied by {spMultiplier}x with your GOAT subscription</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-2">
              Your GOAT subscription gives you a {spMultiplier}x multiplier on all Study Points earned!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyPointsSystem;