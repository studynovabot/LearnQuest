import { useState, useEffect } from "react";
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

  // Always fetch from real backend
  const { data: tasks = [], isLoading, error, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user, // Only enable fetching when user is available
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
      try {
        const response = await apiRequest("PATCH", `/api/tasks?id=${id}`, data);
        return response.json();
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
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
      // Set up retry logic for task deletion
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;

      while (retryCount <= maxRetries) {
        try {
          console.log(`Deleting task (attempt ${retryCount + 1}/${maxRetries + 1}): ${id}`);

          // Add timeout for the request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          await apiRequest("DELETE", `/api/tasks?id=${id}`);
          clearTimeout(timeoutId);

          console.log(`Task deleted successfully: ${id}`);
          return;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`Error deleting task (attempt ${retryCount + 1}/${maxRetries + 1}):`, lastError);

          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying task deletion (${retryCount}/${maxRetries})...`);
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          } else {
            // If all retries failed, throw the error
            throw lastError;
          }
        }
      }
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

  // Function to complete a task with error handling
  const completeTask = async (id: string) => {
    try {
      await updateTaskMutation.mutateAsync({ id, data: { completed: true } });
    } catch (error) {
      console.error("Error completing task:", error);
      // Don't rethrow the error to prevent UI disruption
    }
  };

  return {
    tasks,
    isLoading: isLoading || isSubmitting,
    error,
    fetchTasks, // Expose the manual fetch function
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    completeTask
  };
}