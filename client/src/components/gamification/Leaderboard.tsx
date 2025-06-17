import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/UserContext';
import { Trophy, Crown, BarChart, ArrowUp, ArrowDown, Minus, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  studyPoints: number;
  novaCoins?: number;
  rank: number;
  previousRank?: number;
  level?: number;
  isGoat?: boolean;
  isCurrentUser?: boolean;
  title?: string;
}

interface LeaderboardProps {
  users?: LeaderboardUser[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users = [] }) => {
  const { user } = useUserContext();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  // Mock data if no users are provided
  const mockUsers: LeaderboardUser[] = [
    {
      id: 'user-1',
      name: 'Arjun Singh',
      avatar: 'https://i.pravatar.cc/150?img=1',
      studyPoints: 4850,
      novaCoins: 120,
      rank: 1,
      previousRank: 2,
      level: 5,
      isGoat: true,
      title: 'Memory King'
    },
    {
      id: 'user-2',
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?img=5',
      studyPoints: 4720,
      novaCoins: 85,
      rank: 2,
      previousRank: 1,
      level: 5,
      isGoat: false
    },
    {
      id: 'user-3',
      name: 'Rahul Patel',
      avatar: 'https://i.pravatar.cc/150?img=3',
      studyPoints: 4350,
      novaCoins: 65,
      rank: 3,
      previousRank: 3,
      level: 4,
      isGoat: false,
      title: 'AI Slayer'
    },
    {
      id: 'user-4',
      name: 'Neha Gupta',
      avatar: 'https://i.pravatar.cc/150?img=4',
      studyPoints: 3980,
      rank: 4,
      previousRank: 5,
      level: 4
    },
    {
      id: 'user-5',
      name: 'Vikram Mehta',
      avatar: 'https://i.pravatar.cc/150?img=6',
      studyPoints: 3750,
      rank: 5,
      previousRank: 4,
      level: 4,
      isGoat: true,
      title: 'Nova Legend'
    },
    {
      id: 'user-6',
      name: 'Ananya Desai',
      avatar: 'https://i.pravatar.cc/150?img=7',
      studyPoints: 3600,
      novaCoins: 40,
      rank: 6,
      previousRank: 7,
      level: 4
    },
    {
      id: 'user-7',
      name: 'Rohan Joshi',
      avatar: 'https://i.pravatar.cc/150?img=8',
      studyPoints: 3450,
      rank: 7,
      previousRank: 6,
      level: 3
    },
    {
      id: 'user-8',
      name: 'Kavita Reddy',
      avatar: 'https://i.pravatar.cc/150?img=9',
      studyPoints: 3200,
      rank: 8,
      previousRank: 9,
      level: 3,
      isGoat: true
    },
    // Current user
    {
      id: user?.id || 'current-user',
      name: user?.displayName || 'You',
      avatar: user?.profilePic || 'https://i.pravatar.cc/150?img=15',
      studyPoints: user?.studyPoints || 2450,
      novaCoins: user?.novaCoins || 45,
      rank: 342,
      previousRank: 350,
      level: Math.floor((user?.studyPoints || 0) / 500) + 1,
      isCurrentUser: true,
      isGoat: user?.subscriptionPlan === 'goat',
      title: 'Student' // Default title if equippedTitle doesn't exist
    }
  ];
  
  const leaderboardUsers = users.length > 0 ? users : mockUsers;
  
  // Sort users by rank
  const sortedUsers = [...leaderboardUsers].sort((a, b) => a.rank - b.rank);
  
  // Get top 3 users
  const topUsers = sortedUsers.slice(0, 3);
  
  // Get other users (ranks 4-8)
  const otherUsers = sortedUsers.filter(u => u.rank > 3 && u.rank <= 8);
  
  // Get current user if not in top 8
  const currentUser = sortedUsers.find(u => u.isCurrentUser && u.rank > 8);
  
  // Helper function to render rank change indicator
  const getRankChangeIndicator = (user: LeaderboardUser) => {
    if (!user.previousRank) return null;
    
    if (user.rank < user.previousRank) {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else if (user.rank > user.previousRank) {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Leaderboard
        </CardTitle>
        <CardDescription>See how you rank against other students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button 
                variant={timeframe === 'daily' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('daily')}
              >
                Daily
              </Button>
              <Button 
                variant={timeframe === 'weekly' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('weekly')}
              >
                Weekly
              </Button>
              <Button 
                variant={timeframe === 'monthly' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs"
                onClick={() => setTimeframe('monthly')}
              >
                Monthly
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <BarChart className="h-3 w-3 mr-1" />
              View Stats
            </Button>
          </div>
          
          {/* Top 3 Users */}
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2nd Place */}
            {topUsers[1] && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 mb-2 overflow-hidden">
                  <img src={topUsers[1].avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`} alt="2nd place" className="w-full h-full object-cover" />
                </div>
                <div className="w-16 h-24 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-lg flex items-center justify-center">
                  <div className="text-xl font-bold text-white">2</div>
                </div>
                <div className="text-xs font-medium mt-1 flex items-center">
                  {topUsers[1].name.split(' ')[0]} {topUsers[1].isGoat && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                </div>
                <div className="text-xs text-muted-foreground">{topUsers[1].studyPoints} SP</div>
                <div className="flex items-center text-xs mt-1">
                  {getRankChangeIndicator(topUsers[1])}
                </div>
              </div>
            )}
            
            {/* 1st Place */}
            {topUsers[0] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-200 mb-2 overflow-hidden border-2 border-amber-500">
                  <img src={topUsers[0].avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`} alt="1st place" className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-32 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-2xl font-bold text-white">1</div>
                </div>
                <div className="text-sm font-medium mt-1 flex items-center">
                  {topUsers[0].name.split(' ')[0]} {topUsers[0].isGoat && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                </div>
                <div className="text-xs text-muted-foreground">{topUsers[0].studyPoints} SP</div>
                <div className="flex items-center text-xs mt-1">
                  {getRankChangeIndicator(topUsers[0])}
                </div>
              </div>
            )}
            
            {/* 3rd Place */}
            {topUsers[2] && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 mb-2 overflow-hidden">
                  <img src={topUsers[2].avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`} alt="3rd place" className="w-full h-full object-cover" />
                </div>
                <div className="w-16 h-20 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-lg flex items-center justify-center">
                  <div className="text-xl font-bold text-white">3</div>
                </div>
                <div className="text-xs font-medium mt-1 flex items-center">
                  {topUsers[2].name.split(' ')[0]} {topUsers[2].isGoat && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                </div>
                <div className="text-xs text-muted-foreground">{topUsers[2].studyPoints} SP</div>
                <div className="flex items-center text-xs mt-1">
                  {getRankChangeIndicator(topUsers[2])}
                </div>
              </div>
            )}
          </div>
          
          {/* Other Rankings */}
          <div className="space-y-2">
            {otherUsers.map(user => (
              <div 
                key={user.id} 
                className={`flex items-center p-2 rounded-lg ${
                  user.isCurrentUser 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'bg-muted'
                }`}
              >
                <div className="w-8 text-center font-medium">{user.rank}</div>
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden mx-2">
                  <img 
                    src={user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`} 
                    alt={`Rank ${user.rank}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium flex items-center">
                    {user.isCurrentUser ? 'You' : user.name}
                    {user.isGoat && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                    {user.title && (
                      <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">
                        {user.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium flex items-center">
                  {user.studyPoints} SP
                  <span className="ml-1">{getRankChangeIndicator(user)}</span>
                </div>
              </div>
            ))}
            
            {/* Current User (if not in top 8) */}
            {currentUser && (
              <>
                <div className="text-center text-xs text-muted-foreground py-2">
                  • • •
                </div>
                <div className="flex items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-8 text-center font-medium">{currentUser.rank}</div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden mx-2">
                    <img 
                      src={currentUser.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`} 
                      alt="You" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium flex items-center">
                      You
                      {currentUser.isGoat && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
                      {currentUser.title && (
                        <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">
                          {currentUser.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium flex items-center">
                    {currentUser.studyPoints} SP
                    <span className="ml-1">{getRankChangeIndicator(currentUser)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-muted p-4 rounded-lg mt-6">
            <h3 className="text-sm font-medium flex items-center mb-2">
              <Award className="h-4 w-4 mr-2 text-amber-500" />
              Weekly Rewards
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex justify-between">
                <span>Top 10:</span>
                <span className="font-medium">50 Nova Coins</span>
              </li>
              <li className="flex justify-between">
                <span>Top 25:</span>
                <span className="font-medium">25 Nova Coins</span>
              </li>
              <li className="flex justify-between">
                <span>Top 50:</span>
                <span className="font-medium">10 Nova Coins</span>
              </li>
              <li className="flex justify-between">
                <span>Top 100:</span>
                <span className="font-medium">5 Nova Coins</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;