import { AITutor } from '../types/schema';
import { GroqService } from './groq';
import { TogetherAIService } from './together';

export interface AIService {
  generateResponse(
    prompt: string, 
    agentId?: number,
    context?: string
  ): Promise<{
    content: string;
    xpAwarded: number;
  }>;
}

export function calculateXP(userPrompt: string, agentResponse: string): number {
  // Base XP award
  let xp = 5;
  
  // Length-based calculation - reward engagement
  if (userPrompt.length > 50) xp += 5;
  if (userPrompt.length > 100) xp += 5;
  
  // Complexity-based calculation
  const complexityCues = [
    'explain', 'why', 'how', 'what is', 'analyze', 
    'compare', 'difference', 'similar', 'example'
  ];
  
  for (const cue of complexityCues) {
    if (userPrompt.toLowerCase().includes(cue)) {
      xp += 3;
      break;
    }
  }
  
  // Cap XP at reasonable levels
  return Math.min(30, xp);
}

// Get the appropriate AI service for a particular agent
export async function getAIServiceForAgent(agent: AITutor | undefined): Promise<AIService> {
  // Default to Groq for the main tutor
  if (!agent || agent.id === '1') {
    return new GroqService({
      apiKey: process.env.GROQ_API_KEY || '',
      model: 'llama-2-70b-chat',
      apiUrl: process.env.GROQ_API_URL || ''
    });
  }

  // Use Together AI for subject-specific tutors (IDs 2-6)
  const agentIdNum = parseInt(agent.id, 10);
  if (agentIdNum >= 2 && agentIdNum <= 6) {
    return new TogetherAIService({
      apiKey: process.env.TOGETHER_AI_API_KEY || '',
      model: 'togethercomputer/llama-2-7b-chat'
    });
  }
  
  // Special tutors (IDs 7-9)
  if (agentIdNum >= 7 && agentIdNum <= 9) {
    // For the Personal AI Coach (ID 9), use a more capable model
    if (agentIdNum === 9) {
      return new GroqService({
        apiKey: process.env.GROQ_API_KEY || '',
        model: 'llama-2-70b-chat',
        apiUrl: process.env.GROQ_API_URL || ''
      });
    }
    
    // For Motivator (ID 7) and Task Planner (ID 8)
    return new TogetherAIService({
      apiKey: process.env.TOGETHER_AI_API_KEY || '',
      model: 'togethercomputer/llama-2-7b-chat'
    });
  }
  
  // Default fallback
  return new TogetherAIService({
    apiKey: process.env.TOGETHER_AI_API_KEY || '',
    model: 'togethercomputer/llama-2-7b-chat'
  });
}