import { useUserContext } from "@/context/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QuestionRating } from "@/types";
import { useState } from "react";

export function useXp() {
  const { user, refreshUser } = useUserContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["/api/subjects", user?.id],
    queryFn: async () => {
      // Create a custom fetch request with headers
      const headers: Record<string, string> = {
        'x-user-id': user?.id || 'demo-user'
      };

      const response = await fetch('/api/subjects', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!user,
  });

  const awardXpForAnswerMutation = useMutation({
    mutationFn: async (rating: QuestionRating) => {
      const response = await apiRequest("POST", "/api/rating/answer", { rating });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.xpAwarded > 0) {
        toast({
          title: "XP Awarded!",
          description: `You earned +${data.xpAwarded} XP for your ${data.rating.replace('_', ' ')} answer!`,
        });

        refreshUser();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Award XP",
        description: error instanceof Error ? error.message : "An error occurred while awarding XP.",
        variant: "destructive",
      });
    },
  });

  const awardXpMutation = useMutation({
    mutationFn: async ({ email, amount, reason }: { email: string; amount: number; reason?: string }) => {
      const response = await apiRequest("POST", "/api/xp/award", { email, amount, reason });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "XP Awarded!",
        description: `${data.user.displayName} was awarded +${data.awarded} XP for ${data.reason}!`,
      });

      refreshUser();
    },
    onError: (error) => {
      toast({
        title: "Failed to Award XP",
        description: error instanceof Error ? error.message : "An error occurred while awarding XP.",
        variant: "destructive",
      });
    },
  });

  const awardXpForAnswer = async (rating: QuestionRating) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await awardXpForAnswerMutation.mutateAsync(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const awardXp = async (email: string, amount: number, reason?: string) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await awardXpMutation.mutateAsync({ email, amount, reason });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = (xp: number) => {
    const level = Math.floor(xp / 750) + 1;
    const nextLevelXp = level * 750;
    const currentLevelXp = (level - 1) * 750;
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

    return {
      level,
      progress,
      nextLevelXp,
      currentXp: xp,
      xpToNextLevel: nextLevelXp - xp
    };
  };

  return {
    subjects,
    isLoading: isLoadingSubjects || isSubmitting,
    awardXpForAnswer,
    awardXp,
    calculateProgress
  };
}
