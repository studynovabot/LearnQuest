// Premium features definition for StudyNova
// This file defines all premium features and their access levels

export const PREMIUM_FEATURES = {
  // Free features (limited functionality)
  FREE: [
    'basic_chat',                  // Basic chat with AI (limited responses)
    'limited_answers',             // Only 25% of answer revealed
    'basic_flashcards',            // Limited flashcards (5 per day)
    'basic_xp',                    // Normal XP, capped daily
    'basic_leaderboard',           // View leaderboard but no special features
    'basic_revision',              // 2 uses/day of AI revision
  ],
  
  // Premium features (full functionality)
  PREMIUM: [
    'full_answers',                // Complete answers with full explanation
    'topper_format',               // CBSE-style formatted answers
    'pdf_export',                  // Export answers to PDF
    'rank_predictor',              // AIR Rank Simulator
    'smart_study_plan',            // Personalized study plan
    'unlimited_flashcards',        // Unlimited flashcards
    'unlimited_revision',          // Unlimited AI revision sessions
    'xp_multiplier',               // 2x XP and streak shields
    'boss_battle_mode',            // Exam-style quizzes
    'weak_chapter_detection',      // AI identifies weak areas
    'mixed_subject_revision',      // Cross-subject revision
  ]
};

// Feature descriptions for UI display
export const FEATURE_DESCRIPTIONS = {
  'basic_chat': 'Chat with AI tutors (limited responses)',
  'limited_answers': 'View partial answers (25% revealed)',
  'basic_flashcards': 'Create up to 5 flashcards per day',
  'basic_xp': 'Earn standard XP (daily cap applies)',
  'basic_leaderboard': 'View your position on the leaderboard',
  'basic_revision': '2 AI revision sessions per day',
  
  'full_answers': 'Unlock complete, detailed answers',
  'topper_format': 'Get answers in CBSE topper format',
  'pdf_export': 'Download answers as PDF',
  'rank_predictor': 'Predict your AIR rank based on performance',
  'smart_study_plan': 'Get a personalized study plan',
  'unlimited_flashcards': 'Create unlimited AI-generated flashcards',
  'unlimited_revision': 'Unlimited AI revision sessions',
  'xp_multiplier': 'Earn 2x XP and get streak protection',
  'boss_battle_mode': 'Challenge yourself with exam-style quizzes',
  'weak_chapter_detection': 'AI identifies your weak areas',
  'mixed_subject_revision': 'Cross-subject revision sessions',
};

// Required subscription level for each feature
export const FEATURE_SUBSCRIPTION_LEVEL = {
  'basic_chat': 'free',
  'limited_answers': 'free',
  'basic_flashcards': 'free',
  'basic_xp': 'free',
  'basic_leaderboard': 'free',
  'basic_revision': 'free',
  
  'full_answers': 'premium',
  'topper_format': 'premium',
  'pdf_export': 'premium',
  'rank_predictor': 'premium',
  'smart_study_plan': 'premium',
  'unlimited_flashcards': 'premium',
  'unlimited_revision': 'premium',
  'xp_multiplier': 'premium',
  'boss_battle_mode': 'premium',
  'weak_chapter_detection': 'premium',
  'mixed_subject_revision': 'premium',
};

// Check if a feature is premium
export function isPremiumFeature(featureKey: string): boolean {
  return PREMIUM_FEATURES.PREMIUM.includes(featureKey);
}

// Check if a user has access to a feature
export function hasFeatureAccess(featureKey: string, userSubscription: 'free' | 'premium'): boolean {
  const requiredLevel = FEATURE_SUBSCRIPTION_LEVEL[featureKey];
  
  if (requiredLevel === 'free') {
    return true; // Everyone has access to free features
  }
  
  return userSubscription === 'premium'; // Only premium users have access to premium features
}