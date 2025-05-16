import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StoreItem } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/context/UserContext";
import { useState } from "react";

export function useStore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, refreshUser } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: storeItems = [], isLoading, error } = useQuery({
    queryKey: ["/api/store"],
    enabled: !!user
  });

  const purchaseItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("POST", `/api/store/${itemId}/purchase`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/store"] });
      
      // Ensure storeItems is an array
      const storeItemsArray = Array.isArray(storeItems) ? storeItems : [];
      
      // Find the purchased item in the updated list
      const purchasedItem = data.items.find((item: StoreItem) => 
        item.unlocked && !storeItemsArray.find((i: StoreItem) => i.id === item.id && i.unlocked));
      
      if (purchasedItem) {
        toast({
          title: "Item Purchased!",
          description: `You have successfully purchased ${purchasedItem.name} for ${purchasedItem.price} XP.`,
        });
      }
      
      refreshUser();
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "You may not have enough XP to purchase this item.",
        variant: "destructive",
      });
    },
  });

  const purchaseItem = async (itemId: number) => {
    if (isSubmitting || !user) return;
    
    try {
      setIsSubmitting(true);
      await purchaseItemMutation.mutateAsync(itemId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPurchase = (price: number) => {
    return user && user.xp >= price;
  };

  return {
    storeItems,
    isLoading: isLoading || isSubmitting,
    error,
    purchaseItem,
    canPurchase
  };
}
