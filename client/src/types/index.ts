export interface User {
  id: string;
  email: string;
  displayName: string;
  isPro: boolean;
  subscriptionPlan: 'free' | 'pro' | 'goat'; // Specific plan type - making this required
  subscription_tier?: 'free' | 'pro' | 'goat'; // Alternative field for subscription tier
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'canceled'; // Making this required
  subscriptionExpiry: Date; // Making this required
  className?: string; // User's class/grade
  board?: string; // Educational board (CBSE/ICSE)
  role: 'user' | 'admin'; // User role - making this required
  createdAt: Date; // Making this required
  updatedAt: Date; // Making this required
  lastLogin: Date | null; // Making this required
  isFirstLogin?: boolean; // Track if this is the user's first login session
  studyPoints?: number; // Study Points (SP) for gamification (replacing XP)
  novaCoins?: number; // Nova Coins for store purchases
  dailySPEarned?: number; // Daily SP earned (resets daily)
  streak?: number; // Daily login streak
  streakInsurance?: number; // Number of streak insurance tokens remaining
  profilePic?: string | null; // Profile picture URL
  lastSPReset?: Date; // Last time the daily SP was reset
}

export interface Subject {
  id: number;
  name: string;
  progress: number;
  status: 'needs_improvement' | 'average' | 'good' | 'excellent';
}



export interface AITutor {
  id: string | number;
  name: string;
  avatarUrl?: string;
  subject?: string;
  iconName?: string;
  color?: string;
}

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  agentId?: string;
}

// Educational Content Types
export interface EducationalContent {
  id: string;
  title: string;
  type: 'flow-charts' | 'ncert-solutions';
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
  title: string;
  type: 'flow-charts' | 'ncert-solutions';
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadPath: string;
  downloadUrl: string;
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

export interface ContentRequest {
  type: 'flow-charts' | 'ncert-solutions';
  // ... existing code ...
}


