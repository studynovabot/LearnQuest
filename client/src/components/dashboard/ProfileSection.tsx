import { Card, CardContent } from "@/components/ui/card";
import { FireIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { calculateLevelProgress, generateAvatar } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSection = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col items-center">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-6 w-32 mt-4" />
            <Skeleton className="h-4 w-48 mt-2" />
            
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            
            <div className="mt-6 space-y-3 w-full">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxLevel = user.maxLevel || 100; // Default to 100 if maxLevel is undefined
  const progress = calculateLevelProgress(user.xp % maxLevel, maxLevel);
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={`${user.displayName} avatar`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <img 
                  src={generateAvatar(user.displayName)} 
                  alt={`${user.displayName} avatar`} 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <FireIcon className="text-white" size={16} />
            </div>
          </div>
          
          <h3 className="font-display font-semibold text-lg mt-4">{user.displayName}</h3>
          <p className="text-sm text-muted-foreground">{user.title || "Novice Learner"} • Level {user.level}</p>
          
          <div className="w-full mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Next Level</span>
              <span>{user.xp % maxLevel}/{maxLevel} XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Streak</span>
            <span className="font-medium flex items-center">
              <FireIcon className="text-orange-500 mr-1.5" size={14} />
              {user.streak} days
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Questions Solved</span>
            <span className="font-medium">{user.questionsCompleted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hours Studied</span>
            <span className="font-medium">{user.hoursStudied}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
