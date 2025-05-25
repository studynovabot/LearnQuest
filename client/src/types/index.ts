export interface User {
  id: string;
  email: string;
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
  className?: string; // User's class/grade
  board?: string; // Educational board (CBSE/ICSE)
  role?: 'user' | 'admin'; // User role
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

// Educational Content Types
export interface EducationalContent {
  id: string;
  title: string;
  type: 'flash-notes' | 'flow-charts' | 'ncert-solutions' | 'textbook-solutions';
  board: string; // CBSE, ICSE, etc.
  class: string; // 6, 7, 8, 9, 10, 11, 12
  subject: string;
  chapter?: string;
  content: any; // JSON content structure
  originalFileName?: string;
  fileUrl?: string;
  extractedText?: string;
  status: 'draft' | 'processing' | 'published' | 'archived';
  uploadedBy: string; // User ID
  verifiedBy?: string; // Admin ID who verified
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number; // in minutes
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ContentUpload {
  id: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadPath: string;
  downloadUrl: string;
  type: 'flash-notes' | 'flow-charts' | 'ncert-solutions' | 'textbook-solutions';
  board: string;
  class: string;
  subject: string;
  chapter?: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  uploadedBy: string;
  processingLog: string[];
  extractedContentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFilter {
  board?: string;
  class?: string;
  subject?: string;
  chapter?: string;
  type?: string;
  difficulty?: string;
  status?: string;
  search?: string;
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
