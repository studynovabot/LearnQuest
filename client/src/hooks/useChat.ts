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
              console.log(`Attempting to send message to ${activeAgent?.name || 'Nova AI'} (ID: ${activeAgent?.id || '1'})`);
              
              // Try POST method first as it's more reliable for sending data
              try {
                console.log("Trying POST method first");
                // Add a timestamp to prevent caching
                response = await apiRequest("POST", `/api/chat?t=${Date.now()}`, {
                  content,
                  agentId: activeAgent?.id || '1', // Default to the first agent if none is selected
                  userId: user?.id || 'guest', // Pass user ID for performance tracking
                });
                
                // Check if the response is HTML instead of JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                  console.log("Received HTML response instead of JSON from POST, falling back to GET method");
                  throw new Error("HTML response received from POST");
                }
                
                console.log("POST method succeeded");
              } catch (postError) {
                console.log("POST request failed, falling back to GET method", postError);
                
                // If POST fails, try with GET method
                console.log("Trying GET method as fallback");
                response = await apiRequest("GET", `/api/chat?t=${Date.now()}&content=${encodeURIComponent(content)}&agentId=${activeAgent?.id || '1'}&userId=${user?.id || 'guest'}`, undefined);
                
                // Check if the response is HTML instead of JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                  console.log("Received HTML response instead of JSON from GET, using local response generation");
                  throw new Error("HTML response received from GET");
                }
                
                console.log("GET method succeeded");
              }
            } catch (apiError) {
              console.log("Both POST and GET methods failed, trying fallback API endpoint", apiError);
              
              try {
                // Try the fallback API endpoint which should always work
                console.log("Trying fallback API endpoint");
                const fallbackResponse = await apiRequest("GET", `/api/chat-fallback?t=${Date.now()}&content=${encodeURIComponent(content)}&agentId=${activeAgent?.id || '1'}&userId=${user?.id || 'guest'}`, undefined);
                
                // Parse the fallback response
                const fallbackText = await fallbackResponse.text();
                let fallbackData;
                
                try {
                  fallbackData = JSON.parse(fallbackText);
                  console.log("Successfully parsed fallback response:", fallbackData);
                  
                  // Add the fallback response to the chat
                  setLocalMessages((prev) => [...prev, {
                    id: Date.now(),
                    content: fallbackData.response || "I'm having trouble connecting right now. Please try again later.",
                    role: 'assistant',
                    timestamp: Date.now()
                  }]);
                } catch (fallbackError) {
                  console.error("Failed to parse fallback response:", fallbackError);
                  
                  // Generate a local response as last resort
                  const localResponseContent = generateLocalResponse(activeAgent?.name || "Nova AI", content);
                  
                  // Add the locally generated response to the chat
                  setLocalMessages((prev) => [...prev, {
                    id: Date.now(),
                    content: localResponseContent,
                    role: 'assistant',
                    timestamp: Date.now()
                  }]);
                }
              } catch (fallbackApiError) {
                console.error("Fallback API also failed, using local response generation", fallbackApiError);
                
                // Generate a local response based on the agent and user message
                const localResponseContent = generateLocalResponse(activeAgent?.name || "Nova AI", content);
                
                // Add the locally generated response to the chat
                setLocalMessages((prev) => [...prev, {
                  id: Date.now(),
                  content: localResponseContent,
                  role: 'assistant',
                  timestamp: Date.now()
                }]);
              }
              
              success = true;
              break;
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
              // Log response headers for debugging
              console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
              
              // Check content type header first
              const contentType = response.headers.get('content-type');
              if (contentType && !contentType.includes('application/json')) {
                console.log(`Unexpected content type: ${contentType}, expected application/json`);
              }
              
              // Get the response text
              const text = await response.text();
              console.log(`Response text (first 100 chars): ${text.substring(0, 100)}`);
              
              // Check if the response is HTML
              if (text.trim().startsWith('<!DOCTYPE') || 
                  text.trim().startsWith('<html') || 
                  text.includes('<head>') || 
                  text.includes('<body>')) {
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
                // Trim the text to remove any whitespace that might cause parsing issues
                const trimmedText = text.trim();
                assistantMessage = JSON.parse(trimmedText);
                console.log("Successfully parsed response as JSON:", assistantMessage);
              } catch (jsonError) {
                console.error("Failed to parse response as JSON:", jsonError);
                console.log("Raw response:", text);
                
                // Try to extract JSON from the response if it's embedded in other content
                const jsonMatch = text.match(/\{.*\}/s);
                if (jsonMatch) {
                  try {
                    console.log("Attempting to extract JSON from response");
                    assistantMessage = JSON.parse(jsonMatch[0]);
                    console.log("Successfully extracted JSON from response:", assistantMessage);
                  } catch (extractError) {
                    console.error("Failed to extract JSON from response:", extractError);
                    throw new Error("Invalid JSON response");
                  }
                } else {
                  throw new Error("Invalid JSON response");
                }
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
            } else if (assistantMessage.data && typeof assistantMessage.data.message === 'string' && assistantMessage.data.message.trim() !== '') {
              // Handle API response format: { success: true, data: { message: "..." } }
              messageContent = assistantMessage.data.message;
            } else if (typeof assistantMessage === 'string' && assistantMessage.trim() !== '') {
              // Handle case where the entire response is a string
              messageContent = assistantMessage;
            } else {
              // Default fallback message
              console.warn('Could not extract message content from response:', assistantMessage);
              messageContent = "I'm sorry, I couldn't generate a response this time. Please try asking something else.";
            }

            // Add the assistant's response to local state
            setLocalMessages((prev) => [...prev, {
              id: Date.now(),
              content: messageContent, // Use the validated/fallback content
              role: 'assistant',
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
