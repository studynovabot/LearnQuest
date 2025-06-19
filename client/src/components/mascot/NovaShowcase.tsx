import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NovaMascot from './NovaMascot';
import NovaMascotDialogue from './NovaMascotDialogue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type MascotEmotion = 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'confused' | 'proud' | 'sleepy' | 'focused';

const emotions: { emotion: MascotEmotion; label: string; message: string }[] = [
  { emotion: 'idle', label: 'Idle', message: "Hi there! I'm Nova, your AI learning companion!" },
  { emotion: 'happy', label: 'Happy', message: "Great job! You're doing wonderfully!" },
  { emotion: 'excited', label: 'Excited', message: "This is amazing! Let's keep going!" },
  { emotion: 'thinking', label: 'Thinking', message: "Hmm, let me think about this..." },
  { emotion: 'encouraging', label: 'Encouraging', message: "Don't worry, you've got this! Keep trying!" },
  { emotion: 'celebrating', label: 'Celebrating', message: "Fantastic! You're absolutely crushing it! 🎉" },
  { emotion: 'confused', label: 'Confused', message: "I'm not sure about this one. Let's figure it out together!" },
  { emotion: 'proud', label: 'Proud', message: "I'm so proud of your progress! Keep it up!" },
  { emotion: 'sleepy', label: 'Sleepy', message: "Time for a little break? Rest is important too!" },
  { emotion: 'focused', label: 'Focused', message: "Let's focus and tackle this challenge together!" },
];

export const NovaShowcase: React.FC = () => {
  const [currentEmotion, setCurrentEmotion] = useState<MascotEmotion>('idle');
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(emotions[0].message);

  const handleEmotionClick = (emotion: MascotEmotion, message: string) => {
    setCurrentEmotion(emotion);
    setCurrentMessage(message);
    setShowDialogue(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-4xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Meet Nova - Your AI Learning Companion
        </motion.h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Nova is StudyNova AI&apos;s intelligent mascot, designed to provide encouragement, 
          celebrate your achievements, and make learning more engaging and fun!
        </p>
      </div>

      {/* Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mascot Display */}
        <Card className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader className="text-center">
            <CardTitle>Nova in Action</CardTitle>
            <CardDescription>
              Current emotion: <span className="font-semibold capitalize">{currentEmotion}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <NovaMascot 
              emotion={currentEmotion}
              size="xxl"
              animate={true}
              showParticles={true}
              intensity="high"
            />
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Click on the emotions below to see Nova in different states!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dialogue Showcase */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Interactive Dialogue</CardTitle>
            <CardDescription>
              See how Nova communicates with encouraging messages
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {showDialogue && (
              <NovaMascotDialogue
                message={currentMessage}
                emotion={currentEmotion}
                size="lg"
                position="center"
                showMessage={true}
                autoHide={false}
                showParticles={currentEmotion === 'celebrating' || currentEmotion === 'excited'}
                bubbleStyle="modern"
              />
            )}
            {!showDialogue && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                Select an emotion to see Nova&apos;s dialogue
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emotion Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Nova&apos;s Emotions</CardTitle>
          <CardDescription>
            Click on any emotion to see how Nova responds in different situations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {emotions.map(({ emotion, label, message }) => (
              <Button
                key={emotion}
                variant={currentEmotion === emotion ? "default" : "outline"}
                size="sm"
                onClick={() => handleEmotionClick(emotion, message)}
                className="h-auto flex flex-col py-3 space-y-1"
              >
                <div className="text-xs font-medium">{label}</div>
                <NovaMascot 
                  emotion={emotion}
                  size="sm"
                  animate={currentEmotion === emotion}
                  showParticles={false}
                />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4">
            <NovaMascot emotion="happy" size="md" animate={true} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Encouraging</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Nova provides positive reinforcement and motivation throughout your learning journey
          </p>
        </motion.div>

        <motion.div
          className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200/50 dark:border-purple-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4">
            <NovaMascot emotion="celebrating" size="md" animate={true} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Celebratory</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Celebrates your achievements and milestones with exciting animations and particles
          </p>
        </motion.div>

        <motion.div
          className="text-center p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-200/50 dark:border-green-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-4">
            <NovaMascot emotion="thinking" size="md" animate={true} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Intelligent</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Shows thoughtful expressions when processing information or helping you learn
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center space-y-4 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">
          Nova represents the stellar nature of learning - every moment of understanding is like a bright star being born! ⭐
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Designed with ❤️ for StudyNova AI - Making learning an extraordinary journey
        </p>
      </div>
    </div>
  );
};

export default NovaShowcase;