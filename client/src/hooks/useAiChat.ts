import { useState, useCallback } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useGoatNitro } from '@/hooks/useGoatNitro';
import { config } from '@/config';
import { useToast } from '@/hooks/use-toast';

export function useAiChat() {
  const { user } = useUserContext();
  const { isFeatureAvailable, addStudyPoints } = useGoatNitro();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate AI response using Groq API
  const generateAiResponse = useCallback(async (
    prompt: string,
    context: string = '',
    systemPrompt: string = 'You are a helpful AI tutor assistant in a class chat. Provide concise, accurate, and helpful responses to student questions. Focus on educational content and be encouraging.'
  ) => {
    // Check if user has access to AI assistant
    if (!isFeatureAvailable('ai_assistant')) {
      toast({
        title: 'Goat Nitro Required',
        description: 'AI assistant is only available with Goat Nitro subscription.',
        variant: 'destructive',
      });
      return null;
    }

    // Check if Groq API key is configured
    if (!config.groqApiKey) {
      return generateFallbackResponse(prompt);
    }

    try {
      setIsGenerating(true);

      // Prepare the API request
      const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.groqApiKey}`,
      };

      // Build the messages array
      const messages = [
        { role: 'system', content: systemPrompt },
      ];

      // Add context if provided
      if (context) {
        messages.push({ role: 'system', content: `Context: ${context}` });
      }

      // Add the user's prompt
      messages.push({ role: 'user', content: prompt });

      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Using Llama 3 8B model
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Award Study Points for using the AI assistant
      if (user?.id) {
        addStudyPoints(10, 'Used AI assistant');
      }

      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: 'AI Error',
        description: 'Failed to generate AI response. Using fallback response.',
        variant: 'destructive',
      });
      return generateFallbackResponse(prompt);
    } finally {
      setIsGenerating(false);
    }
  }, [user, isFeatureAvailable, addStudyPoints, toast]);

  // Generate a fallback response when the API is unavailable
  const generateFallbackResponse = (prompt: string) => {
    // Simple keyword-based response system
    const keywords = {
      'math': 'Mathematics is a fascinating subject! To solve this problem, you need to break it down step by step. What specific part are you struggling with?',
      'science': 'Science is all about exploration and discovery! This topic involves understanding key principles and applying them. Could you share what specific aspect you need help with?',
      'history': 'History helps us understand our present by learning from the past. This historical period/event had several important factors to consider. What specific information are you looking for?',
      'english': 'Language and literature help us communicate and understand different perspectives. For this question, consider the context, themes, and literary devices. What specific aspect are you analyzing?',
      'homework': 'I\'d be happy to help with your homework! To provide the best assistance, could you share the specific question or problem you\'re working on?',
      'exam': 'Preparing for exams requires good organization and focus. Make sure to review key concepts, practice problems, and get enough rest. What specific subject are you studying for?',
      'help': 'I\'m here to help! To provide the best assistance, could you share more details about what you need help with?',
    };

    // Check if the prompt contains any of the keywords
    const lowerPrompt = prompt.toLowerCase();
    for (const [keyword, response] of Object.entries(keywords)) {
      if (lowerPrompt.includes(keyword)) {
        return response;
      }
    }

    // Default response if no keywords match
    return 'I\'m here to help with your studies! Could you provide more details about your question so I can give you a more specific answer?';
  };

  // Process a message with the /askai command
  const processAiCommand = useCallback(async (message: string) => {
    // Check if message starts with /askai
    if (!message.startsWith('/askai')) {
      return null;
    }

    // Extract the prompt (everything after /askai)
    const prompt = message.substring('/askai'.length).trim();
    
    if (!prompt) {
      return 'Please provide a question after the /askai command.';
    }

    // Generate AI response
    return await generateAiResponse(prompt);
  }, [generateAiResponse]);

  return {
    generateAiResponse,
    processAiCommand,
    isGenerating,
  };
}