import { useState, useEffect, useMemo } from "react";
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

  // Define the expected tutors response type
  interface TutorsResponse {
    success?: boolean;
    data?: AITutor[];
    count?: number;
    timestamp?: string;
  }

  // Fetch tutors - always fetch from real backend
  const { data: tutorsResponse, isLoading: isLoadingTutors } = useQuery<TutorsResponse | AITutor[]>({
    queryKey: ["/api/tutors"],
    enabled: true, // Always enable fetching from real backend
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract tutors from the response, handling different response formats
  const tutorsArray = useMemo(() => {
    if (!tutorsResponse) return [];
    
    // Handle response format: { success: true, data: [...] }
    if (typeof tutorsResponse === 'object' && 'success' in tutorsResponse && 'data' in tutorsResponse) {
      return Array.isArray(tutorsResponse.data) ? tutorsResponse.data : [];
    }
    
    // Handle direct array response
    if (Array.isArray(tutorsResponse)) {
      return tutorsResponse;
    }
    
    // Fallback to empty array if response format is unexpected
    console.warn('Unexpected tutors response format:', tutorsResponse);
    return [];
  }, [tutorsResponse]);
  
  // Separate tutors into unlocked and locked
  const unlockedAgents = tutorsArray; // All tutors are available now
  const lockedAgents: AITutor[] = []; // No locked tutors

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
      console.log(`Sending message to ${activeAgent?.name || 'unknown agent'} (ID: ${activeAgent?.id || 'unknown'})`);

      // Add the user's message to local state
      const userMessage: ChatMessage = {
        id: Date.now(),
        content,
        role: 'user',
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, userMessage]);

      // Create a fallback response in case of API failure
      const fallbackResponse = async () => {
        // Add a fallback message from the assistant
        const fallbackMessage: ChatMessage = {
          id: Date.now() + 1,
          content: "I'm sorry, I'm having trouble connecting to the server right now. Please try again later.",
          role: 'assistant',
          timestamp: Date.now() + 1,
        };
        setLocalMessages((prev) => [...prev, fallbackMessage]);
      };

      try {
        // Try to send the message to the server with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Always use real backend - no mock data

        // Set up retry logic for the chat API request
        const maxRetries = 2;
        let retryCount = 0;
        let success = false;

        while (retryCount <= maxRetries && !success) {
          try {
            console.log(`Sending chat message to API (attempt ${retryCount + 1}/${maxRetries + 1})`);

            console.log(`Making API request to /api/chat with agent ID: ${activeAgent?.id || '1'}`);
            
            // Add a timestamp to prevent caching
            const response = await apiRequest("POST", `/api/chat?t=${Date.now()}`, {
              content,
              agentId: activeAgent?.id || '1', // Default to the first agent if none is selected
              userId: user?.id, // Pass user ID for performance tracking
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              console.error(`Chat API returned error status: ${response.status}`);

              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying chat API request (${retryCount}/${maxRetries})...`);
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
                continue;
              } else {
                await fallbackResponse();
                return;
              }
            }

            const assistantMessage = await response.json();

            // Ensure content is a string and provide a fallback if it's not or is empty
            const messageContent = typeof assistantMessage.content === 'string' && assistantMessage.content.trim() !== ''
              ? assistantMessage.content
              : "I'm sorry, I couldn't generate a response this time. Please try asking something else.";

            // Add the assistant's response to local state
            setLocalMessages((prev) => [...prev, {
              ...assistantMessage,
              content: messageContent, // Use the validated/fallback content
              timestamp: assistantMessage.timestamp || Date.now()
            }]);

            success = true;
          } catch (fetchError) {
            console.error(`API request failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, fetchError);

            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying chat API request (${retryCount}/${maxRetries})...`);
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
            } else {
              await fallbackResponse();
              return;
            }
          }
        }
      } catch (fetchError) {
        console.error("All API request attempts failed:", fetchError);
        await fallbackResponse();
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

      // Add a fallback error message if one hasn't been added yet
      const hasErrorMessage = localMessages.some(
        msg => msg.role === 'assistant' && msg.content.includes("I'm having trouble connecting")
      );

      if (!hasErrorMessage) {
        setLocalMessages((prev) => [...prev, {
          id: Date.now(),
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          role: 'assistant',
          timestamp: Date.now(),
        }]);
      }
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
    agents: tutorsArray,
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
