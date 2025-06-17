import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/context/UserContext';
import { useChat } from '@/hooks/useChat';
import { ChatMessage, AITutor } from '@/types';
import { Lock, Sparkles, Send, Crown, Zap, Download, Award } from 'lucide-react';
import FeatureAccess from '@/components/subscription/FeatureAccess';
import { Link } from 'wouter';

interface ChatWithBlurredAnswersProps {
  className?: string;
}

const ChatWithBlurredAnswers: React.FC<ChatWithBlurredAnswersProps> = ({ className }) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const { 
    agents, 
    unlockedAgents, 
    activeAgent, 
    selectAgent, 
    sendMessage, 
    agentMessages, 
    isSubmitting 
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const isPremium = user?.isPro || false;
  
  // Show premium prompt after 2 messages for free users
  useEffect(() => {
    if (!isPremium && agentMessages.filter(m => m.role === 'user').length >= 2) {
      setShowPremiumPrompt(true);
    }
  }, [agentMessages, isPremium]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Function to render message content with conditional blurring for AI responses
  const renderMessageContent = (message: ChatMessage) => {
    if (message.role === 'user') {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
    
    // For AI responses
    if (isPremium) {
      // Premium users see full content
      return (
        <div className="relative">
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {/* Premium badge */}
          <div className="absolute top-0 right-0 -mt-2 -mr-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              <span className="text-xs">Premium</span>
            </Badge>
          </div>
          
          {/* Download button for premium users */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Save as PDF
            </Button>
          </div>
        </div>
      );
    }
    
    // For free users, show only 25% of the content
    const content = message.content;
    const visibleLength = Math.floor(content.length * 0.25);
    const visibleContent = content.substring(0, visibleLength);
    
    return (
      <div className="relative">
        <div>
          <p className="whitespace-pre-wrap">{visibleContent}...</p>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 pointer-events-none" />
          
          {/* Locked content overlay */}
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-amber-600">
                <Lock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">75% of answer locked</span>
              </div>
              <Button 
                size="sm" 
                asChild
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Link href="/subscription">
                  <Zap className="h-3 w-3 mr-1" />
                  Unlock Full Answer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {agentMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                      {activeAgent?.name?.charAt(0) || 'A'}
                    </div>
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {renderMessageContent(message)}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      {user?.displayName?.charAt(0) || 'U'}
                    </div>
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Premium prompt for free users */}
        {showPremiumPrompt && !isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6"
          >
            <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
              <div className="flex items-start">
                <div className="mr-4 bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                    Unlock Premium for Full Answers
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400 mt-1 mb-3">
                    Free users only see 25% of AI answers. Upgrade to Premium to unlock complete answers, 
                    CBSE topper format, and PDF export.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Link href="/subscription">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                      onClick={() => setShowPremiumPrompt(false)}
                    >
                      Continue with Limited Access
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question..."
            className="min-h-[60px] flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSubmitting || !inputValue.trim()}
            className="self-end"
          >
            {isSubmitting ? (
              <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
            <span>
              {isPremium ? 'Premium access: Full answers unlocked' : 'Free access: 25% of answers visible'}
            </span>
          </div>
          
          {!isPremium && (
            <Button 
              variant="link" 
              size="sm" 
              asChild
              className="text-xs text-amber-600 p-0 h-auto"
            >
              <Link href="/subscription">
                Upgrade for full access
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWithBlurredAnswers;