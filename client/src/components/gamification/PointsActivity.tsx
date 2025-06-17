import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Target, Flame, Zap, Coins, BookOpen } from 'lucide-react';

interface Activity {
  id: string;
  type: 'quiz_completed' | 'streak' | 'question_answered' | 'study_session' | 'nova_coins_earned' | 'material_shared' | 'rank_up';
  points: number;
  coins?: number;
  description: string;
  timestamp: string;
  multiplied?: boolean;
}

interface PointsActivityProps {
  activities?: Activity[];
}

const PointsActivity: React.FC<PointsActivityProps> = ({ activities = [] }) => {
  // Default activities if none provided
  const defaultActivities: Activity[] = [
    {
      id: 'act-1',
      type: 'quiz_completed',
      points: 50,
      coins: 5,
      description: 'Completed Physics quiz with 90% score',
      timestamp: '2023-06-07T14:30:00Z',
      multiplied: true
    },
    {
      id: 'act-2',
      type: 'streak',
      points: 30,
      description: 'Maintained a 7-day streak',
      timestamp: '2023-06-07T09:15:00Z'
    },
    {
      id: 'act-3',
      type: 'question_answered',
      points: 10,
      description: 'Answered a question in Chemistry forum',
      timestamp: '2023-06-06T16:45:00Z',
      multiplied: true
    },
    {
      id: 'act-4',
      type: 'study_session',
      points: 25,
      description: 'Completed a 25-minute study session',
      timestamp: '2023-06-06T11:20:00Z',
      multiplied: true
    },
    {
      id: 'act-5',
      type: 'nova_coins_earned',
      points: 0,
      coins: 10,
      description: 'Weekly leaderboard reward (Top 50)',
      timestamp: '2023-06-05T08:00:00Z'
    }
  ];
  
  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Get icon based on activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quiz_completed':
        return <Target className="h-5 w-5" />;
      case 'streak':
        return <Flame className="h-5 w-5" />;
      case 'question_answered':
        return <Zap className="h-5 w-5" />;
      case 'study_session':
        return <Calendar className="h-5 w-5" />;
      case 'nova_coins_earned':
        return <Coins className="h-5 w-5" />;
      case 'material_shared':
        return <BookOpen className="h-5 w-5" />;
      case 'rank_up':
        return <Target className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };
  
  // Get background color based on activity type
  const getActivityBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'quiz_completed':
        return 'bg-green-100 text-green-600';
      case 'streak':
        return 'bg-orange-100 text-orange-600';
      case 'question_answered':
        return 'bg-blue-100 text-blue-600';
      case 'study_session':
        return 'bg-indigo-100 text-indigo-600';
      case 'nova_coins_earned':
        return 'bg-purple-100 text-purple-600';
      case 'material_shared':
        return 'bg-teal-100 text-teal-600';
      case 'rank_up':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };
  
  return (
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
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start p-3 rounded-lg bg-muted">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${getActivityBgColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm">{activity.description}</div>
                <div className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</div>
              </div>
              <div className="text-right">
                {activity.points > 0 && (
                  <div className="flex items-center justify-end text-sm font-medium">
                    {activity.multiplied && <span className="text-xs text-green-500 mr-1">2x</span>}
                    +{activity.points} SP
                  </div>
                )}
                {activity.coins && activity.coins > 0 && (
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
};

export default PointsActivity;