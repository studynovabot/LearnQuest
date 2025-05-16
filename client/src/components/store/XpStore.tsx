import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/useStore";
import { useAuth } from "@/hooks/useAuth";
import { StoreItem } from "@/types";
import { 
  SpaceshipIcon, 
  PaintBrushIcon, 
  GamepadIcon, 
  AuroraIcon,
  CrownIcon,
  RobotIcon,
  LockIcon
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const XpStore = () => {
  const { storeItems, isLoading, purchaseItem, canPurchase } = useStore();
  const { user } = useAuth();
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  
  const getItemIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'space-ship': return <SpaceshipIcon size={size} />;
      case 'paint-brush': return <PaintBrushIcon size={size} />;
      case 'gamepad': return <GamepadIcon size={size} />;
      case 'aurora': return <AuroraIcon size={size} />;
      case 'award': return <CrownIcon size={size} />;
      case 'robot': return <RobotIcon size={size} />;
      default: return <SpaceshipIcon size={size} />;
    }
  };
  
  const handlePurchase = async (itemId: number) => {
    if (purchasingId !== null) return;
    
    setPurchasingId(itemId);
    try {
      await purchaseItem(itemId);
    } finally {
      setPurchasingId(null);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">XP Store</CardTitle>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
            <path d="M12 8L15 13.2L19 14.1L15.5 18.2L16.5 22L12 20.2L7.5 22L8.5 18.2L5 14.1L9 13.2L12 8Z" fill="currentColor" />
          </svg>
          <span className="font-bold">{user?.xp || 0} XP</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.isArray(storeItems) && storeItems.map((item: StoreItem) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={!item.unlocked && canPurchase(item.price) ? { scale: 1.05 } : {}}
              className={cn(
                "bg-muted rounded-xl p-4 flex flex-col h-full",
                item.unlocked ? "border border-primary/30" : "",
                !item.unlocked && !canPurchase(item.price) ? "opacity-70" : ""
              )}
            >
              <div 
                className={cn(
                  "bg-gradient-to-br rounded-lg p-4 flex items-center justify-center mb-3 aspect-square",
                  item.gradient[0],
                  item.gradient[1]
                )}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {getItemIcon(item.iconName, 32)}
                </div>
              </div>
              <h4 className="font-medium mb-1">{item.name}</h4>
              <p className="text-xs text-muted-foreground mb-3 flex-grow">{item.description}</p>
              
              {item.unlocked ? (
                <Button variant="outline" className="bg-muted/50" disabled>
                  Unlocked
                </Button>
              ) : (
                <Button
                  onClick={() => handlePurchase(item.id)}
                  disabled={purchasingId !== null || !canPurchase(item.price)}
                  variant={canPurchase(item.price) ? "default" : "ghost"}
                  className={cn(
                    canPurchase(item.price) ? "bg-primary/90 hover:bg-primary" : "bg-muted cursor-not-allowed"
                  )}
                >
                  {purchasingId === item.id ? (
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                  ) : (
                    <>
                      {!canPurchase(item.price) && <LockIcon size={14} className="mr-1" />}
                      {item.price} XP
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default XpStore;
