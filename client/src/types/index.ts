export interface Subscription {
  tier: 'free' | 'pro' | 'goat'; // Plan tier
  status: 'active' | 'trial' | 'expired' | 'canceled'; // Subscription status
  expiry: Date; // Expiry date
  startDate: Date; // Start date
  duration: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'; // Billing cycle
  autoRenew: boolean; // Auto-renewal status
  paymentMethod?: string; // Payment method used
  lastPayment?: Date; // Last payment date
  nextPayment?: Date; // Next payment date
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  isPro: boolean; // Legacy field, use subscription.tier instead
  subscriptionPlan?: 'free' | 'pro' | 'goat'; // Legacy field, use subscription.tier instead
  subscription_tier?: 'free' | 'pro' | 'goat'; // Legacy field, use subscription.tier instead
  subscriptionStatus?: 'active' | 'trial' | 'expired' | 'canceled'; // Legacy field, use subscription.status instead
  subscriptionExpiry?: Date; // Legacy field, use subscription.expiry instead
  subscription?: Subscription; // New subscription object
  className?: string; // User's class/grade
  board?: string; // Educational board (CBSE/ICSE)
  role: 'user' | 'admin'; // User role
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  isFirstLogin?: boolean; // Track if this is the user's first login session
  
  // Gamification fields
  studyPoints?: number; // Study Points (SP) for gamification (replacing XP)
  novaCoins?: number; // Nova Coins for store purchases
  dailySPEarned?: number; // Daily SP earned (resets daily)
  streak?: number; // Daily login streak
  streakInsurance?: number; // Number of streak insurance tokens remaining
  level?: number; // User level (calculated from SP)
  rank?: number; // User rank on leaderboard
  badges?: string[]; // Earned badges
  titles?: string[]; // Earned titles
  equippedTitle?: string; // Currently equipped title
  equippedBadge?: string; // Currently equipped badge
  
  // Profile fields
  profilePic?: string | null; // Profile picture URL
  lastSPReset?: Date; // Last time the daily SP was reset
  
  // Store purchases
  ownedItems?: string[]; // IDs of items owned in the store
  equippedItems?: { [category: string]: string }; // Currently equipped items by category
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


