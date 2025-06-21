import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, Sparkles, Lock, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { config } from '../config';

interface QACardProps {
  question: string;
  answer: string;
  questionNumber: number;
  solutionId: string;
  questionIndex: number;
  userTier: 'free' | 'pro' | 'goat';
  userId: string;
  metadata: {
    board: string;
    class: string;
    subject: string;
    chapter: string;
  };
}

interface AIExplanation {
  explanation: string;
  generatedAt: string;
  model: string;
}

export default function QACard({ 
  question, 
  answer, 
  questionNumber, 
  solutionId, 
  questionIndex, 
  userTier, 
  userId, 
  metadata 
}: QACardProps) {
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();

  const isProOrGoat = userTier === 'pro' || userTier === 'goat';

  const handleGetAIHelp = async () => {
    if (!isProOrGoat) {
      toast({
        title: "Upgrade Required 🔒",
        description: "AI Help is available for Pro and Goat users only. Upgrade to unlock!",
        variant: "default",
      });
      return;
    }

    setIsLoadingExplanation(true);

    try {
      const response = await fetch(`${config.apiUrl}/ai-explanation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solutionId,
          questionIndex,
          userTier,
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI explanation');
      }

      const data = await response.json();
      setAiExplanation(data.explanation);
      setShowExplanation(true);

      toast({
        title: "AI Explanation Generated! 🧠✨",
        description: `${data.usage?.remaining || 0} AI helps remaining today`,
      });

    } catch (error) {
      console.error('AI explanation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Daily AI help limit reached')) {
          toast({
            title: "Daily Limit Reached 📊",
            description: "You've used all your AI helps for today. Upgrade to Goat for more!",
            variant: "destructive",
          });
        } else if (error.message.includes('Pro and Goat users')) {
          toast({
            title: "Upgrade Required 🔒",
            description: "AI Help is available for Pro and Goat users only.",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Question {questionNumber}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {metadata.board} • Class {metadata.class}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {metadata.subject}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Question:</h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {question}
          </p>
        </div>

        {/* Answer */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Answer:</h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {answer}
          </p>
        </div>

        {/* AI Help Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {isProOrGoat ? (
              <Button
                onClick={handleGetAIHelp}
                disabled={isLoadingExplanation}
                className="flex items-center space-x-2"
                variant="outline"
              >
                {isLoadingExplanation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Get AI Help</span>
              </Button>
            ) : (
              <Button
                onClick={handleGetAIHelp}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Lock className="h-4 w-4" />
                <span>Get AI Help</span>
                <Badge variant="secondary" className="ml-2">Pro</Badge>
              </Button>
            )}
          </div>
          
          {isProOrGoat && (
            <Badge variant="default" className="text-xs">
              {userTier.toUpperCase()} USER
            </Badge>
          )}
        </div>

        {/* AI Explanation */}
        {showExplanation && aiExplanation && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="h-5 w-5 text-blue-600" />
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                AI Explanation
              </h4>
            </div>
            <div className="text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
              {aiExplanation.explanation}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
              <span>Generated by {aiExplanation.model}</span>
              <span>{new Date(aiExplanation.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}