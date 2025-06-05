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

        // Set up retry logic for the chat API request
        const maxRetries = 2;
        let retryCount = 0;
        let success = false;

        // Generate a local AI response based on the agent and user message
        const generateLocalResponse = (agentName: string, userMessage: string): string => {
          // Get a friendly response based on the agent's specialty
          const agentResponses: Record<string, string[]> = {
            "Nova AI": [
              "I'd love to help with that! What specific aspects would you like to explore? 💡",
              "Great question! Let me think about that for a moment... 🤔",
              "That's an interesting topic! Could you tell me more about what you're trying to learn? 📚",
              "I'm here to help! Let's break this down step by step. ✨"
            ],
            "Math Mentor": [
              "That's a great math question! Let's work through this together. 🧮",
              "I love math problems! Let me show you how to approach this. 📊",
              "Math can be challenging, but I'm here to help! Let's solve this step by step. ➗",
              "Let's tackle this math problem together! What have you tried so far? 🔢"
            ],
            "Science Sage": [
              "What a fascinating scientific question! Let's explore this together. 🔬",
              "Science is amazing! Let me explain how this works... 🌟",
              "That's a great science topic to explore! Here's what we know about it. 🧪",
              "I'm excited to discuss this scientific concept with you! Let's dive in. 🌌"
            ],
            "default": [
              "I'm here to help with your question! Could you provide a bit more detail? 💬",
              "That's an interesting topic! Let me share what I know about it. 📚",
              "I'd be happy to discuss this with you! What specific aspects are you curious about? 🤔",
              "Great question! Let's explore this topic together. ✨"
            ]
          };

          // Get responses for this agent or use default
          const responses = agentResponses[agentName] || agentResponses.default;
          
          // Select a response based on the content of the message
          let responseIndex = userMessage.length % responses.length;
          
          // Add some personalization based on the message content
          let personalizedResponse = responses[responseIndex];
          
          // Add a follow-up question or suggestion
          const followUps = [
            "What else would you like to know about this?",
            "Is there a specific part of this topic you'd like to explore further?",
            "Would you like me to explain anything else about this?",
            "Do you have any other questions I can help with?"
          ];
          
          return `${personalizedResponse}\n\nI'm currently having trouble connecting to my knowledge base, but I'm still here to chat! ${followUps[Math.floor(Math.random() * followUps.length)]}`;
        };

        while (retryCount <= maxRetries && !success) {
          try {
            console.log(`Sending chat message to API (attempt ${retryCount + 1}/${maxRetries + 1})`);

            console.log(`Making API request to /api/chat with agent ID: ${activeAgent?.id || '1'}`);
            
            // Add a timestamp to prevent caching
            // Try GET method first since the server might not support POST
            let response;
            try {
              // First try with GET method
              response = await apiRequest("GET", `/api/chat?t=${Date.now()}&content=${encodeURIComponent(content)}&agentId=${activeAgent?.id || '1'}&userId=${user?.id || 'guest'}`, undefined);
              
              // Check if the response is HTML instead of JSON
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('text/html')) {
                console.log("Received HTML response instead of JSON, using local response generation");
                throw new Error("HTML response received");
              }
            } catch (getError) {
              console.log("GET request failed, falling back to POST method");
              try {
                // If GET fails, try with POST method
                response = await apiRequest("POST", `/api/chat?t=${Date.now()}`, {
                  content,
                  agentId: activeAgent?.id || '1', // Default to the first agent if none is selected
                  userId: user?.id, // Pass user ID for performance tracking
                });
                
                // Check if the response is HTML instead of JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                  console.log("Received HTML response instead of JSON, using local response generation");
                  throw new Error("HTML response received");
                }
              } catch (postError) {
                console.log("Both GET and POST methods failed, using local response generation");
                
                // Generate a local response based on the agent and user message
                const localResponseContent = generateLocalResponse(activeAgent?.name || "Nova AI", content);
                
                // Add the locally generated response to the chat
                setLocalMessages((prev) => [...prev, {
                  id: Date.now(),
                  content: localResponseContent,
                  role: 'assistant',
                  timestamp: Date.now()
                }]);
                
                success = true;
                break;
              }
            }

            clearTimeout(timeoutId);

            // Handle 405 Method Not Allowed specifically - this means the API endpoint doesn't support the current method
            if (response.status === 405) {
              console.log("Chat API returned 405 Method Not Allowed - trying alternative method");
              
              // If we're already on the last retry, use local response generation
              if (retryCount >= maxRetries - 1) {
                console.log("All API methods failed - using local response generation");
                
                // Generate a local response based on the agent and user message
                const localResponseContent = generateLocalResponse(activeAgent?.name || "Nova AI", content);
                
                // Add the locally generated response to the chat
                setLocalMessages((prev) => [...prev, {
                  id: Date.now(),
                  content: localResponseContent,
                  role: 'assistant',
                  timestamp: Date.now()
                }]);
                
                success = true;
                break;
              }
              
              // Otherwise, continue to the next retry which will try a different method
              continue;
            }

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

            // Try to parse the response as JSON, with error handling
            let assistantMessage;
            try {
              // First check if the response is HTML
              const text = await response.text();
              if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                console.log("Received HTML instead of JSON, using local response generation");
                
                // Generate a local response based on the agent and user message
                const localResponseContent = generateLocalResponse(activeAgent?.name || "Nova AI", content);
                
                // Add the locally generated response to the chat
                setLocalMessages((prev) => [...prev, {
                  id: Date.now(),
                  content: localResponseContent,
                  role: 'assistant',
                  timestamp: Date.now()
                }]);
                
                success = true;
                break;
              }
              
              // Try to parse as JSON
              try {
                assistantMessage = JSON.parse(text);
              } catch (jsonError) {
                console.error("Failed to parse response as JSON:", jsonError);
                throw new Error("Invalid JSON response");
              }
            } catch (parseError) {
              console.error("Error parsing response:", parseError);
              
              // Generate a local response based on the agent and user message
              const localResponseContent = generateLocalResponse(activeAgent?.name || "Nova AI", content);
              
              // Add the locally generated response to the chat
              setLocalMessages((prev) => [...prev, {
                id: Date.now(),
                content: localResponseContent,
                role: 'assistant',
                timestamp: Date.now()
              }]);
              
              success = true;
              break;
            }

            // Ensure content is a string and provide a fallback if it's not or is empty
            let messageContent;
            
            // Check for different possible response formats
            if (typeof assistantMessage.content === 'string' && assistantMessage.content.trim() !== '') {
              messageContent = assistantMessage.content;
            } else if (typeof assistantMessage.response === 'string' && assistantMessage.response.trim() !== '') {
              messageContent = assistantMessage.response;
            } else if (typeof assistantMessage === 'string' && assistantMessage.trim() !== '') {
              // Handle case where the entire response is a string
              messageContent = assistantMessage;
            } else {
              // Default fallback message
              messageContent = "I'm sorry, I couldn't generate a response this time. Please try asking something else.";
            }

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
