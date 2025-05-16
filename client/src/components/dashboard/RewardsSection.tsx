import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BagIcon, StarIcon } from "@/components/ui/icons";
import { useStore } from "@/hooks/useStore";
import { Link } from "wouter";
import { motion } from "framer-motion";

const RewardsSection = () => {
  const { storeItems, isLoading } = useStore();
  
  // Ensure storeItems is an array and check if there are any unlockable items
  const storeItemsArray = Array.isArray(storeItems) ? storeItems : [];
  const newItemsAvailable = storeItemsArray.some(item => !item.unlocked);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <motion.div 
            className="w-32 h-32 flex items-center justify-center mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="w-16 h-20 bg-primary rounded-lg flex items-center justify-center">
                <BagIcon className="text-white" size={32} />
              </div>
              <motion.div 
                className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <StarIcon className="text-white" size={14} />
              </motion.div>
            </div>
          </motion.div>
          
          <p className="text-lg font-semibold mb-1">
            {newItemsAvailable ? "New items available" : "Check out the store"}
          </p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {newItemsAvailable 
              ? "Unlock special items with your earned XP" 
              : "Complete tasks to earn XP for rewards"}
          </p>
          
          <Link href="/store">
            <Button className="bg-primary hover:bg-primary/90 transition rounded-lg px-6 py-3 font-medium">
              Go to Store
            </Button>
          </Link>
        </div>
        
        <div className="border-t border-border mt-4 pt-4">
          <p className="text-sm text-muted-foreground mb-2">Your next reward:</p>
          <div className="flex items-center justify-between bg-muted rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <StarIcon className="text-secondary" size={16} />
              </div>
              <span className="font-medium">
                {storeItemsArray.length > 0 && !storeItemsArray[0].unlocked
                  ? storeItemsArray[0].name
                  : "Math Master Title"}
              </span>
            </div>
            <span className="text-sm font-bold">
              {storeItemsArray.length > 0 && !storeItemsArray[0].unlocked
                ? `${storeItemsArray[0].price} XP`
                : "500 XP"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsSection;
