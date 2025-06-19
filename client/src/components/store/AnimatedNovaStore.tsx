import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserContext } from '@/context/UserContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useMascot } from '@/hooks/useMascot';
import { 
  Coins, Award, Crown, Flame, Palette, Tag, User, Shield, 
  Sparkles, Star, CheckCircle, Lock, ShoppingBag, Zap
} from 'lucide-react';
import FeatureAccess from '@/components/subscription/FeatureAccess';
import confetti from 'canvas-confetti';

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
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PurchaseEffectProps {
  item: StoreItem;
  onComplete: () => void;
}

const PurchaseEffect: React.FC<PurchaseEffectProps> = ({ item, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        {/* Item Card */}
        <motion.div
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`${item.bgColor} rounded-xl p-6 mb-6 shadow-lg`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex flex-col items-center text-white">
            {React.cloneElement(item.icon as React.ReactElement, {
              className: "h-12 w-12 mb-2"
            })}
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p className="text-white/80 text-sm">{item.description}</p>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Purchase Successful! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {item.name} has been added to your collection!
          </p>
        </motion.div>

        {/* Sparkle Effects */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              x: [0, Math.cos(i * 60) * 100, 0],
              y: [0, Math.sin(i * 60) * 100, 0]
            }}
            transition={{ 
              duration: 2,
              delay: 0.8 + i * 0.1,
              repeat: 1
            }}
            style={{
              left: '50%',
              top: '50%',
              translateX: '-50%',
              translateY: '-50%'
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        ))}

        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg font-semibold transition-all"
        >
          Awesome!
        </Button>
      </motion.div>
    </motion.div>
  );
};

const AnimatedNovaStore: React.FC = () => {
  const { user } = useUserContext();
  const { isOnPlanOrHigher } = useFeatureAccess();
  const { celebratePurchase } = useMascot();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [purchaseEffect, setPurchaseEffect] = useState<StoreItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const isGoat = isOnPlanOrHigher('goat');
  const novaCoins = user?.novaCoins || 245;
  
  // Enhanced store items with rarity
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
      isOwned: false,
      rarity: 'rare'
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
      isEquipped: true,
      rarity: 'common'
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
      isOwned: false,
      rarity: 'legendary'
    },
    {
      id: 'title-4',
      name: 'Streak Master',
      description: 'Master of maintaining learning streaks',
      price: 75,
      category: 'title',
      icon: <Flame className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-red-400 to-pink-500',
      isOwned: false,
      rarity: 'epic'
    },
    
    // Badges
    {
      id: 'badge-1',
      name: 'Star Student',
      description: 'A badge for outstanding students',
      price: 50,
      category: 'badge',
      icon: <Star className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      isOwned: false,
      rarity: 'rare'
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
      isOwned: isGoat,
      rarity: 'legendary'
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
      isOwned: false,
      rarity: 'common'
    },
    {
      id: 'theme-2',
      name: 'Royal Purple',
      description: 'A luxurious purple theme',
      price: 60,
      category: 'theme',
      icon: <Palette className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-purple-700 to-indigo-800',
      isGoatExclusive: true,
      isOwned: false,
      rarity: 'epic'
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
      isOwned: false,
      rarity: 'rare'
    },
    
    // Boosts
    {
      id: 'boost-1',
      name: '2x SP Boost (1 day)',
      description: 'Double your SP earnings for 24 hours',
      price: 75,
      category: 'boost',
      icon: <Zap className="h-16 w-16 text-white" />,
      bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
      isOwned: false,
      rarity: 'epic'
    }
  ];
  
  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === activeTab);

  // Get rarity border color
  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-400/50';
      case 'epic': return 'border-purple-400 shadow-purple-400/50';
      case 'rare': return 'border-blue-400 shadow-blue-400/50';
      default: return 'border-gray-300 shadow-gray-300/50';
    }
  };

  // Get rarity glow
  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-lg shadow-yellow-400/20';
      case 'epic': return 'shadow-lg shadow-purple-400/20';
      case 'rare': return 'shadow-lg shadow-blue-400/20';
      default: return 'shadow-md';
    }
  };

  // Handle purchase
  const handlePurchase = (item: StoreItem) => {
    if (item.isOwned) {
      // If already owned, equip it
      console.log(`Equipping ${item.name}`);
      // Here you would update the user's equipped items
    } else if (novaCoins >= item.price) {
      // Purchase animation
      setPurchaseEffect(item);
      
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF']
      });
      
      // Trigger mascot celebration
      celebratePurchase(item.name);
      
      console.log(`Purchasing ${item.name} for ${item.price} coins`);
      // Here you would handle the actual purchase logic
    }
  };

  const StoreItemCard: React.FC<{ item: StoreItem; index: number }> = ({ item, index }) => {
    const canPurchase = !item.isOwned && novaCoins >= item.price && (!item.isGoatExclusive || isGoat);
    const isLocked = item.isGoatExclusive && !isGoat;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onHoverStart={() => setHoveredItem(item.id)}
        onHoverEnd={() => setHoveredItem(null)}
        className="relative"
      >
        <Card 
          className={`overflow-hidden transition-all duration-300 ${getRarityGlow(item.rarity || 'common')} ${
            hoveredItem === item.id ? `border-2 ${getRarityBorder(item.rarity || 'common')}` : 'border'
          }`}
        >
          {/* Rarity indicator */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
            item.rarity === 'legendary' ? 'bg-yellow-400 text-yellow-900' :
            item.rarity === 'epic' ? 'bg-purple-400 text-purple-900' :
            item.rarity === 'rare' ? 'bg-blue-400 text-blue-900' :
            'bg-gray-400 text-gray-900'
          }`}>
            {item.rarity?.toUpperCase()}
          </div>

          <CardContent className="p-0">
            {/* Item Display */}
            <div className={`${item.bgColor} p-6 text-white text-center relative overflow-hidden`}>
              {isLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              )}
              
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={hoveredItem === item.id ? {
                  background: [
                    'radial-gradient(circle at 20% 20%, white 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 80%, white 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 20%, white 0%, transparent 50%)'
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                animate={hoveredItem === item.id ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: "h-16 w-16 mx-auto mb-4"
                })}
              </motion.div>
              
              {item.isOwned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-2"
                >
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </motion.div>
              )}
              
              {item.isEquipped && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute top-2 left-8"
                >
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </div>
            
            {/* Item Details */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center justify-between">
                {item.name}
                {item.isGoatExclusive && (
                  <Crown className="h-4 w-4 text-amber-500" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              
              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-amber-600">{item.price}</span>
                </div>
                
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={!canPurchase && !item.isOwned}
                  className={`${
                    item.isOwned 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : canPurchase 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400'
                  } transition-all hover:shadow-lg`}
                  size="sm"
                >
                  {item.isOwned 
                    ? (item.isEquipped ? 'Equipped' : 'Equip')
                    : isLocked 
                    ? 'GOAT Only' 
                    : canPurchase 
                    ? 'Buy' 
                    : 'Not enough coins'
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingBag className="mr-2 h-6 w-6" />
              Nova Store
            </div>
            <motion.div 
              className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coins className="h-5 w-5 text-amber-300" />
              <span className="font-bold text-lg">{novaCoins.toLocaleString()}</span>
            </motion.div>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Customize your learning experience with exclusive items and upgrades
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Store Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="title">Titles</TabsTrigger>
          <TabsTrigger value="badge">Badges</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="boost">Boosts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <StoreItemCard key={item.id} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase Effect */}
      <AnimatePresence>
        {purchaseEffect && (
          <PurchaseEffect
            item={purchaseEffect}
            onComplete={() => setPurchaseEffect(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedNovaStore;