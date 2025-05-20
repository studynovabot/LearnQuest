import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/context/UserContext";

export function useTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, refreshUser } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock tasks for development or when backend is unavailable
  const mockTasks: Task[] = [
    {
      id: 'mock-1',
      description: 'Study physics for 1 hour',
      completed: false,
      xpReward: 30,
      priority: 'high'
    },
    {
      id: 'mock-2',
      description: 'Complete math homework',
      completed: false,
      xpReward: 20,
      priority: 'medium'
    },
    {
      id: 'mock-3',
      description: 'Review biology notes',
      completed: false,
      xpReward: 15,
      priority: 'low'
    }
  ];

  // Use mock data in development or when backend is unavailable
  const useMockData = import.meta.env.DEV || window.location.hostname.includes('vercel.app');

  const { data: tasks = useMockData ? mockTasks : [], isLoading, error, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user && !useMockData, // Only enable fetching when user is available and not using mock data
  });

  // Add a function to manually fetch tasks
  const fetchTasks = () => {
    if (user) {
      refetchTasks();
    }
  };

  const createTaskMutation = useMutation<Task, Error, Omit<Task, "id" | "completed">>({
    mutationFn: async (task: Omit<Task, "id" | "completed">) => {
      try {
        // Check if we're in development mode or if the backend is unavailable
        // In that case, use a mock response
        if (import.meta.env.DEV || window.location.hostname.includes('vercel.app')) {
          // Simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Create a mock task
          const mockTask: Task = {
            id: `mock-${Date.now()}`,
            description: task.description,
            xpReward: task.xpReward,
            priority: task.priority as 'low' | 'medium' | 'high',
            completed: false
          };

          return mockTask;
        }

        // Add timeout for the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await apiRequest("POST", "/api/tasks", task);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          console.error(`Task creation failed with status ${response.status}: ${errorText}`);
          throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        console.error("Task creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      refetchTasks(); // Explicitly refetch tasks after creation
      toast({
        title: "Task Created",
        description: "Your new task has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Create task mutation error:", error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error({
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }

      toast({
        title: "Failed to Create Task",
        description: error instanceof Error ? error.message : "An error occurred while creating the task.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation<Task, Error, { id: string; data: Partial<Task> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });

      // If a task was completed, refresh the user to get updated XP
      if (data.completed) {
        refreshUser();

        toast({
          title: "Task Completed",
          description: `You earned +${data.xpReward} XP for completing this task!`,
        });
      } else {
        toast({
          title: "Task Updated",
          description: "Your task has been updated successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Task",
        description: error instanceof Error ? error.message : "An error occurred while updating the task.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Task",
        description: error instanceof Error ? error.message : "An error occurred while deleting the task.",
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    isLoading: isLoading || isSubmitting,
    error,
    fetchTasks, // Expose the manual fetch function
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    completeTask: async (id: string) => {
      await updateTaskMutation.mutateAsync({ id, data: { completed: true } });
    },
  };
}