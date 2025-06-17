import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Flame, Shield, Calendar, AlertTriangle } from 'lucide-react';
import FeatureAccess from '@/components/subscription/FeatureAccess';

const StreakSystem: React.FC = () => {
  const { user } = useUserContext();
  const { getStreakInsurance } = useFeatureAccess();
  
  // Get user streak data
  const streak = user?.streak || 14;
  const streakInsurance = user?.streakInsurance || getStreakInsurance();
  
  // Calculate streak multiplier
  const getStreakMultiplier = (streakDays: number) => {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.7;
    if (streakDays >= 7) return 1.5;
    if (streakDays >= 3) return 1.2;
    return 1.0;
  };
  
  const streakMultiplier = getStreakMultiplier(streak);
  
  // Generate the last 7 days (with mock data for now)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - 6 + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    const isCompleted = i < 5; // Mock data: first 5 days completed
    return { day: dayName, date, isCompleted };
  });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flame className="mr-2 h-5 w-5 text-orange-500" />
          Streak System
        </CardTitle>
        <CardDescription>Build and maintain your daily study streak</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white">
              <div className="text-3xl font-bold">{streak}</div>
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              +{streakMultiplier}x SP
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Day Streak</h3>
          <p className="text-muted-foreground mb-4">You're on fire! Keep it up!</p>
          
          <div className="grid grid-cols-7 gap-2 w-full mb-6">
            {last7Days.map((day, i) => (
              <div 
                key={i} 
                className={`h-12 rounded-md flex items-center justify-center ${
                  day.isCompleted 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {day.day}
              </div>
            ))}
          </div>
          
          <FeatureAccess featureKey="streak_insurance">
            <div className="bg-muted p-4 rounded-lg text-center w-full">
              <div className="text-xl font-bold text-orange-500 mb-1 flex items-center justify-center">
                <Shield className="h-5 w-5 mr-2" />
                Streak Insurance
              </div>
              <div className="text-sm text-muted-foreground">
                You have {streakInsurance} streak insurance token{streakInsurance !== 1 ? 's' : ''}
              </div>
              <Button variant="outline" size="sm" className="mt-2">Use Insurance</Button>
            </div>
          </FeatureAccess>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Streak Benefits</h3>
          
          <div className="space-y-2">
            <div className={`p-3 rounded-lg flex justify-between items-center ${streak >= 3 ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900' : 'bg-muted'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${streak >= 3 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                  <span>3</span>
                </div>
                <span className="font-medium">3-Day Streak</span>
              </div>
              <div className="text-sm font-bold">1.2x SP</div>
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center ${streak >= 7 ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900' : 'bg-muted'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${streak >= 7 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                  <span>7</span>
                </div>
                <span className="font-medium">7-Day Streak</span>
              </div>
              <div className="text-sm font-bold">1.5x SP</div>
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center ${streak >= 14 ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900' : 'bg-muted'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${streak >= 14 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                  <span>14</span>
                </div>
                <span className="font-medium">14-Day Streak</span>
              </div>
              <div className="text-sm font-bold">1.7x SP</div>
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center ${streak >= 30 ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900' : 'bg-muted'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${streak >= 30 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                  <span>30</span>
                </div>
                <span className="font-medium">30-Day Streak</span>
              </div>
              <div className="text-sm font-bold">2.0x SP</div>
            </div>
          </div>
        </div>
        
        {streakInsurance === 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <h3 className="font-medium">No Streak Insurance</h3>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-2">
              Upgrade to Pro or GOAT to get streak insurance tokens and protect your streak!
            </p>
            <Button asChild className="mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <a href="/subscription">Upgrade Now</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakSystem;