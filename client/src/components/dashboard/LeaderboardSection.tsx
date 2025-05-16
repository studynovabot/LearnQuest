import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardUser } from "@/types";
import { generateAvatar } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const LeaderboardSection = () => {
  const { leaderboard, isLoading, currentUserEntry, isCurrentUserInTop } = useLeaderboard(4);

  // Function to get rank badge styling
  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-700";
      default:
        return "bg-primary";
    }
  };

  // Function to get entry styling
  const getEntryClass = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary/10 border border-primary/30";
    
    switch (rank) {
      case 1:
        return "bg-muted/50";
      case 2:
        return "bg-muted/30";
      case 3:
        return "bg-muted/20";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Leaderboard</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Monthly</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {leaderboard.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <p>No leaderboard data available.</p>
            <p className="text-sm mt-2">Complete tasks to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top leaderboard entries */}
            {leaderboard.map((entry: LeaderboardUser, index: number) => (
              <div 
                key={`${entry.id}-${index}`} 
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3",
                  getEntryClass(entry.rank, entry.isCurrentUser)
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold", getRankBadgeClass(entry.rank))}>
                  {entry.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {entry.avatarUrl ? (
                    <img 
                      src={entry.avatarUrl} 
                      alt={`${entry.displayName} avatar`} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src={generateAvatar(entry.displayName)} 
                      alt={`${entry.displayName} avatar`} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{entry.displayName}</p>
                  <p className="text-xs text-muted-foreground">{entry.streak}-day streak</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{entry.xp} XP</p>
                  <div className="progress-bar h-1.5 w-24 mt-1">
                    <div 
                      className={cn(
                        "progress-fill", 
                        entry.rank === 1 ? "bg-gradient-to-r from-yellow-500 to-amber-500" :
                        entry.rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                        entry.rank === 3 ? "bg-gradient-to-r from-amber-700 to-amber-800" :
                        ""
                      )}
                      style={{ width: `${entry.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current user entry if not in top */}
            {!isCurrentUserInTop && currentUserEntry && (
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold">
                  {currentUserEntry.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {currentUserEntry.avatarUrl ? (
                    <img 
                      src={currentUserEntry.avatarUrl} 
                      alt="Your avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src={generateAvatar(currentUserEntry.displayName)} 
                      alt="Your avatar" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">You</p>
                  <p className="text-xs text-primary">{currentUserEntry.streak}-day streak</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{currentUserEntry.xp} XP</p>
                  <div className="progress-bar h-1.5 w-24 mt-1">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${currentUserEntry.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            <Link href="/leaderboard">
              <Button variant="ghost" className="w-full text-center text-sm text-primary">
                View Full Leaderboard
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardSection;
