import Groq from 'groq-sdk';
import { AIService } from './index';

type GroqOptions = {
  apiKey: string;
  model: string;
  apiUrl?: string;
};

export class GroqService implements AIService {
  private client: Groq;
  private model: string;
  private apiUrl?: string;
  
  constructor(options: GroqOptions) {
    try {
      // Use the provided API key and endpoint from environment variables
      this.client = new Groq({
        apiKey: options.apiKey
        // If the SDK supports custom endpoint, add: endpoint: options.apiUrl
      });
      this.apiUrl = options.apiUrl;
    } catch (error) {
      console.error("Error initializing Groq client:", error);
      throw new Error("Failed to initialize Groq client");
    }
    this.model = options.model;
  }
  
  async generateResponse(prompt: string, agentId?: number, context?: string): Promise<{
    content: string;
    xpAwarded: number;
  }> {
    try {
      // Get agent-specific system message
      const systemMessage = this.getSystemMessageForAgent(agentId);
      // Prepare messages array with context if provided
      const messages = [
        { role: "system", content: systemMessage }
      ];
      
      // Add context as a system message if provided
      if (context) {
        messages.push({ role: "system", content: `Additional context about the user: ${context}` });
      }
      
      // Add the user's prompt
      messages.push({ role: "user", content: prompt });
      
      // If a custom endpoint is set, use fetch directly
      if (this.apiUrl) {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
          })
        });
        if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);
        const completion = await response.json();
        const responseContent = completion.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
        const xpAwarded = this.calculateXpAward(prompt, responseContent);
        return { content: responseContent, xpAwarded };
      }
      // Default SDK usage
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(message => {
          if (message.role === 'function') {
            return {
              role: 'function', // Explicitly set role to 'function'
              name: 'FunctionName', // Ensure name is always a valid string
              content: message.content,
            };
          }
          return {
            role: 'assistant', // Explicitly set role to 'assistant'
            content: message.content,
          };
        }),
        temperature: 0.7,
        max_tokens: 800,
      }) as any;
      const responseContent = completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
      const xpAwarded = this.calculateXpAward(prompt, responseContent);
      return { content: responseContent, xpAwarded };
    } catch (error) {
      console.error('Error generating response from Groq:', error);
      return {
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again later.",
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
      case 1: // General Tutor
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
      case 10: // Personal AI Coach
        systemMessage = `You are the Personal AI Coach, an advanced AI assistant in the Study Nova platform.
Your role is to provide personalized learning guidance based on a student's tasks, subjects, and progress.
Analyze the student's strengths and areas for improvement to suggest targeted study strategies.
Recommend specific resources and approaches tailored to their learning style and goals.
Provide holistic support that considers both academic performance and learning well-being.
When asked about tasks or subjects, provide specific recommendations for how to approach them.
You can suggest study plans that prioritize weak subjects while maintaining progress in strong ones.`;
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