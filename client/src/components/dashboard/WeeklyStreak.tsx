import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, FireIcon } from "@/components/ui/icons";
import { cn, getLastSevenDays } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { StreakDay } from "@/types";
import { motion } from "framer-motion";

const WeeklyStreak = () => {
  const { user } = useAuth();
  
  // Generate the last 7 days
  const lastSevenDays = getLastSevenDays();
  
  // Convert to streak days
  const streakDays: StreakDay[] = lastSevenDays.map((day, index) => {
    const isToday = index === 6;
    // Ensure completed is a boolean
    const completed = !!(user?.streak && user.streak >= 6 - index);
    
    return {
      day: day.day,
      completed,
      isToday
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {streakDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              {day.isToday && !day.completed ? (
                <motion.div 
                  className={cn(
                    "w-10 h-10 rounded-full bg-muted border-2 border-dashed border-primary/50 flex items-center justify-center mb-1",
                    "bounce"
                  )}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                >
                  <FireIcon className="text-primary" size={16} />
                </motion.div>
              ) : (
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                    day.completed ? "bg-primary" : "bg-muted"
                  )}
                >
                  {day.completed ? <CheckIcon className="text-white" size={16} /> : null}
                </div>
              )}
              <span className="text-xs">{day.day}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-between bg-primary/10 rounded-lg p-3">
          <div>
            <p className="text-sm font-medium">Bonus Reward</p>
            <p className="text-xs text-muted-foreground">Complete today for 50 XP</p>
          </div>
          <div className="bg-secondary rounded-lg px-3 py-1.5 text-sm font-bold flex items-center gap-1">
            <FireIcon size={14} />
            +50 XP
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStreak;
