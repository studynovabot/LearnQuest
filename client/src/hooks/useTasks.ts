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

  const { data: tasks = [], isLoading, error, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user, // Enable fetching when user is available
  });

  // Add a function to manually fetch tasks
  const fetchTasks = () => {
    if (user) {
      refetchTasks();
    }
  };

  const createTaskMutation = useMutation<Task, Error, Omit<Task, "id" | "completed">>({
    mutationFn: async (task: Omit<Task, "id" | "completed">) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
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