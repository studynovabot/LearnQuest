import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Coins, Award, Crown, Flame, Palette, Tag, User, Shield } from 'lucide-react';
import FeatureAccess from '@/components/subscription/FeatureAccess';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'title' | 'badge' | 'theme' | 'streak' | 'boost';
  icon: React.ReactNode;
  bgColor: string;
  isGoatExclusive?: boolean;
  isOwned?: boolean;
  isEquipped?: boolean;
}

const NovaStore: React.FC = () => {
  const { user } = useUserContext();
  const { isOnPlanOrHigher } = useFeatureAccess();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const isGoat = isOnPlanOrHigher('goat');
  const novaCoins = user?.novaCoins || 45;
  
  // Mock store items
  const storeItems: StoreItem[] = [
    // Titles
    {
      id: 'title-1',
      name: 'Memory Master',
      description: 'Show off your exceptional memory skills',
      price: 30,
      category: 'title',
      icon: <Award className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-blue-400 to-purple-500',
      isOwned: false
    },
    {
      id: 'title-2',
      name: 'Quiz Champion',
      description: 'For those who excel at quizzes',
      price: 30,
      category: 'title',
      icon: <Award className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-green-400 to-teal-500',
      isOwned: true,
      isEquipped: true
    },
    {
      id: 'title-3',
      name: 'Nova Legend',
      description: 'Only for the true legends',
      price: 100,
      category: 'title',
      icon: <Crown className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
      isGoatExclusive: true,
      isOwned: false
    },
    
    // Badges
    {
      id: 'badge-1',
      name: 'Star Student',
      description: 'A badge for outstanding students',
      price: 50,
      category: 'badge',
      icon: <Award className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      isOwned: false
    },
    {
      id: 'badge-2',
      name: 'GOAT Badge',
      description: 'Exclusive badge for GOAT subscribers',
      price: 100,
      category: 'badge',
      icon: <Crown className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      isGoatExclusive: true,
      isOwned: isGoat
    },
    
    // Themes
    {
      id: 'theme-1',
      name: 'Midnight Blue',
      description: 'A dark blue theme for night owls',
      price: 40,
      category: 'theme',
      icon: <Palette className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-blue-800 to-indigo-900',
      isOwned: false
    },
    {
      id: 'theme-2',
      name: 'Royal Purple',
      description: 'A luxurious purple theme',
      price: 40,
      category: 'theme',
      icon: <Palette className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-purple-700 to-indigo-800',
      isGoatExclusive: true,
      isOwned: false
    },
    
    // Streak items
    {
      id: 'streak-1',
      name: 'Streak Shield',
      description: 'Protect your streak for one day',
      price: 50,
      category: 'streak',
      icon: <Shield className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-amber-400 to-red-500',
      isOwned: false
    },
    
    // Boosts
    {
      id: 'boost-1',
      name: '2x SP Boost (1 day)',
      description: 'Double your SP earnings for 24 hours',
      price: 75,
      category: 'boost',
      icon: <Flame className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
      isOwned: false
    }
  ];
  
  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === activeTab);
  
  // Handle purchase
  const handlePurchase = (item: StoreItem) => {
    if (item.isOwned) {
      // If already owned, equip it
      console.log(`Equipping ${item.name}`);
      // Here you would update the user's equipped items
    } else if (novaCoins >= item.price) {
      // If not owned and have enough coins, purchase it
      console.log(`Purchasing ${item.name} for ${item.price} Nova Coins`);
      // Here you would update the user's owned items and deduct coins
    } else {
      // Not enough coins
      console.log(`Not enough Nova Coins to purchase ${item.name}`);
      // Here you would show an error message
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5 text-purple-500" />
          Nova Store
        </CardTitle>
        <CardDescription>Spend your Nova Coins on exclusive items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6 p-3 bg-muted rounded-lg">
          <div className="flex items-center">
            <Coins className="h-5 w-5 mr-2 text-purple-500" />
            <span className="font-medium">Your Nova Coins:</span>
          </div>
          <div className="text-xl font-bold">{novaCoins}</div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="title">Titles</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="theme">Themes</TabsTrigger>
            <TabsTrigger value="streak">Streak</TabsTrigger>
            <TabsTrigger value="boost">Boosts</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id}>
              {item.isGoatExclusive && !isGoat ? (
                <FeatureAccess featureKey="exclusive_store_items" teaser={true} blurIntensity={3}>
                  <StoreItemCard item={item} onPurchase={handlePurchase} novaCoins={novaCoins} />
                </FeatureAccess>
              ) : (
                <StoreItemCard item={item} onPurchase={handlePurchase} novaCoins={novaCoins} />
              )}
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No items found in this category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StoreItemCardProps {
  item: StoreItem;
  onPurchase: (item: StoreItem) => void;
  novaCoins: number;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, onPurchase, novaCoins }) => {
  const canAfford = novaCoins >= item.price;
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`h-32 ${item.bgColor} flex items-center justify-center`}>
        {item.icon}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium">{item.name}</h3>
          {item.isGoatExclusive && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
              GOAT
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-1 text-purple-500" />
            <span className="text-sm font-medium">{item.price}</span>
          </div>
          {item.isOwned ? (
            <Button 
              size="sm" 
              variant={item.isEquipped ? "default" : "outline"}
              onClick={() => onPurchase(item)}
            >
              {item.isEquipped ? "Equipped" : "Equip"}
            </Button>
          ) : (
            <Button 
              size="sm" 
              disabled={!canAfford}
              variant={canAfford ? "default" : "outline"}
              onClick={() => onPurchase(item)}
            >
              {canAfford ? "Purchase" : "Not enough coins"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovaStore;