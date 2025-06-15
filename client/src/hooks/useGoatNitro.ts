import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

// Features available with Goat Nitro subscription
const GOAT_FEATURES = {
  ai_assistant: true,
  media_upload: true,
  premium_channels: true,
  custom_badges: true,
  xp_boosts: true,
};

// Features available with Pro subscription
const PRO_FEATURES = {
  ai_assistant: false,
  media_upload: true,
  premium_channels: false,
  custom_badges: false,
  xp_boosts: false,
};

// Rank thresholds
const RANKS = {
  'Novice': 0,
  'Apprentice': 100,
  'Scholar': 500,
  'Expert': 1000,
  'Master': 2500,
  'Grandmaster': 5000,
  'Legend': 10000,
};

export function useGoatNitro() {
  const { user, updateUser } = useUserContext();
  const { toast } = useToast();
  
  // State for XP and streak
  const [xp, setXp] = useState(user?.xp || 0);
  const [streak, setStreak] = useState(user?.streak || 0);
  
  // Update state when user changes
  useEffect(() => {
    if (user) {
      setXp(user.xp || 0);
      setStreak(user.streak || 0);
    }
  }, [user]);

  // Check if user has Goat Nitro
  const isGoatUser = user?.subscription_tier === 'goat';
  
  // Check if user has Pro subscription
  const isProUser = user?.subscription_tier === 'pro';

  // Check if a feature is available based on subscription
  const isFeatureAvailable = useCallback((featureKey: keyof typeof GOAT_FEATURES) => {
    if (isGoatUser) {
      return GOAT_FEATURES[featureKey];
    } else if (isProUser) {
      return PRO_FEATURES[featureKey];
    }
    return false;
  }, [isGoatUser, isProUser]);

  // Add XP to user
  const addXp = useCallback(async (amount: number, reason: string) => {
    if (!user) return;
    
    try {
      // Calculate new XP
      const newXp = xp + amount;
      
      // Update local state
      setXp(newXp);
      
      // In a real implementation, you would update the user in the database
      // For now, we'll just update the local user context
      if (updateUser) {
        updateUser({
          ...user,
          xp: newXp,
        });
      }
      
      // Show toast notification
      toast({
        title: `+${amount} XP`,
        description: reason,
        variant: 'default',
      });
      
      return newXp;
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }, [user, xp, updateUser, toast]);

  // Get user's rank based on XP
  const getUserRank = useCallback(() => {
    const ranks = Object.entries(RANKS).sort((a, b) => b[1] - a[1]);
    
    for (const [rank, threshold] of ranks) {
      if (xp >= threshold) {
        return rank;
      }
    }
    
    return 'Novice';
  }, [xp]);

  // Get badge style based on rank
  const getBadgeStyle = useCallback(() => {
    const rank = getUserRank();
    
    switch (rank) {
      case 'Novice':
        return 'bg-gray-500/10 text-gray-500';
      case 'Apprentice':
        return 'bg-green-500/10 text-green-500';
      case 'Scholar':
        return 'bg-blue-500/10 text-blue-500';
      case 'Expert':
        return 'bg-purple-500/10 text-purple-500';
      case 'Master':
        return 'bg-orange-500/10 text-orange-500';
      case 'Grandmaster':
        return 'bg-red-500/10 text-red-500';
      case 'Legend':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  }, [getUserRank]);

  return {
    xp,
    streak,
    isGoatUser,
    isProUser,
    isFeatureAvailable,
    addXp,
    getUserRank,
    getBadgeStyle,
  };
}