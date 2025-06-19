import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  NovaBot,
  MascotDialogue,
  AnimatedXPSystem,
  AnimatedStreakSystem,
  MagicalWelcome,
  AnimatedNovaStore,
  AnimatedButton,
  FloatingFeedback,
  PulsingHeart,
  ProgressRing,
  SparkleEffect,
  HoverCard,
  LoadingSkeleton,
  useMascot,
  useMicroInteractions
} from '../emotional-design';
import { 
  Sparkles, Heart, Zap, Award, Crown, Star, 
  PlayCircle, RotateCcw, TestTube, Smile 
} from 'lucide-react';

const EmotionalDesignDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('mascot');
  const [showWelcome, setShowWelcome] = useState(false);
  const [xpGain, setXpGain] = useState(false);
  const [streakBonus, setStreakBonus] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [progress, setProgress] = useState(65);
  const [isLiked, setIsLiked] = useState(false);
  
  const { mascotState, showMascot, hideMascot, celebrateCorrectAnswer, encourageWrongAnswer, celebrateStreak } = useMascot();
  const { 
    feedbacks, 
    triggerCorrectAnswer, 
    triggerIncorrectAnswer, 
    triggerXPGain, 
    triggerAchievement,
    triggerTaskCompletion,
    celebrateWithConfetti 
  } = useMicroInteractions();

  const handleDemoAction = (action: string) => {
    switch (action) {
      case 'correct':
        celebrateCorrectAnswer();
        triggerCorrectAnswer({ x: 50, y: 30 }, 25);
        break;
      case 'wrong':
        encourageWrongAnswer();
        triggerIncorrectAnswer({ x: 50, y: 30 });
        break;
      case 'streak':
        celebrateStreak(7);
        setStreakBonus(true);
        setTimeout(() => setStreakBonus(false), 2000);
        break;
      case 'xp':
        triggerXPGain(50, { x: 50, y: 40 });
        setXpGain(true);
        setTimeout(() => setXpGain(false), 2000);
        break;
      case 'achievement':
        triggerAchievement('Quiz Master');
        break;
      case 'task':
        triggerTaskCompletion('Daily Challenge', 30);
        break;
      case 'confetti':
        celebrateWithConfetti('high');
        break;
      case 'sparkles':
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 2000);
        break;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Sparkles className="mr-3 h-8 w-8" />
            Emotional Design System Demo
          </CardTitle>
          <p className="text-purple-100">
            Experience the magic of emotional design in Study Nova! 
            This demo showcases all the delightful interactions that make learning engaging and fun.
          </p>
        </CardHeader>
      </Card>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlayCircle className="mr-2 h-6 w-6 text-green-600" />
            Interactive Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatedButton
              variant="success"
              onClick={() => handleDemoAction('correct')}
              className="flex items-center justify-center space-x-2"
            >
              <Award className="h-4 w-4" />
              <span>Correct Answer</span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="danger"
              onClick={() => handleDemoAction('wrong')}
              className="flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Wrong Answer</span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              onClick={() => handleDemoAction('streak')}
              className="flex items-center justify-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Streak Bonus</span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              onClick={() => handleDemoAction('xp')}
              className="flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>XP Gain</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => handleDemoAction('achievement')}
              className="flex items-center justify-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Achievement</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => handleDemoAction('task')}
              className="flex items-center justify-center space-x-2"
            >
              <TestTube className="h-4 w-4" />
              <span>Task Complete</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => handleDemoAction('confetti')}
              className="flex items-center justify-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Confetti</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => setShowWelcome(true)}
              className="flex items-center justify-center space-x-2"
            >
              <Smile className="h-4 w-4" />
              <span>Welcome Flow</span>
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>

      {/* Demo Sections */}
      <Tabs value={activeDemo} onValueChange={setActiveDemo}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="mascot">Mascot</TabsTrigger>
          <TabsTrigger value="xp">XP System</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="interactions">Micro-interactions</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        {/* Mascot Demo */}
        <TabsContent value="mascot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>NovaBot - AI Study Companion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                <div className="text-center">
                  <NovaBot emotion="idle" size="lg" className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Idle</p>
                </div>
                <div className="text-center">
                  <NovaBot emotion="happy" size="lg" className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Happy</p>
                </div>
                <div className="text-center">
                  <NovaBot emotion="excited" size="lg" className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Excited</p>
                </div>
                <div className="text-center">
                  <NovaBot emotion="thinking" size="lg" className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Thinking</p>
                </div>
                <div className="text-center">
                  <NovaBot emotion="celebrating" size="lg" className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Celebrating</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => showMascot('happy', 'Welcome to StudyNova! I\'m Nova, your AI learning companion!')}>Welcome Message</Button>
                <Button onClick={() => showMascot('encouraging', 'Keep going! You\'re doing wonderfully!')}>Encouragement</Button>
                <Button onClick={() => showMascot('thinking', 'Ready to continue your learning journey?')}>Study Reminder</Button>
                <Button onClick={hideMascot} variant="outline">Hide Mascot</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* XP System Demo */}
        <TabsContent value="xp" className="space-y-6">
          <AnimatedXPSystem 
            showXPGain={xpGain}
            xpGained={50}
            onXPAnimationComplete={() => setXpGain(false)}
          />
        </TabsContent>

        {/* Streak System Demo */}
        <TabsContent value="streak" className="space-y-6">
          <AnimatedStreakSystem 
            showStreakGain={streakBonus}
          />
        </TabsContent>

        {/* Store Demo */}
        <TabsContent value="store" className="space-y-6">
          <AnimatedNovaStore />
        </TabsContent>

        {/* Micro-interactions Demo */}
        <TabsContent value="interactions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatedButton variant="primary">Primary Button</AnimatedButton>
                <AnimatedButton variant="secondary">Secondary Button</AnimatedButton>
                <AnimatedButton variant="success">Success Button</AnimatedButton>
                <AnimatedButton variant="danger">Danger Button</AnimatedButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span>Like this demo:</span>
                  <PulsingHeart
                    isLiked={isLiked}
                    onToggle={() => setIsLiked(!isLiked)}
                    size="lg"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <span>Progress Ring:</span>
                  <ProgressRing progress={progress} size={80}>
                    <span className="text-sm font-bold">{progress}%</span>
                  </ProgressRing>
                </div>
                
                <Button 
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  size="sm"
                >
                  Increase Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Demo */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LoadingSkeleton className="h-4 w-full" variant="text" />
                <LoadingSkeleton className="h-32 w-full" variant="rectangle" />
                <LoadingSkeleton className="h-16 w-16" variant="circle" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hover Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <HoverCard
                  hoverContent={
                    <div>
                      <h4 className="font-semibold mb-2">Hover Card</h4>
                      <p className="text-sm text-gray-600">
                        This is additional information that appears on hover with smooth animations!
                      </p>
                    </div>
                  }
                >
                  <div className="p-4 bg-blue-100 rounded-lg cursor-pointer">
                    Hover over me for more info!
                  </div>
                </HoverCard>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sparkle Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <SparkleEffect
                  trigger={showSparkles}
                  onComplete={() => setShowSparkles(false)}
                >
                  <div className="p-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg text-white text-center font-bold text-xl">
                    ✨ Magical Content ✨
                  </div>
                </SparkleEffect>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Feedbacks */}
      {feedbacks.map(feedback => (
        <FloatingFeedback
          key={feedback.id}
          type={feedback.type}
          message={feedback.message}
          position={feedback.position}
          value={feedback.value}
          onComplete={() => {}}
        />
      ))}

      {/* Mascot Dialogue */}
      {mascotState.isVisible && (
        <MascotDialogue
          message={mascotState.message}
          emotion={mascotState.emotion}
          position={mascotState.position === 'bottom-right' ? 'right' : mascotState.position === 'bottom-left' ? 'left' : 'center'}
          onClose={hideMascot}
        />
      )}

      {/* Welcome Flow */}
      {showWelcome && (
        <MagicalWelcome
          isFirstTime={true}
          onComplete={() => setShowWelcome(false)}
          onSkip={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
};

export default EmotionalDesignDemo;