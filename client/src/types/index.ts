export interface User {
  id: string;
  username: string;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  isPro: boolean;
  title?: string;
  avatarUrl?: string;
  questionsCompleted: number;
  hoursStudied: number;
  maxLevel?: number; // Optional for database compatibility
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date | null;
}

export interface Subject {
  id: number;
  name: string;
  progress: number;
  status: 'needs_improvement' | 'average' | 'good' | 'excellent';
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  xpReward: number;
  priority: 'low' | 'medium' | 'high';
  progress?: number;
}

export interface AITutor {
  id: string | number;
  name: string;
  avatarUrl?: string;
  subject?: string;
  unlocked: boolean;
  xpRequired?: number;
  iconName?: string;
  color?: string;
}

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  agentId?: string;
  xpAwarded?: number;
}

export interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string;
  xp: number;
  streak: number;
  rank: number;
  progress: number;
  avatarUrl?: string;
  isCurrentUser: boolean;
}

export interface StoreItem {
  id: number;
  name: string;
  description: string;
  type: 'theme' | 'title' | 'badge' | 'avatar';
  price: number;
  unlocked: boolean;
  iconName: string;
  gradient: string[];
}

export interface DailyQuote {
  quote: string;
  author: string;
}

export interface UpcomingTest {
  id: number;
  title: string;
  subject: string;
  daysRemaining: number;
}

export type QuestionRating = 'amazing' | 'decent' | 'needs_improvement' | 'incorrect';

export interface StreakDay {
  day: string;
  completed: boolean;
  isToday: boolean;
}
