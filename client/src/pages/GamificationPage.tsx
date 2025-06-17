import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Link } from 'wouter';
import { Zap, Flame, Trophy, Coins, Crown, Star, Award, Calendar, Target, BarChart } from 'lucide-react';
import FeatureAccess from '@/components/subscription/FeatureAccess';

// Placeholder components - these would be implemented separately
const StudyPointsSystem = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Zap className="mr-2 h-5 w-5 text-amber-500" />
        Study Points System
      </CardTitle>
      <CardDescription>Earn Study Points (SP) for every activity you complete</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white">
            <div className="text-3xl font-bold">2,450</div>
          </div>
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Level 5
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">Your Study Points</h3>
        <p className="text-muted-foreground mb-4">450 SP until Level 6</p>
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full" style={{ width: '47%' }}></div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-500">120</div>
            <div className="text-xs text-muted-foreground">Today's SP</div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-500">500</div>
            <div className="text-xs text-muted-foreground">Daily Cap</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StreakSystem = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Flame className="mr-2 h-5 w-5 text-orange-500" />
        Streak System
      </CardTitle>
      <CardDescription>Build and maintain your daily study streak</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white">
            <div className="text-3xl font-bold">14</div>
          </div>
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            +1.5x SP
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">Day Streak</h3>
        <p className="text-muted-foreground mb-4">You're on fire! Keep it up!</p>
        
        <div className="grid grid-cols-7 gap-2 w-full mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`h-12 rounded-md flex items-center justify-center ${i < 5 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
            </div>
          ))}
        </div>
        
        <FeatureAccess featureKey="streak_insurance">
          <div className="bg-muted p-4 rounded-lg text-center w-full">
            <div className="text-xl font-bold text-orange-500 mb-1">Streak Insurance</div>
            <div className="text-sm text-muted-foreground">You have 1 streak insurance token</div>
            <Button variant="outline" size="sm" className="mt-2">Use Insurance</Button>
          </div>
        </FeatureAccess>
      </div>
    </CardContent>
  </Card>
);

const Leaderboard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Trophy className="mr-2 h-5 w-5 text-amber-500" />
        Leaderboard
      </CardTitle>
      <CardDescription>See how you rank against other students</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-xs">Daily</Button>
            <Button variant="default" size="sm" className="text-xs">Weekly</Button>
            <Button variant="outline" size="sm" className="text-xs">Monthly</Button>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <BarChart className="h-3 w-3 mr-1" />
            View Stats
          </Button>
        </div>
        
        {/* Top 3 Users */}
        <div className="flex justify-center items-end gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 mb-2 overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=5" alt="2nd place" className="w-full h-full object-cover" />
            </div>
            <div className="w-16 h-24 bg-silver rounded-t-lg flex items-center justify-center">
              <div className="text-xl font-bold text-white">2</div>
            </div>
            <div className="text-xs font-medium mt-1">Priya S.</div>
            <div className="text-xs text-muted-foreground">4720 SP</div>
          </div>
          
          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 mb-2 overflow-hidden border-2 border-amber-500">
              <img src="https://i.pravatar.cc/150?img=1" alt="1st place" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-32 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-lg flex items-center justify-center">
              <div className="text-2xl font-bold text-white">1</div>
            </div>
            <div className="text-sm font-medium mt-1 flex items-center">
              Arjun S. <Crown className="h-3 w-3 ml-1 text-amber-500" />
            </div>
            <div className="text-xs text-muted-foreground">4850 SP</div>
          </div>
          
          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 mb-2 overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=3" alt="3rd place" className="w-full h-full object-cover" />
            </div>
            <div className="w-16 h-20 bg-amber-700 rounded-t-lg flex items-center justify-center">
              <div className="text-xl font-bold text-white">3</div>
            </div>
            <div className="text-xs font-medium mt-1">Rahul P.</div>
            <div className="text-xs text-muted-foreground">4350 SP</div>
          </div>
        </div>
        
        {/* Other Rankings */}
        <div className="space-y-2">
          {[4, 5, 6, 7, 8].map(rank => (
            <div key={rank} className="flex items-center p-2 rounded-lg bg-muted">
              <div className="w-8 text-center font-medium">{rank}</div>
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden mx-2">
                <img src={`https://i.pravatar.cc/150?img=${rank + 2}`} alt={`Rank ${rank}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {["Neha G.", "Vikram M.", "Ananya D.", "Rohan J.", "Kavita R."][rank - 4]}
                  {rank === 5 && <Crown className="h-3 w-3 ml-1 inline text-amber-500" />}
                </div>
              </div>
              <div className="text-sm font-medium">
                {[3980, 3750, 3600, 3450, 3200][rank - 4]} SP
              </div>
            </div>
          ))}
          
          {/* Current User */}
          <div className="flex items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="w-8 text-center font-medium">342</div>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden mx-2">
              <img src="https://i.pravatar.cc/150?img=15" alt="You" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">You</div>
            </div>
            <div className="text-sm font-medium">
              2450 SP
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NovaStore = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Coins className="mr-2 h-5 w-5 text-purple-500" />
        Nova Store
      </CardTitle>
      <CardDescription>Spend your Nova Coins on exclusive items</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center mb-6 p-3 bg-muted rounded-lg">
        <div className="flex items-center">
          <Coins className="h-5 w-5 mr-2 text-purple-500" />
          <span className="font-medium">Your Nova Coins:</span>
        </div>
        <div className="text-xl font-bold">45</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Store Items */}
        <div className="border rounded-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <Award className="h-16 w-16 text-white" />
          </div>
          <div className="p-3">
            <h3 className="font-medium">Memory Master</h3>
            <p className="text-xs text-muted-foreground mb-2">Profile Title</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-1 text-purple-500" />
                <span className="text-sm font-medium">30</span>
              </div>
              <Button size="sm">Purchase</Button>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-amber-400 to-red-500 flex items-center justify-center">
            <Flame className="h-16 w-16 text-white" />
          </div>
          <div className="p-3">
            <h3 className="font-medium">Streak Shield</h3>
            <p className="text-xs text-muted-foreground mb-2">Streak Insurance Token</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-1 text-purple-500" />
                <span className="text-sm font-medium">50</span>
              </div>
              <Button size="sm">Purchase</Button>
            </div>
          </div>
        </div>
        
        <FeatureAccess featureKey="exclusive_store_items" teaser={true} blurIntensity={3}>
          <div className="border rounded-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Crown className="h-16 w-16 text-white" />
            </div>
            <div className="p-3">
              <h3 className="font-medium">GOAT Badge</h3>
              <p className="text-xs text-muted-foreground mb-2">Exclusive Profile Badge</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Coins className="h-4 w-4 mr-1 text-purple-500" />
                  <span className="text-sm font-medium">100</span>
                </div>
                <Button size="sm" variant="outline">GOAT Only</Button>
              </div>
            </div>
          </div>
        </FeatureAccess>
      </div>
    </CardContent>
  </Card>
);

const PointsActivity = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Calendar className="mr-2 h-5 w-5 text-blue-500" />
        Recent Activity
      </CardTitle>
      <CardDescription>Your recent Study Points activity</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          { type: 'quiz', points: 50, coins: 5, desc: 'Completed Physics quiz with 90% score', time: '2h ago', multiplied: true },
          { type: 'streak', points: 30, desc: 'Maintained a 7-day streak', time: '5h ago' },
          { type: 'question', points: 10, desc: 'Answered a question in Chemistry forum', time: '1d ago', multiplied: true },
          { type: 'study', points: 25, desc: 'Completed a 25-minute study session', time: '1d ago', multiplied: true },
          { type: 'coins', coins: 10, desc: 'Weekly leaderboard reward (Top 50)', time: '2d ago' }
        ].map((activity, i) => (
          <div key={i} className="flex items-start p-3 rounded-lg bg-muted">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
              activity.type === 'quiz' ? 'bg-green-100 text-green-600' :
              activity.type === 'streak' ? 'bg-orange-100 text-orange-600' :
              activity.type === 'question' ? 'bg-blue-100 text-blue-600' :
              activity.type === 'study' ? 'bg-indigo-100 text-indigo-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {activity.type === 'quiz' && <Target className="h-5 w-5" />}
              {activity.type === 'streak' && <Flame className="h-5 w-5" />}
              {activity.type === 'question' && <Zap className="h-5 w-5" />}
              {activity.type === 'study' && <Calendar className="h-5 w-5" />}
              {activity.type === 'coins' && <Coins className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="text-sm">{activity.desc}</div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
            <div className="text-right">
              {activity.points && (
                <div className="flex items-center justify-end text-sm font-medium">
                  {activity.multiplied && <span className="text-xs text-green-500 mr-1">2x</span>}
                  +{activity.points} SP
                </div>
              )}
              {activity.coins && (
                <div className="flex items-center justify-end text-sm font-medium text-purple-500">
                  +{activity.coins} <Coins className="h-3 w-3 ml-1" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const GamificationPage: React.FC = () => {
  const { user } = useUserContext();
  const { getCurrentPlan, isOnPlanOrHigher } = useFeatureAccess();
  const [activeTab, setActiveTab] = useState('study-points');
  
  const currentPlan = getCurrentPlan();
  const isPro = isOnPlanOrHigher('pro');
  const isGoat = isOnPlanOrHigher('goat');
  
  return (
    <>
      <Helmet>
        <title>Gamification - Study Nova</title>
        <meta name="description" content="Track your progress, earn Study Points, and climb the leaderboard" />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gamification</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress, earn Study Points, and climb the leaderboard
            </p>
          </div>
          
          {!isPro && (
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link href="/subscription">
                <Star className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
          
          {isPro && !isGoat && (
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/subscription">
                <Crown className="h-4 w-4 mr-2 text-yellow-300" />
                Upgrade to GOAT
              </Link>
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="study-points" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="study-points" className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
              <span>Study Points</span>
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center">
              <Flame className="h-4 w-4 mr-2 text-orange-500" />
              <span>Streak</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-amber-500" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center">
              <Coins className="h-4 w-4 mr-2 text-purple-500" />
              <span>Nova Store</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="study-points" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <StudyPointsSystem />
              </div>
              <div>
                <PointsActivity />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="streak" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <StreakSystem />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <Flame className="mr-2 h-5 w-5 text-orange-500" />
                      Streak Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">How to maintain your streak</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                          <span>Log in daily to the app</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                          <span>Complete at least 3 activities each day</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                          <span>Set daily reminders to avoid missing days</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                          <span>Use streak insurance if you know you'll miss a day</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-amber-600" />
                        Streak Multipliers
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Longer streaks give you better rewards:
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex justify-between">
                          <span>3-day streak:</span>
                          <span className="font-medium">1.2x SP</span>
                        </li>
                        <li className="flex justify-between">
                          <span>7-day streak:</span>
                          <span className="font-medium">1.5x SP</span>
                        </li>
                        <li className="flex justify-between">
                          <span>14-day streak:</span>
                          <span className="font-medium">1.7x SP</span>
                        </li>
                        <li className="flex justify-between">
                          <span>30-day streak:</span>
                          <span className="font-medium">2x SP</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <div className="grid grid-cols-1 gap-8">
              <Leaderboard />
            </div>
          </TabsContent>
          
          <TabsContent value="store">
            <div className="grid grid-cols-1 gap-8">
              <NovaStore />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default GamificationPage;