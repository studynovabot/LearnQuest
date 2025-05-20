import { useState } from "react";
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckIcon, FireIcon, TrashIcon } from "@/components/ui/icons";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";
import { cn, getPriorityColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Form schema
const taskSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  xpReward: z.coerce.number().min(10, "XP reward must be at least 10").max(100, "XP reward can't exceed 100"),
  priority: z.enum(["low", "medium", "high"])
});

type TaskFormData = z.infer<typeof taskSchema>;

const TaskManagement = () => {
  const { tasks, isLoading, completeTask, createTask, deleteTask } = useTasks();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: "",
      xpReward: 20,
      priority: "medium" as const
    }
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsCreating(true);
    try {
      await createTask(data);
      form.reset();
      setIsDialogOpen(false);

      // Show success toast
      toast({
        title: "Task Created",
        description: "Your new task has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      setPendingTaskId(id);
      await completeTask(id);
      await refreshUser();
    } catch (error) {
      console.error("Error completing task:", error);
      // Show a toast notification
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingTaskId(null);
    }
  };

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const incompleteTasks = tasksArray.filter((task: Task) => !task.completed);
  const completedTasks = tasksArray.filter((task: Task) => task.completed);
  const highPriorityTasks = incompleteTasks.filter((task: Task) => task.priority === "high");
  const mediumPriorityTasks = incompleteTasks.filter((task: Task) => task.priority === "medium");
  const lowPriorityTasks = incompleteTasks.filter((task: Task) => task.priority === "low");

  const totalAvailableXP = incompleteTasks.reduce((sum: number, task: Task) => sum + task.xpReward, 0);

  const renderTask = (task: Task) => (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "flex items-center gap-4 p-4 border-b border-border last:border-0",
        task.priority === "high" ? "bg-red-500/5" :
        task.priority === "medium" ? "bg-yellow-500/5" :
        "bg-green-500/5"
      )}
    >
      <button
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          task.completed
            ? "border-primary bg-primary/20"
            : task.priority === "high"
              ? "border-red-500 hover:bg-red-500/10"
              : task.priority === "medium"
                ? "border-yellow-500 hover:bg-yellow-500/10"
                : "border-green-500 hover:bg-green-500/10",
          "transition-colors"
        )}
        onClick={() => !task.completed && handleCompleteTask(task.id)}
        disabled={task.completed || pendingTaskId === task.id}
      >
        {task.completed ? (
          <CheckIcon className="text-primary" size={14} />
        ) : pendingTaskId === task.id ? (
          <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-current animate-spin"></div>
        ) : null}
      </button>

      <div className="flex-grow">
        <p className={cn(task.completed ? "text-muted-foreground line-through" : "")}>
          {task.description}
        </p>
        <p className={cn("text-xs", getPriorityColor(task.priority))}>
          {task.priority.charAt(0).toUpperCase() + (task.priority || '').slice(1)} priority
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-muted rounded-md px-2 py-1 text-sm font-medium text-primary">
          +{task.xpReward} XP
        </div>
        <button
          onClick={async () => {
            try {
              await deleteTask(task.id);
            } catch (error) {
              console.error("Error deleting task:", error);
              // Show a toast notification
              toast({
                title: "Error",
                description: "Failed to delete task. Please try again.",
                variant: "destructive",
              });
            }
          }}
          className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
          title="Delete task"
        >
          <TrashIcon className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Task Management | Study Nova - Gamified Learning Platform</title>
        <meta name="description" content="Manage your learning tasks, track progress, and earn XP rewards as you complete tasks in this gamified learning experience." />
      </Helmet>

      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-card py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Study Nova Tasks</CardTitle>
                <CardDescription className="mt-2">
                  Track and manage your learning tasks to earn XP
                </CardDescription>
              </div>

              <div className="flex gap-4 items-center">
                <div className="bg-primary/10 rounded-xl px-4 py-2 border border-primary/30">
                  <div className="text-sm text-muted-foreground">Available XP:</div>
                  <div className="text-xl font-bold text-primary">{totalAvailableXP} XP</div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Create Task</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Learning Task</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Task Description</FormLabel>
                              <FormControl>
                                <Input placeholder="What do you need to learn?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="xpReward"
                            render={({ field }: any) => (
                              <FormItem>
                                <FormLabel>XP Reward</FormLabel>
                                <FormControl>
                                  <Input type="number" min={10} max={100} step={5} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }: any) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <DialogFooter>
                          <Button type="submit" disabled={isCreating}>
                            {isCreating ? (
                              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin mr-2" />
                            ) : null}
                            Create Task
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b border-border">
                <div className="px-6">
                  <TabsList className="mt-6 mb-6 grid grid-cols-5">
                    <TabsTrigger value="all">All Tasks</TabsTrigger>
                    <TabsTrigger value="high" className="text-red-500">High Priority</TabsTrigger>
                    <TabsTrigger value="medium" className="text-yellow-500">Medium Priority</TabsTrigger>
                    <TabsTrigger value="low" className="text-green-500">Low Priority</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="p-6">
                <TabsContent value="all" className="mt-0">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : incompleteTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No active tasks</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Create new tasks to track your learning and earn XP rewards
                      </p>
                      <Button onClick={() => setIsDialogOpen(true)}>Create Your First Task</Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      <AnimatePresence>
                        {incompleteTasks.map(renderTask)}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="high" className="mt-0">
                  {highPriorityTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No high priority tasks</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      <AnimatePresence>
                        {highPriorityTasks.map(renderTask)}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="medium" className="mt-0">
                  {mediumPriorityTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No medium priority tasks</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      <AnimatePresence>
                        {mediumPriorityTasks.map(renderTask)}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="low" className="mt-0">
                  {lowPriorityTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No low priority tasks</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      <AnimatePresence>
                        {lowPriorityTasks.map(renderTask)}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  {completedTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No completed tasks yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-muted/30">
                      <AnimatePresence>
                        {completedTasks.map(renderTask)}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            <div className="p-6 bg-muted/30 border-t border-border">
              <h3 className="text-xl font-semibold mb-4">Task Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <FireIcon className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Daily Streak</h4>
                      <p className="text-sm text-muted-foreground">{user?.streak || 0} days</p>
                    </div>
                  </div>
                  <div className="progress-bar mt-2">
                    <div className="progress-fill" style={{ width: `${Math.min(100, ((user?.streak || 0) / 7) * 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Complete 7 days for a bonus 50 XP</p>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
                        <path d="M12 8L15 13.2L19 14.1L15.5 18.2L16.5 22L12 20.2L7.5 22L8.5 18.2L5 14.1L9 13.2L12 8Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Task XP</h4>
                      <p className="text-sm text-muted-foreground">{totalAvailableXP} XP available</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mt-2">
                    <li className="text-xs flex justify-between">
                      <span>High priority:</span>
                      <span className="text-red-500">30-50 XP</span>
                    </li>
                    <li className="text-xs flex justify-between">
                      <span>Medium priority:</span>
                      <span className="text-yellow-500">15-30 XP</span>
                    </li>
                    <li className="text-xs flex justify-between">
                      <span>Low priority:</span>
                      <span className="text-green-500">10-15 XP</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Completed</h4>
                      <p className="text-sm text-muted-foreground">{completedTasks.length} tasks</p>
                    </div>
                  </div>
                  <p className="text-xs mt-2">
                    You've earned {completedTasks.reduce((sum: number, task: Task) => sum + task.xpReward, 0)} XP from completed tasks
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default TaskManagement;
