import { AITutor } from '../types/schema.js';
import { GroqService } from './groq.js';
import { TogetherAIService } from './together.js';

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
  const agentIdNum = parseInt(agent?.id || '1', 10);

  // Nova (General AI Tutor) - Use Groq
  if (!agent || agent.id === '1') {
    return new GroqService({
      apiKey: process.env.GROQ_API_KEY || '',
      model: 'llama-3.1-8b-instant',
      apiUrl: process.env.GROQ_API_URL || ''
    });
  }

  // Academic Subject Tutors (2-9) - Use Together AI with specialized models
  if (agentIdNum >= 2 && agentIdNum <= 9) {
    return new TogetherAIService({
      apiKey: process.env.TOGETHER_AI_API_KEY || '',
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
    });
  }

  // Personal Development & Motivation Tutors (10-11) - Use DeepSeek for better reasoning
  if (agentIdNum >= 10 && agentIdNum <= 11) {
    return new TogetherAIService({
      apiKey: process.env.TOGETHER_AI_API_KEY || '',
      model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'
    });
  }

  // Creative & Technical Tutors (12-15) - Use Llama for versatility
  if (agentIdNum >= 12 && agentIdNum <= 15) {
    return new TogetherAIService({
      apiKey: process.env.TOGETHER_AI_API_KEY || '',
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
    });
  }

  // Default fallback
  return new TogetherAIService({
    apiKey: process.env.TOGETHER_AI_API_KEY || '',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
  });
}