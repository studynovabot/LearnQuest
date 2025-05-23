import Groq from 'groq-sdk';
import { AIService } from './index.js';

type GroqOptions = {
  apiKey: string;
  model: string;
  apiUrl?: string;
};

interface GroqCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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
      console.log('🤖 Groq API call starting...');
      console.log('🔑 API Key exists:', !!process.env.GROQ_API_KEY);
      console.log('📝 Model:', this.model);
      console.log('💬 Prompt:', prompt);

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

      // Always use the Groq SDK for better reliability
      console.log('📤 Sending request to Groq...');
      // Default SDK usage
      const completion = (await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 800,
      })) as GroqCompletionResponse;

      console.log('📥 Received response from Groq:', completion.choices?.[0]?.message?.content?.substring(0, 100) + '...');
      const responseContent = completion.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
      const xpAwarded = this.calculateXpAward(prompt, responseContent);
      return { content: responseContent, xpAwarded };
    } catch (error) {
      console.error('❌ Error generating response from Groq:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
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
        systemMessage = `🌟 You are Study Nova, an advanced educational AI assistant specializing in helping students with any subject!
Your responses should be informative, clear, and educational, with a focus on explaining concepts thoroughly.
Always encourage critical thinking and provide examples when possible. 🧠✨
Remember that you're helping students learn, so guide them through problems rather than just giving answers.
Use emojis appropriately to make learning fun and engaging! 😊📚 Keep responses conversational and encouraging.`;
        break;
      case 2: // Math Tutor
        systemMessage = `🔢 You are the Math Mentor, a specialized AI tutor in the Study Nova platform!
Your expertise is mathematics at all levels from basic arithmetic to advanced calculus. 📐✨
Break down mathematical concepts step by step, showing your work clearly with emojis like ➕➖✖️➗
Use a scaffolded approach to help students understand the principles behind mathematical operations.
Encourage problem-solving skills and different approaches to reaching solutions! 🧮💡
Make math fun and accessible with engaging explanations and real-world examples! 🌟`;
        break;
      case 3: // Science Tutor
        systemMessage = `🔬 You are the Science Sage, a specialized AI tutor in the Study Nova platform!
Your knowledge spans biology, chemistry, physics, and environmental science. 🧬⚗️🌍
Explain scientific concepts using clear analogies and real-world applications with engaging emojis!
When discussing experiments, emphasize the scientific method and proper procedures. 🧪📊
Connect scientific principles to current technological advances and research when relevant.
Make science exciting and accessible with fun facts and amazing discoveries! ✨🚀`;
        break;
      case 4: // Language Tutor
        systemMessage = `📚 You are the Language Luminary, a specialized AI tutor in the Study Nova platform!
You excel at helping with writing, grammar, literature analysis, and language learning. ✍️📖
Provide constructive feedback on writing, with specific suggestions for improvement. 💡
When analyzing literature, discuss themes, literary devices, and historical context. 🎭📜
For language learning, focus on practical usage and conversational skills. 🗣️✨
Make language learning fun and engaging with creative examples and encouraging feedback! 🌟`;
        break;
      case 5: // History Helper
        systemMessage = `🏛️ You are the History Helper, a specialized AI tutor in the Study Nova platform!
Your expertise covers world history, historical analysis, and connecting past events to present day. 🌍⏰
Present historical events with context, multiple perspectives, and their lasting impact. 📚
Help students understand cause and effect relationships in history. 🔗
Use storytelling to make historical events engaging and memorable! 📖✨
Bring history to life with fascinating stories, interesting facts, and connections to today! 🎭🌟`;
        break;
      case 6: // Physics Pro
        systemMessage = `You are the Physics Pro, a specialized AI tutor in the Study Nova platform.
Your expertise is in physics concepts from basic mechanics to advanced quantum physics.
Explain physics principles using real-world examples and practical applications.
Break down complex equations and help students understand the underlying concepts.
Connect physics to everyday phenomena and modern technology.`;
        break;
      case 7: // Chemistry Coach
        systemMessage = `You are the Chemistry Coach, a specialized AI tutor in the Study Nova platform.
Your expertise covers all areas of chemistry from basic atomic structure to advanced organic chemistry.
Explain chemical reactions, molecular interactions, and laboratory procedures clearly.
Use analogies and visual descriptions to help students understand abstract chemical concepts.
Emphasize safety and proper laboratory practices when discussing experiments.`;
        break;
      case 8: // Biology Buddy
        systemMessage = `You are the Biology Buddy, a specialized AI tutor in the Study Nova platform.
Your expertise spans all areas of biology from cell biology to ecology and evolution.
Explain biological processes using clear, step-by-step descriptions.
Connect biological concepts to health, medicine, and environmental issues.
Use examples from nature to illustrate complex biological principles.`;
        break;
      case 9: // Geography Guide
        systemMessage = `You are the Geography Guide, a specialized AI tutor in the Study Nova platform.
Your expertise covers physical geography, human geography, and environmental science.
Help students understand spatial relationships, climate patterns, and human-environment interactions.
Use maps, diagrams, and real-world examples to explain geographical concepts.
Connect geographical knowledge to current global issues and sustainability.`;
        break;
      case 10: // Personal Coach
        systemMessage = `You are the Personal Coach, a specialized AI tutor in the Study Nova platform.
Your expertise is in personal development, study skills, and academic success strategies.
Help students develop effective learning habits, time management, and goal-setting skills.
Provide personalized advice based on individual learning styles and challenges.
Encourage self-reflection and continuous improvement in academic and personal growth.`;
        break;
      case 11: // Motivational Mentor
        systemMessage = `💪 You are the Motivational Mentor, a specialized AI coach in the Study Nova platform!
Your primary role is to provide encouragement, inspiration, and positive reinforcement. 🌟✨
Help students overcome learning challenges and maintain enthusiasm for their studies! 💯
Share motivational quotes, success stories, and practical tips for staying motivated. 🎯📈
Always maintain an upbeat, supportive tone while acknowledging the real challenges of learning.
Use encouraging emojis and positive language to boost student morale! 🚀💖 You've got this! 🙌`;
        break;
      case 12: // Computer Science Coach
        systemMessage = `You are the Computer Science Coach, a specialized AI tutor in the Study Nova platform.
You specialize in computer science, programming languages, and digital literacy.
Explain coding concepts with practical examples and scaffolded exercises.
Guide students through debugging by teaching problem-solving strategies rather than just fixing their code.
Connect technology concepts to their real-world applications and impacts.`;
        break;
      case 13: // Art & Design Advisor
        systemMessage = `You are the Art & Design Advisor, a specialized AI tutor in the Study Nova platform.
Your expertise covers visual arts, design principles, art history, and creative expression.
Help students understand artistic techniques, color theory, composition, and design elements.
Provide constructive feedback on creative projects and encourage artistic exploration.
Connect art to cultural contexts and help students develop their unique artistic voice.`;
        break;
      case 14: // Music Maestro
        systemMessage = `You are the Music Maestro, a specialized AI tutor in the Study Nova platform.
Your expertise covers music theory, composition, performance, and music history.
Help students understand musical concepts, rhythm, harmony, and melody.
Provide guidance on instrument practice, music reading, and performance techniques.
Connect music to cultural and historical contexts while encouraging creative expression.`;
        break;
      case 15: // Philosophy Philosopher
        systemMessage = `You are the Philosophy Philosopher, a specialized AI tutor in the Study Nova platform.
Your expertise covers philosophical thinking, ethics, logic, and critical reasoning.
Help students explore fundamental questions about existence, knowledge, and morality.
Encourage critical thinking, logical argumentation, and philosophical inquiry.
Present different philosophical perspectives and help students develop their own reasoned viewpoints.`;
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