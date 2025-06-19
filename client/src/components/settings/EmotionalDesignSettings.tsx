import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useEmotionalDesign } from '@/context/EmotionalDesignContext';
import { NovaBot, AnimatedButton } from '@/components/emotional-design';
import { 
  Volume2, 
  VolumeX, 
  Gamepad2, 
  Smile, 
  Sparkles, 
  Heart,
  Zap,
  Award,
  Settings,
  TestTube,
  RefreshCw,
  Info
} from 'lucide-react';

const EmotionalDesignSettings: React.FC = () => {
  const emotionalDesign = useEmotionalDesign();
  const [volumeLevel, setVolumeLevel] = useState([70]);
  const [animationSpeed, setAnimationSpeed] = useState([100]);
  const [testMode, setTestMode] = useState(false);

  const handleTest = (type: string) => {
    switch (type) {
      case 'correct':
        emotionalDesign.celebrateCorrectAnswer();
        break;
      case 'streak':
        emotionalDesign.celebrateStreak(5);
        break;
      case 'achievement':
        emotionalDesign.celebrateAchievement('Settings Master');
        break;
      case 'welcome':
        emotionalDesign.showWelcome();
        break;
      case 'encouragement':
        emotionalDesign.showEncouragement();
        break;
    }
  };

  const resetToDefaults = () => {
    emotionalDesign.setAnimationsEnabled(true);
    emotionalDesign.setMascotEnabled(true);
    setVolumeLevel([70]);
    setAnimationSpeed([100]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Settings className="mr-3 h-6 w-6" />
            Emotional Design Settings
          </CardTitle>
          <p className="text-purple-100">
            Customize your learning experience with our emotional design system
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
              Experience Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sound system disabled for stability */}
            
            <Separator />

            {/* Animation Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gamepad2 className={`h-5 w-5 ${emotionalDesign.animationsEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-base font-medium">Animations</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Enable visual effects and transitions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emotionalDesign.animationsEnabled}
                  onCheckedChange={emotionalDesign.setAnimationsEnabled}
                />
              </div>

              {emotionalDesign.animationsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-8 space-y-3"
                >
                  <div>
                    <Label className="text-sm">Animation Speed</Label>
                    <Slider
                      value={animationSpeed}
                      onValueChange={setAnimationSpeed}
                      min={50}
                      max={150}
                      step={25}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Slow</span>
                      <span>{animationSpeed[0]}%</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <Separator />

            {/* Mascot Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smile className={`h-5 w-5 ${emotionalDesign.mascotEnabled ? 'text-orange-600' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-base font-medium">AI Companion</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Show NovaBot with encouraging messages
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emotionalDesign.mascotEnabled}
                  onCheckedChange={emotionalDesign.setMascotEnabled}
                />
              </div>

              {emotionalDesign.mascotEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-8"
                >
                  <div className="flex items-center space-x-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <NovaBot emotion="happy" size="md" />
                    <div className="text-sm">
                      <p className="font-medium">Hi there! 👋</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        I'm here to help make your learning journey amazing!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <Separator />

            {/* Reset Button */}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset to Defaults</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="mr-2 h-5 w-5 text-green-600" />
              Test Interactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Try out different emotional design features to see how they feel!
            </p>

            <div className="grid grid-cols-1 gap-3">
              <AnimatedButton
                variant="success"
                onClick={() => handleTest('correct')}
                className="flex items-center justify-center space-x-2"
              >
                <Award className="h-4 w-4" />
                <span>Correct Answer</span>
              </AnimatedButton>

              <AnimatedButton
                variant="primary"
                onClick={() => handleTest('streak')}
                className="flex items-center justify-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Streak Celebration</span>
              </AnimatedButton>

              <AnimatedButton
                onClick={() => handleTest('achievement')}
                className="flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Achievement Unlocked</span>
              </AnimatedButton>

              <AnimatedButton
                variant="secondary"
                onClick={() => handleTest('welcome')}
                className="flex items-center justify-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span>Welcome Message</span>
              </AnimatedButton>

              <AnimatedButton
                variant="secondary"
                onClick={() => handleTest('encouragement')}
                className="flex items-center justify-center space-x-2"
              >
                <Smile className="h-4 w-4" />
                <span>Encouragement</span>
              </AnimatedButton>
            </div>

            <Separator />

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Test Mode</span>
              </div>
              <Switch
                checked={testMode}
                onCheckedChange={setTestMode}
              />
            </div>

            {testMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Test Mode Active:</strong> All interactions will trigger more frequently 
                  and show additional debug information for testing purposes.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Emotional Design Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Celebration Frequency</Label>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                How often celebrations appear
              </p>
              <Slider defaultValue={[75]} max={100} step={25} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Feedback Sensitivity</Label>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Responsiveness to user actions
              </p>
              <Slider defaultValue={[80]} max={100} step={20} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mascot Personality</Label>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Enthusiasm level of AI companion
              </p>
              <Slider defaultValue={[85]} max={100} step={15} />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Accessibility Information</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Our emotional design system respects your system preferences for reduced motion 
              and provides alternatives for all visual and audio feedback. You can always 
              disable specific features if they interfere with assistive technologies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionalDesignSettings;