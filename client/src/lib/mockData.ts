import { AITutor, ChatMessage, Task, StoreItem, Subject } from '@/types';

// Mock AI Tutors
export const mockTutors: AITutor[] = [
  {
    id: '1',
    name: 'Nova',
    subject: 'General',
    iconName: 'robot',
    color: 'blue',
    unlocked: true,
    xpRequired: 0
  },
  {
    id: '2',
    name: 'Einstein',
    subject: 'Physics',
    iconName: 'compass',
    color: 'purple',
    unlocked: true,
    xpRequired: 100
  },
  {
    id: '3',
    name: 'Pythagoras',
    subject: 'Mathematics',
    iconName: 'calculator',
    color: 'green',
    unlocked: true,
    xpRequired: 200
  },
  {
    id: '4',
    name: 'Darwin',
    subject: 'Biology',
    iconName: 'smile',
    color: 'orange',
    unlocked: false,
    xpRequired: 500
  }
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'mock-1',
    description: 'Study physics for 1 hour',
    completed: false,
    xpReward: 30,
    priority: 'high'
  },
  {
    id: 'mock-2',
    description: 'Complete math homework',
    completed: false,
    xpReward: 20,
    priority: 'medium'
  },
  {
    id: 'mock-3',
    description: 'Review biology notes',
    completed: false,
    xpReward: 15,
    priority: 'low'
  }
];

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hi',
    role: 'user',
    timestamp: Date.now() - 60000
  },
  {
    id: '2',
    content: 'Hello! I\'m Nova, your AI study buddy. How can I help you with your studies today?',
    role: 'assistant',
    timestamp: Date.now() - 55000
  }
];

// Mock Store Items
export const mockStoreItems: StoreItem[] = [
  {
    id: 1,
    name: 'Study Streak Booster',
    description: 'Maintains your study streak for 1 day if you miss a day',
    type: 'badge',
    price: 100,
    unlocked: false,
    iconName: 'star',
    gradient: ['#FF6B6B', '#4ECDC4']
  },
  {
    id: 2,
    name: 'XP Multiplier',
    description: 'Doubles XP earned for 24 hours',
    type: 'badge',
    price: 200,
    unlocked: false,
    iconName: 'zap',
    gradient: ['#A8E6CF', '#FFD93D']
  }
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  {
    id: 1,
    name: 'Mathematics',
    progress: 75,
    status: 'good'
  },
  {
    id: 2,
    name: 'Physics',
    progress: 60,
    status: 'average'
  },
  {
    id: 3,
    name: 'Biology',
    progress: 40,
    status: 'needs_improvement'
  }
];

// Helper function to determine if we should use mock data
export const shouldUseMockData = () => {
  // Check if config is already imported to avoid circular dependency
  try {
    const config = require('../config').config;
    if (typeof config.useMockData !== 'undefined') {
      return config.useMockData;
    }
  } catch (e) {
    // If config is not yet available, use the default logic
  }

  // Force mock data only if explicitly set in localStorage
  // Don't use mock data just because we're in development mode
  return localStorage.getItem('useMockData') === 'true';
};

// Helper function to generate a mock response for Nova Chat
export const generateMockResponse = (message: string, agentName: string = 'Nova'): string => {
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return `Hello! I'm ${agentName}, your AI study buddy. How can I help you with your studies today?`;
  }

  if (message.toLowerCase().includes('help')) {
    return `I'd be happy to help! As ${agentName}, I can assist with various subjects, answer questions, and provide study tips. What specific topic are you interested in?`;
  }

  if (message.toLowerCase().includes('math') || message.toLowerCase().includes('mathematics')) {
    return `Mathematics is a fascinating subject! I can help with algebra, calculus, geometry, and more. What specific math topic are you studying?`;
  }

  if (message.toLowerCase().includes('physics')) {
    return `Physics explores how the universe works! I can help with mechanics, thermodynamics, electricity, and more. What physics concept are you working on?`;
  }

  if (message.toLowerCase().includes('biology')) {
    return `Biology is the study of life! I can help with cell biology, genetics, ecology, and more. What biology topic are you interested in?`;
  }

  // Default response
  return `This is a simulated response from ${agentName}. The backend API is currently unavailable, but this allows you to test the UI. In a real deployment, this would connect to the AI service.`;
};
