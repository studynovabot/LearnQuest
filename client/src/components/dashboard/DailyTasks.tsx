import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, TrashIcon } from "@/components/ui/icons";
import { cn, getPriorityColor } from "@/lib/utils";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";

const DailyTasks = () => {
  const { tasks, isLoading, completeTask, deleteTask } = useTasks();
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  const handleCompleteTask = async (id: string) => {
    setPendingTaskId(id);
    await completeTask(id);
    setPendingTaskId(null);
  };

  // Ensure tasks is an array before using array methods
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  
  const totalAvailableXP = tasksArray
    .filter((task: Task) => !task.completed)
    .reduce((sum: number, task: Task) => sum + task.xpReward, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 flex-grow" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <Skeleton className="h-12 w-full mt-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Daily Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasksArray.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <p>No tasks available.</p>
            <p className="text-sm mt-2">Create tasks to earn XP rewards!</p>
          </div>
        ) : (
          <>
            {tasksArray.map((task: Task, index: number) => (
              <div key={`${task.id}-${index}`} className="flex items-center gap-3">
                <button
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    task.completed
                      ? "border-primary bg-primary/20"
                      : "border-muted hover:border-primary/50 transition-colors"
                  )}
                  onClick={() => !task.completed && handleCompleteTask(task.id)}
                  disabled={task.completed || pendingTaskId === task.id}
                >
                  {task.completed ? (
                    <CheckIcon className="text-primary text-sm" size={14} />
                  ) : pendingTaskId === task.id ? (
                    <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                  ) : null}
                </button>
                <div className="flex-grow">
                  <p className={cn(task.completed ? "text-muted-foreground line-through" : "")}>
                    {task.description}
                  </p>
                  {task.priority && (
                    <p className={cn("text-xs", getPriorityColor(task.priority))}>
                      {task.priority.charAt(0).toUpperCase() + (task.priority || '').slice(1)} priority
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-muted rounded-md px-2 py-1 text-sm font-medium text-primary">
                    +{task.xpReward} XP
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
                    title="Delete task"
                  >
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 bg-muted rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">Available XP</span>
              <span className="text-lg font-bold text-secondary">{totalAvailableXP} XP</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTasks;
