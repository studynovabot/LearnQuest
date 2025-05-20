import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/context/UserContext";
import { mockTasks, shouldUseMockData } from "@/lib/mockData";

export function useTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, refreshUser } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Using useState to make the mock tasks mutable and persist changes
  const [mockTasksState, setMockTasksState] = useState<Task[]>([]);

  // Initialize mock tasks from our centralized mock data
  useEffect(() => {
    if (mockTasksState.length === 0) {
      setMockTasksState(mockTasks);
    }
  }, []);

  // Use the shouldUseMockData helper to determine if we should use mock data
  const useMockData = shouldUseMockData();

  // Use mock data directly if we're in development or on Vercel
  const { data: backendTasks = [], isLoading: isLoadingBackend, error, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user && !useMockData, // Only enable fetching when user is available and not using mock data
  });

  // Combine the data sources - use mock data if we're in development or on Vercel
  const tasks = useMockData ? mockTasksState : backendTasks;
  const isLoading = useMockData ? false : isLoadingBackend;

  // Add a function to manually fetch tasks
  const fetchTasks = () => {
    if (user) {
      refetchTasks();
    }
  };

  const createTaskMutation = useMutation<Task, Error, Omit<Task, "id" | "completed">>({
    mutationFn: async (task: Omit<Task, "id" | "completed">) => {
      try {
        // Check if we should use mock data
        if (useMockData) {
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

          // Add the new task to the mock tasks array
          setMockTasksState([...mockTasksState, mockTask]);

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
      // Check if we should use mock data
      if (useMockData) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find the task in the mock tasks
        const taskIndex = mockTasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
          // Create an updated task
          const updatedTask: Task = {
            ...mockTasks[taskIndex],
            ...data
          };

          // Update the mock tasks array
          const updatedTasks = [...mockTasksState];
          updatedTasks[taskIndex] = updatedTask;
          setMockTasksState(updatedTasks);

          return updatedTask;
        }

        // If task not found, return a mock task
        return {
          id,
          description: "Mock task",
          completed: data.completed || false,
          xpReward: 20,
          priority: "medium"
        };
      }

      try {
        const response = await apiRequest("PATCH", `/api/tasks/${id}`, data);
        return response.json();
      } catch (error) {
        console.error("Error updating task:", error);
        // If there's an error, still update the task in the local state
        if (useMockData) {
          // Find the task in the mock tasks
          const taskIndex = mockTasksState.findIndex(task => task.id === id);
          if (taskIndex !== -1) {
            // Create an updated task
            const updatedTask: Task = {
              ...mockTasksState[taskIndex],
              ...data
            };

            // Update the mock tasks array
            const updatedTasks = [...mockTasksState];
            updatedTasks[taskIndex] = updatedTask;
            setMockTasksState(updatedTasks);

            return updatedTask;
          }
        }
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
      // Check if we should use mock data
      if (useMockData) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find the task index in the mock tasks
        const taskIndex = mockTasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
          // Remove the task from the mock tasks array
          const updatedTasks = mockTasksState.filter(task => task.id !== id);
          setMockTasksState(updatedTasks);
        }

        return;
      }

      try {
        await apiRequest("DELETE", `/api/tasks/${id}`);
      } catch (error) {
        console.error("Error deleting task:", error);
        // If there's an error, still remove the task from the local state
        if (useMockData) {
          const updatedTasks = mockTasksState.filter(task => task.id !== id);
          setMockTasksState(updatedTasks);
        }
        throw error;
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
      // If we're using mock data, update the task in the local state
      if (useMockData) {
        const taskIndex = mockTasksState.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
          const updatedTasks = [...mockTasksState];
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completed: true
          };
          setMockTasksState(updatedTasks);
        }
      }
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