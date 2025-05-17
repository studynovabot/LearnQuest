import { AIService } from './index.js';

type TogetherAIOptions = {
  apiKey: string;
  model: string;
};

export class TogetherAIService implements AIService {
  private client: {
    complete: (params: {
      model: string;
      prompt: string;
      max_tokens: number;
      temperature: number;
      top_p: number;
      stop: string[];
    }) => Promise<{
      output?: {
        text: string;
      };
    }>;
  };
  private model: string;
  
  constructor(options: TogetherAIOptions) {
    if (!options.apiKey) {
      throw new Error('TogetherAI API key is required');
    }
    
    // Log API key length for debugging (don't log the actual key)
    console.log(`TogetherAI API key length: ${options.apiKey.length} characters`);
    
    const togetherApiUrl = process.env.TOGETHER_AI_API_URL || 'https://api.together.xyz/v1/completions';
    console.log(`Using TogetherAI API URL: ${togetherApiUrl}`);
    
    this.client = {
      complete: async (params) => {
        try {
          console.log(`Making TogetherAI API request for model: ${params.model}`);
          const response = await fetch(togetherApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${options.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
          });
          if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            console.error(`TogetherAI API error (${response.status}): ${errorText}`);
            throw new Error(`TogetherAI API error: ${response.statusText}`);
          }
          return await response.json() as { output?: { text: string } };
        } catch (error) {
          console.error('TogetherAI API request failed:', error);
          throw error;
        }
      }
    };
    this.model = options.model;
  }
  
  async generateResponse(prompt: string, agentId?: number, context?: string): Promise<{
    content: string;
    xpAwarded: number;
  }> {
    try {
      // Get agent-specific system message
      const systemMessage = this.getSystemMessageForAgent(agentId);
      
      // Subject specialization logic
      const subjectMap: Record<number, string> = {
        2: 'math',
        3: 'science',
        4: 'language',
        5: 'social studies',
        6: 'ai',
        7: 'tech',
      };
      if (agentId && subjectMap[agentId]) {
        const subject = subjectMap[agentId];
        const keywords = {
          math: ['math', 'algebra', 'geometry', 'calculus', 'equation', 'number', 'integral', 'derivative'],
          science: ['science', 'biology', 'chemistry', 'physics', 'experiment', 'cell', 'atom', 'energy'],
          language: ['language', 'grammar', 'writing', 'essay', 'literature', 'poem', 'sentence', 'word'],
          'social studies': ['history', 'geography', 'civics', 'economics', 'society', 'government', 'country'],
          ai: ['ai', 'artificial intelligence', 'machine learning', 'data', 'algorithm', 'neural network'],
          tech: ['computer', 'programming', 'code', 'software', 'hardware', 'technology', 'it', 'debug'],
        };
        const relevant = keywords[subject as keyof typeof keywords].some((kw: string) => prompt.toLowerCase().includes(kw));
        if (!relevant) {
          return {
            content: `I'm specialized in ${subject}. Please ask me questions related to ${subject}, or select the appropriate tutor for your topic!`,
            xpAwarded: 0
          };
        }
      }
      
      console.log(`Generating response for agent ID: ${agentId || 'default'}`);
      
      // Check if API key is valid before making the request
      if (!process.env.TOGETHER_AI_API_KEY || process.env.TOGETHER_AI_API_KEY.length < 20) {
        console.warn('TogetherAI API key appears to be invalid or missing');
        throw new Error('Invalid API key configuration');
      }
      
      // Build the prompt with context if provided
      let fullPrompt = `<s>${systemMessage}</s>`;
      
      // Add context if provided
      if (context) {
        fullPrompt += `\n<s>Additional context about the user: ${context}</s>`;
      }
      
      // Add the user's prompt
      fullPrompt += `\n<user>${prompt}</user>\n<assistant>`;
      
      const completion = await this.client.complete({
        model: this.model,
        prompt: fullPrompt,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        stop: ["</assistant>", "<user>"]
      }) as any;
      
      const responseText = completion?.output?.text || "I'm having trouble responding right now. Please try again.";
      
      // Clean the response by removing any potential system or user tags that might be generated
      const cleanedResponse = responseText
        .replace(/<assistant>/g, '')
        .replace(/<\/assistant>/g, '')
        .replace(/<user>/g, '')
        .replace(/<\/user>/g, '')
        .replace(/<s>/g, '')
        .replace(/<\/system>/g, '')
        .trim();
      
      // Calculate XP based on the complexity and quality of interaction
      const xpAwarded = this.calculateXpAward(prompt, cleanedResponse);
      
      return {
        content: cleanedResponse,
        xpAwarded
      };
    } catch (error) {
      console.error('Error generating response from Together AI:', error);
      
      // Provide a more helpful fallback response
      let fallbackResponse = "I apologize, but I'm having trouble connecting to my knowledge base right now. ";
      
      // Add more context based on the error
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('API key')) {
          fallbackResponse += "There seems to be an issue with my authorization. The system administrator should check the API key configuration.";
        } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
          fallbackResponse += "I'm experiencing connection issues. Please try again in a few moments.";
        } else {
          fallbackResponse += "Please try again later or contact support if the issue persists.";
        }
      }
      
      // Return the fallback response with no XP
      return {
        content: fallbackResponse,
        xpAwarded: 0
      };
    }
  }
  
  private getSystemMessageForAgent(agentId?: number): string {
    // Default system message
    let systemMessage = `You are a helpful, friendly educational AI assistant named Study Nova. 
Your task is to help students with their learning, answering questions in a clear, concise, and educational manner. 
Be encouraging and supportive, using positive reinforcement.`;

    // Agent-specific system messages
    switch (agentId) {
      case 1: // General Tutor (unlikely to use Together AI for this but included for completeness)
        systemMessage = `You are Study Nova, an advanced educational AI assistant specializing in helping students with any subject.
Your responses should be informative, clear, and educational, with a focus on explaining concepts thoroughly.
Always encourage critical thinking and provide examples when possible.
Remember that you're helping students learn, so guide them through problems rather than just giving answers.`;
        break;
      case 2: // Math Tutor
        systemMessage = `You are the Math Mentor, a specialized AI tutor in the Study Nova platform.
Your expertise is mathematics at all levels from basic arithmetic to advanced calculus.
Break down mathematical concepts step by step, showing your work clearly.
Use a scaffolded approach to help students understand the principles behind mathematical operations.
Encourage problem-solving skills and different approaches to reaching solutions.`;
        break;
      case 3: // Science Tutor
        systemMessage = `You are the Science Sage, a specialized AI tutor in the Study Nova platform.
Your knowledge spans biology, chemistry, physics, and environmental science.
Explain scientific concepts using clear analogies and real-world applications.
When discussing experiments, emphasize the scientific method and proper procedures.
Connect scientific principles to current technological advances and research when relevant.`;
        break;
      case 4: // Language Tutor
        systemMessage = `You are the Language Luminary, a specialized AI tutor in the Study Nova platform.
You excel at helping with writing, grammar, literature analysis, and language learning.
Provide constructive feedback on writing, with specific suggestions for improvement.
When analyzing literature, discuss themes, literary devices, and historical context.
For language learning, focus on practical usage and conversational skills.`;
        break;
      case 5: // Social Studies Tutor
        systemMessage = `You are the Social Studies Scholar, a specialized AI tutor in the Study Nova platform.
Your expertise covers history, geography, economics, and civics.
Present historical events with context, multiple perspectives, and connections to the present.
Use maps and geographical concepts to explain human and physical geography.
Discuss social issues with balanced viewpoints and evidence-based reasoning.`;
        break;
      case 6: // AI Tutor
        systemMessage = `You are the AI Assistant, a specialized tutor in the Study Nova platform.
Your expertise is in artificial intelligence, machine learning, and data science.
Explain AI concepts in an accessible way, using real-world examples and applications.
Help students understand the ethical implications and future potential of AI technologies.
Guide students through AI-related projects and problem-solving.`;
        break;
      case 7: // Tech/IT Tutor
        systemMessage = `You are the Tech Tutor, a specialized AI tutor in the Study Nova platform.
You specialize in computer science, programming languages, and digital literacy.
Explain coding concepts with practical examples and scaffolded exercises.
Guide students through debugging by teaching problem-solving strategies rather than just fixing their code.
Connect technology concepts to their real-world applications and impacts.`;
        break;
      case 8: // Motivator
        systemMessage = `You are the Motivator, a specialized AI coach in the Study Nova platform.
Your primary role is to provide encouragement, motivation, and positive reinforcement to students.
Help students overcome learning challenges and maintain enthusiasm for their studies.
Provide inspirational quotes, success stories, and practical tips for staying motivated.
Always maintain an upbeat, supportive tone while acknowledging the challenges of learning.`;
        break;
      case 9: // Task Planner
        systemMessage = `You are the Task Planner, a specialized AI assistant in the Study Nova platform.
Your expertise is in helping students organize their learning tasks and create effective study plans.
Provide structured approaches to breaking down complex subjects into manageable tasks.
Offer time management strategies, prioritization techniques, and productivity tips.
Help students create balanced study schedules that include breaks and prevent burnout.`;
        break;
      default:
        // Use the default message
        break;
    }
    
    return systemMessage;
  }
  
  private calculateXpAward(userPrompt: string, response: string): number {
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
    
    // Cap XP at reasonable levels (maximum 30 XP for "amazing" response)
    return Math.min(30, xp);
  }
}