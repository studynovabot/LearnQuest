import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { generateAvatar, cn } from "@/lib/utils";
import { LeaderboardUser } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { FireIcon } from "@/components/ui/icons";

const Leaderboard = () => {
  const { leaderboard, isLoading, currentUserEntry, currentUserRank } = useLeaderboard(20);

  const filteredLeaderboard = leaderboard.filter(user =>
    user.displayName !== 'Demo User' && user.username !== 'Demo User'
  );

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-700";
      default:
        return rank <= 10 ? "bg-primary" : "bg-muted-foreground";
    }
  };

  const getEntryClass = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary/10 border border-primary/30";

    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border border-gray-400/30";
      case 3:
        return "bg-amber-700/10 border border-amber-700/30";
      default:
        return rank <= 10 ? "bg-muted/30" : "bg-muted/10";
    }
  };

  return (
    <>
      <Helmet>
        <title>Leaderboard | Study Nova - Gamified Learning Platform</title>
        <meta name="description" content="See the top learners on Study Nova's leaderboard! Compete with others to earn XP and climb the ranks in this gamified learning experience." />
      </Helmet>

      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-card py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <CardTitle className="text-2xl font-bold">Nova AI Leaderboard</CardTitle>

                <div className="flex items-center gap-1 bg-muted py-2 px-4 rounded-full">
                  <span className="text-muted-foreground">Your Rank:</span>
                  <span className="font-bold text-primary ml-2">#{currentUserRank}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(10).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeaderboard.map((entry: LeaderboardUser, index: number) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-4",
                        getEntryClass(entry.rank, entry.isCurrentUser)
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                        getRankBadgeClass(entry.rank)
                      )}>
                        {entry.rank}
                      </div>

                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{entry.displayName}</h3>
                          {entry.rank <= 3 && (
                            <div className="bg-yellow-500/20 text-yellow-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                              {entry.rank === 1 ? 'Top Student' : entry.rank === 2 ? 'Runner-up' : 'Honorable Mention'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FireIcon size={16} className="text-orange-500" />
                            <span>{entry.streak}-day streak</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-xl">{entry.xp} XP</p>
                        <div className="progress-bar h-2 w-32 mt-1">
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
                    </motion.div>
                  ))}

                  {/* If current user is not in the displayed list, show their entry */}
                  {currentUserEntry && !filteredLeaderboard.some(entry => entry.isCurrentUser) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4 mt-6"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                        {currentUserEntry.rank}
                      </div>

                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                        <h3 className="font-semibold text-lg">You ({currentUserEntry.displayName})</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FireIcon size={16} className="text-orange-500" />
                            <span>{currentUserEntry.streak}-day streak</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-xl">{currentUserEntry.xp} XP</p>
                        <div className="progress-bar h-2 w-32 mt-1">
                          <div
                            className="progress-fill"
                            style={{ width: `${currentUserEntry.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Monthly leaderboard resets on the 1st of each month</p>
                <p className="mt-1">Top 3 users will receive a 7-day pro trial</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Leaderboard;
