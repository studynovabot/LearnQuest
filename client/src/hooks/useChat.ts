import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage, AITutor } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUserContext } from "@/context/UserContext";

export function useChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AITutor | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]); // Local state for chat messages

  // Fetch tutors
  const { data: tutors = [], isLoading: isLoadingTutors } = useQuery<AITutor[]>({
    queryKey: ["/api/tutors"],
    enabled: !!user,
  });

  // Separate tutors into unlocked and locked
  const unlockedAgents = tutors.filter(tutor => tutor.unlocked);
  const lockedAgents = tutors.filter(tutor => !tutor.unlocked);

  // Set the first agent as active by default if none is selected
  useEffect(() => {
    if (unlockedAgents.length > 0 && !activeAgent) {
      setActiveAgent(unlockedAgents[0]);
    }
  }, [unlockedAgents, activeAgent]);

  const sendMessage = async (content: string) => {
    if (isSubmitting || !content.trim()) return;
    try {
      setIsSubmitting(true);

      // Add the user's message to local state
      const userMessage: ChatMessage = {
        id: Date.now(),
        content,
        role: 'user',
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, userMessage]);

      // Send the message to the server with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await apiRequest("POST", "/api/chat", {
          content,
          agentId: activeAgent?.id || '1', // Default to the first agent if none is selected
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
        }

        const assistantMessage = await response.json();

        // Add the assistant's response to local state
        setLocalMessages((prev) => [...prev, {
          ...assistantMessage,
          timestamp: assistantMessage.timestamp || Date.now()
        }]);
      } catch (fetchError) {
        console.error("API request failed:", fetchError);
        throw fetchError;
      }

    } catch (error) {
      console.error("Error in sendMessage:", error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error({
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }

      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });

      // Add a fallback error message
      setLocalMessages((prev) => [...prev, {
        id: Date.now(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        role: 'assistant',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectAgent = (agent: AITutor | null) => {
    setActiveAgent(agent);
    // Clear messages when switching agents
    setLocalMessages([]);
  };

  return {
    agents: tutors,
    unlockedAgents,
    lockedAgents,
    isLoading: isLoadingTutors,
    activeAgent,
    selectAgent,
    sendMessage,
    agentMessages: localMessages,
    isSubmitting,
  };
}
