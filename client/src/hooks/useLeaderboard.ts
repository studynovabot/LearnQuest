import { useQuery } from "@tanstack/react-query";
import { LeaderboardUser } from "@/types";
import { useUserContext } from "@/context/UserContext";

export function useLeaderboard(limit = 10) {
  const { user } = useUserContext();

  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: [`/api/leaderboard?limit=${limit}`],
    select: (data: any[]) => {
      return data.map((item: any) => ({
        ...item,
        progress: (item.xp % 750) / 750 * 100, // Simple calculation for progress bar
        isCurrentUser: user ? item.id === user.id : false
      })) as LeaderboardUser[];
    }
  });

  // Check if the current user is in the leaderboard
  const currentUserRank = user ? leaderboard.findIndex(item => String(item.id) === String(user.id)) + 1 : 0;
  const isCurrentUserInTop = currentUserRank > 0 && currentUserRank <= limit;

  // Get the current user's entry if they're not in the top already
  const currentUserEntry = user && !isCurrentUserInTop ? {
    id: user.id,
    displayName: user.displayName,
    xp: user.xp,
    streak: user.streak,
    rank: currentUserRank > 0 ? currentUserRank : leaderboard.length + 1,
    progress: (user.xp % 750) / 750 * 100,
    avatarUrl: user.avatarUrl,
    isCurrentUser: true
  } : null;

  return {
    leaderboard,
    isLoading,
    error,
    currentUserRank,
    isCurrentUserInTop,
    currentUserEntry
  };
}
