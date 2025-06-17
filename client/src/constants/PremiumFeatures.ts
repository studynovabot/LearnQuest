// Premium features definition for StudyNova
// This file defines all premium features and their access levels

export const PREMIUM_FEATURES = {
  // Free features (limited functionality)
  FREE: [
    'basic_chat',                  // Basic chat with AI (limited responses)
    'limited_answers',             // Only 25% of answer revealed
    'basic_flashcards',            // Limited flashcards (5 per day)
    'basic_study_points',          // Normal Study Points, capped daily (100 SP/day)
    'basic_leaderboard',           // View leaderboard but no special features
    'basic_revision',              // 2 uses/day of AI revision
    'basic_streak',                // Streak tracking with basic rewards
  ],
  
  // Pro features (enhanced functionality)
  PRO: [
    'full_answers',                // Complete answers with full explanation
    'topper_format',               // CBSE-style formatted answers
    'pdf_export',                  // Export answers to PDF
    'rank_predictor',              // AIR Rank Simulator
    'smart_study_plan',            // Personalized study plan
    'unlimited_flashcards',        // Unlimited flashcards
    'unlimited_revision',          // Unlimited AI revision sessions
    'sp_multiplier',               // Higher SP cap (500 SP/day)
    'nova_coins_earning',          // Ability to earn Nova Coins
    'boss_battle_mode',            // Exam-style quizzes
    'weak_chapter_detection',      // AI identifies weak areas
    'streak_booster',              // Weekly streak boosters (2x SP on Sundays)
    'streak_insurance',            // 1 streak restore per month
    'ai_tutor_lite',               // Subject-wise help, name memory
  ],
  
  // GOAT features (premium functionality)
  GOAT: [
    'double_sp_multiplier',        // 2x Study Point multiplier on all activities
    'ai_tutor_elite',              // Remembers name, weak subjects, and writing style
    'goat_badge',                  // Special badge on leaderboard and chat
    'exclusive_store_items',       // Exclusive items in the store
    'high_sp_cap',                 // 1000 SP/day cap
    'study_lounge_access',         // Access to "Study Lounge" for GOAT users
    'monthly_rank_certificate',    // Monthly rank certificate (PDF + shareable)
    'priority_support',            // Fast-track customer support
    'early_access',                // Early access to new features
    'double_streak_insurance',     // 2 streak restores per month
  ]
};

// Feature descriptions for UI display
export const FEATURE_DESCRIPTIONS = {
  // Free features
  'basic_chat': 'Chat with AI tutors (5 text, 2 image questions/day)',
  'limited_answers': 'View partial answers (25% revealed)',
  'basic_flashcards': 'Create up to 5 flashcards per day',
  'basic_study_points': 'Earn Study Points with 100 SP/day cap',
  'basic_leaderboard': 'View your position on the leaderboard',
  'basic_revision': '2 AI revision sessions per day',
  'basic_streak': 'Earn streak bonuses (max 3/day)',
  
  // Pro features
  'full_answers': 'Unlock complete, detailed answers',
  'topper_format': 'Get answers in CBSE topper format',
  'pdf_export': 'Download answers as PDF',
  'rank_predictor': 'Predict your AIR rank based on performance',
  'smart_study_plan': 'Get a personalized study plan',
  'unlimited_flashcards': 'Create unlimited AI-generated flashcards',
  'unlimited_revision': 'Unlimited AI revision sessions',
  'sp_multiplier': 'Higher daily SP cap (500 SP/day)',
  'nova_coins_earning': 'Earn Nova Coins based on weekly performance',
  'boss_battle_mode': 'Challenge yourself with exam-style quizzes',
  'weak_chapter_detection': 'AI identifies your weak areas',
  'streak_booster': 'Weekly streak boosters (2x SP on Sundays)',
  'streak_insurance': '1 streak restore per month',
  'ai_tutor_lite': 'AI Tutor remembers your name and subjects',
  
  // GOAT features
  'double_sp_multiplier': '2x Study Point multiplier on all activities',
  'ai_tutor_elite': 'AI Tutor remembers your name, weak subjects, and writing style',
  'goat_badge': 'Special GOAT badge on leaderboard and chat',
  'exclusive_store_items': 'Access to exclusive store items',
  'high_sp_cap': 'Higher daily SP cap (1000 SP/day)',
  'study_lounge_access': 'Access to exclusive "Study Lounge"',
  'monthly_rank_certificate': 'Monthly rank certificate (PDF + shareable)',
  'priority_support': 'Fast-track customer support',
  'early_access': 'Early access to new features',
  'double_streak_insurance': '2 streak restores per month',
};

// Required subscription level for each feature
export const FEATURE_SUBSCRIPTION_LEVEL = {
  // Free features
  'basic_chat': 'free',
  'limited_answers': 'free',
  'basic_flashcards': 'free',
  'basic_study_points': 'free',
  'basic_leaderboard': 'free',
  'basic_revision': 'free',
  'basic_streak': 'free',
  
  // Pro features
  'full_answers': 'pro',
  'topper_format': 'pro',
  'pdf_export': 'pro',
  'rank_predictor': 'pro',
  'smart_study_plan': 'pro',
  'unlimited_flashcards': 'pro',
  'unlimited_revision': 'pro',
  'sp_multiplier': 'pro',
  'nova_coins_earning': 'pro',
  'boss_battle_mode': 'pro',
  'weak_chapter_detection': 'pro',
  'streak_booster': 'pro',
  'streak_insurance': 'pro',
  'ai_tutor_lite': 'pro',
  
  // GOAT features
  'double_sp_multiplier': 'goat',
  'ai_tutor_elite': 'goat',
  'goat_badge': 'goat',
  'exclusive_store_items': 'goat',
  'high_sp_cap': 'goat',
  'study_lounge_access': 'goat',
  'monthly_rank_certificate': 'goat',
  'priority_support': 'goat',
  'early_access': 'goat',
  'double_streak_insurance': 'goat',
};

// Daily SP caps for each plan
export const DAILY_SP_CAPS = {
  'free': 100,
  'pro': 500,
  'goat': 1000
};

// SP multipliers for each plan
export const SP_MULTIPLIERS = {
  'free': 1,
  'pro': 1,
  'goat': 2
};

// Streak insurance tokens for each plan
export const STREAK_INSURANCE = {
  'free': 0,
  'pro': 1,
  'goat': 2
};

// Check if a feature is premium (pro or goat)
export function isPremiumFeature(featureKey: string): boolean {
  return PREMIUM_FEATURES.PRO.includes(featureKey) || PREMIUM_FEATURES.GOAT.includes(featureKey);
}

// Check if a feature is GOAT-only
export function isGoatFeature(featureKey: string): boolean {
  return PREMIUM_FEATURES.GOAT.includes(featureKey);
}

// Check if a user has access to a feature
export function hasFeatureAccess(featureKey: string, userSubscription: 'free' | 'pro' | 'goat', isAdmin: boolean = false): boolean {
  // Admin users have access to all features
  if (isAdmin) {
    return true;
  }
  
  const requiredLevel = FEATURE_SUBSCRIPTION_LEVEL[featureKey];
  
  if (requiredLevel === 'free') {
    return true; // Everyone has access to free features
  }
  
  if (requiredLevel === 'pro') {
    return userSubscription === 'pro' || userSubscription === 'goat'; // Pro and GOAT users have access to pro features
  }
  
  if (requiredLevel === 'goat') {
    return userSubscription === 'goat'; // Only GOAT users have access to GOAT features
  }
  
  return false;
}