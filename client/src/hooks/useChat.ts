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
    if (!tutorsResponse) {
      // Fallback tutors if no response
      console.log('No tutors response, using fallback data');
      return [
        { id: 1, name: "Nova AI", subject: "General Assistant", iconName: "sparkles", color: "blue" },
        { id: 2, name: "Math Mentor", subject: "Mathematics", iconName: "calculator", color: "purple" },
        { id: 3, name: "Science Sage", subject: "Science", iconName: "flask", color: "green" },
        { id: 4, name: "Language Linguist", subject: "Languages", iconName: "languages", color: "orange" },
        { id: 5, name: "History Helper", subject: "History", iconName: "landmark", color: "amber" },
        { id: 6, name: "Geography Guide", subject: "Geography", iconName: "globe", color: "cyan" },
        { id: 7, name: "Physics Pro", subject: "Physics", iconName: "trending-up", color: "pink" },
        { id: 8, name: "Chemistry Champion", subject: "Chemistry", iconName: "flask", color: "emerald" },
        { id: 9, name: "Biology Buddy", subject: "Biology", iconName: "leaf", color: "indigo" },
        { id: 10, name: "English Expert", subject: "English", iconName: "book", color: "violet" },
        { id: 11, name: "Computer Coder", subject: "Computer Science", iconName: "code", color: "red" },
        { id: 12, name: "Art Advisor", subject: "Arts", iconName: "palette", color: "teal" },
        { id: 13, name: "Economics Expert", subject: "Economics", iconName: "trending-up", color: "yellow" },
        { id: 14, name: "Psychology Pro", subject: "Psychology", iconName: "brain", color: "slate" },
        { id: 15, name: "Motivational Mentor", subject: "Personal Development", iconName: "smile", color: "rose" }
      ];
    }
    
    // Handle response format: { success: true, data: [...] }
    if (typeof tutorsResponse === 'object' && 'success' in tutorsResponse && 'data' in tutorsResponse) {
      const data = tutorsResponse.data;
      if (Array.isArray(data)) {
        // Always return the data if it's an array, regardless of length
        console.log('Received tutors data:', data.length, 'tutors');
        return data;
      }
      // If data is not an array, return the fallback data
      console.warn('Tutors data is not an array. Using fallback data.');
      return [
        { id: 1, name: "Nova AI", subject: "General Assistant", iconName: "sparkles", color: "blue" },
        { id: 2, name: "Math Mentor", subject: "Mathematics", iconName: "calculator", color: "purple" },
        { id: 3, name: "Science Sage", subject: "Science", iconName: "flask", color: "green" },
        { id: 4, name: "Language Linguist", subject: "Languages", iconName: "languages", color: "orange" },
        { id: 5, name: "History Helper", subject: "History", iconName: "landmark", color: "amber" },
        { id: 6, name: "Geography Guide", subject: "Geography", iconName: "globe", color: "cyan" },
        { id: 7, name: "Physics Pro", subject: "Physics", iconName: "trending-up", color: "pink" },
        { id: 8, name: "Chemistry Champion", subject: "Chemistry", iconName: "flask", color: "emerald" },
        { id: 9, name: "Biology Buddy", subject: "Biology", iconName: "leaf", color: "indigo" },
        { id: 10, name: "English Expert", subject: "English", iconName: "book", color: "violet" },
        { id: 11, name: "Computer Coder", subject: "Computer Science", iconName: "code", color: "red" },
        { id: 12, name: "Art Advisor", subject: "Arts", iconName: "palette", color: "teal" },
        { id: 13, name: "Economics Expert", subject: "Economics", iconName: "trending-up", color: "yellow" },
        { id: 14, name: "Psychology Pro", subject: "Psychology", iconName: "brain", color: "slate" },
        { id: 15, name: "Motivational Mentor", subject: "Personal Development", iconName: "smile", color: "rose" }
      ];
    }
    
    // Handle direct array response
    if (Array.isArray(tutorsResponse)) {
      // Always return the array, regardless of length
      console.log('Received tutors array directly:', tutorsResponse.length, 'tutors');
      return tutorsResponse;
    }
    
    // Fallback to default tutors if response format is unexpected
    console.warn('Unexpected tutors response format:', tutorsResponse);
    return [
      { id: 1, name: "Nova AI", subject: "General Assistant", iconName: "sparkles", color: "blue" },
      { id: 2, name: "Math Mentor", subject: "Mathematics", iconName: "calculator", color: "purple" },
      { id: 3, name: "Science Sage", subject: "Science", iconName: "flask", color: "green" },
      { id: 4, name: "Language Linguist", subject: "Languages", iconName: "languages", color: "orange" },
      { id: 5, name: "History Helper", subject: "History", iconName: "landmark", color: "amber" },
      { id: 6, name: "Geography Guide", subject: "Geography", iconName: "globe", color: "cyan" },
      { id: 7, name: "Physics Pro", subject: "Physics", iconName: "trending-up", color: "pink" },
      { id: 8, name: "Chemistry Champion", subject: "Chemistry", iconName: "flask", color: "emerald" },
      { id: 9, name: "Biology Buddy", subject: "Biology", iconName: "leaf", color: "indigo" },
      { id: 10, name: "English Expert", subject: "English", iconName: "book", color: "violet" },
      { id: 11, name: "Computer Coder", subject: "Computer Science", iconName: "code", color: "red" },
      { id: 12, name: "Art Advisor", subject: "Arts", iconName: "palette", color: "teal" },
      { id: 13, name: "Economics Expert", subject: "Economics", iconName: "trending-up", color: "yellow" },
      { id: 14, name: "Psychology Pro", subject: "Psychology", iconName: "brain", color: "slate" },
      { id: 15, name: "Motivational Mentor", subject: "Personal Development", iconName: "smile", color: "rose" }
    ];
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

      // Add the user's message to local state immediately
      const userMessage: ChatMessage = {
        id: Date.now(),
        content,
        role: 'user',
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, userMessage]);

      try {
        console.log("Making API request to /api/chat");
        
        // Make the API request
        const response = await apiRequest("POST", "/api/chat", {
          content,
          agentId: activeAgent?.id || '1',
          userId: user?.id || 'guest',
        });

        // Parse the JSON response
        const responseData = await response.json();
        console.log("API response:", responseData);

        // Check if the response has the expected structure
        if (responseData && responseData.success && responseData.data && responseData.data.message) {
          // Add the assistant's response to local state
          const assistantMessage: ChatMessage = {
            id: Date.now() + 1,
            content: responseData.data.message,
            role: 'assistant',
            timestamp: Date.now() + 1,
          };
          setLocalMessages((prev) => [...prev, assistantMessage]);
        } else {
          console.warn("Unexpected response format:", responseData);
          throw new Error("Unexpected response format");
        }
      } catch (apiError) {
        console.error("API request failed:", apiError);
        
        // Generate a fallback response
        const fallbackResponses = [
          "I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment? 💫",
          "I'm currently experiencing a brief connection issue. Please try again shortly and I'll be happy to assist you! 🌟",
          "I'm eager to help you with this! My systems are currently refreshing. Could you try again in a moment? ✨"
        ];
        
        const fallbackMessage: ChatMessage = {
          id: Date.now() + 1,
          content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
          role: 'assistant',
          timestamp: Date.now() + 1,
        };
        setLocalMessages((prev) => [...prev, fallbackMessage]);
        
        // Don't throw the error - we've handled it gracefully
        console.log("Used fallback response due to API error");
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectAgent = (agent: AITutor) => {
    console.log(`Selecting agent: ${agent.name} (ID: ${agent.id})`);
    setActiveAgent(agent);
    // Clear messages when switching agents
    setLocalMessages([]);
  };

  // Get messages for the active agent
  const agentMessages = localMessages;

  return {
    agents: tutorsArray,
    unlockedAgents,
    lockedAgents,
    activeAgent,
    isLoading: isLoadingTutors,
    sendMessage,
    selectAgent,
    agentMessages,
    isSubmitting
  };
}

// Helper function to get user ID
function getUserId(): string | null {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData.uid || null;
    }
    return null;
  } catch {
    return null;
  }
}