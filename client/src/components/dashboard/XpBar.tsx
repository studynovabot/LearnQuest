import { useAuth } from "@/hooks/useAuth";
import { calculateLevelProgress } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface XpBarProps {
  showText?: boolean;
  large?: boolean;
}

const XpBar = ({ showText = true, large = false }: XpBarProps) => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="w-full">
        {showText && (
          <div className="flex justify-between text-sm mb-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
        <Skeleton className={`h-${large ? 3 : 2} w-full rounded-full`} />
      </div>
    );
  }

  const maxLevel = user.maxLevel || 100; // Default to 100 if maxLevel is undefined
  const xpForCurrentLevel = user.level * maxLevel;
  const progressPercentage = calculateLevelProgress(user.xp % maxLevel, maxLevel);
  
  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between text-sm mb-1">
          <span>XP</span>
          <span>{user.xp}/{xpForCurrentLevel}</span>
        </div>
      )}
      <div className={`progress-bar ${large ? 'h-3' : ''}`}>
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default XpBar;
