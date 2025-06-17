import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Lock, Download, Award, CheckCircle } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';

interface BlurredAnswerProps {
  children: React.ReactNode;
  question: string;
  subject?: string;
  marks?: number;
  showFullContent?: boolean; // For demo purposes
}

const BlurredAnswer: React.FC<BlurredAnswerProps> = ({
  children,
  question,
  subject = 'General',
  marks = 5,
  showFullContent = false
}) => {
  const { user } = useUserContext();
  const isPremium = user?.isPro || false;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate how much content to show (25% for free users)
  const contentToShow = () => {
    if (isPremium || showFullContent) return 100;
    if (isExpanded) return 25;
    return 10; // Initially show only 10%
  };
  
  // For demo purposes, we'll use a string representation of the children
  const content = React.Children.toArray(children).map(child => 
    typeof child === 'string' ? child : 'Content'
  ).join(' ');
  
  // Calculate visible content based on percentage
  const visibleLength = Math.floor(content.length * (contentToShow() / 100));
  const visibleContent = content.substring(0, visibleLength);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
    >
      {/* Question header */}
      <div className="p-4 border-b bg-slate-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-lg">{question}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>{subject}</span>
              <span className="mx-2">•</span>
              <span>{marks} Marks</span>
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Download size={14} />
                <span>PDF</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Answer content */}
      <div className="p-4 relative">
        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Award size={12} className="mr-1" />
            <span>Topper Format</span>
          </div>
        )}
        
        {/* Content with conditional blurring */}
        <div className="relative">
          {/* Visible content */}
          <div className="prose dark:prose-invert max-w-none">
            {visibleContent}
            {!isPremium && !showFullContent && (
              <span className="text-muted-foreground">...</span>
            )}
          </div>
          
          {/* Blurred overlay for free users */}
          {!isPremium && !showFullContent && (
            <div className="mt-4">
              <div className="relative">
                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-900 pointer-events-none"
                  style={{ height: '100px', top: '-100px' }}
                />
                
                {/* Upgrade prompt */}
                <div className="border-t pt-4 mt-4">
                  {!isExpanded ? (
                    <Button 
                      onClick={() => setIsExpanded(true)} 
                      variant="outline" 
                      className="w-full"
                    >
                      Show Preview (25%)
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>25% of answer revealed</span>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg border">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lock size={16} className="text-amber-500" />
                          <span>Premium Features Locked</span>
                        </h4>
                        <ul className="text-sm space-y-2 mb-4">
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                              <span className="text-amber-500 text-xs">✓</span>
                            </div>
                            <span>Full answer with complete explanation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                              <span className="text-amber-500 text-xs">✓</span>
                            </div>
                            <span>CBSE topper-formatted answers</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                              <span className="text-amber-500 text-xs">✓</span>
                            </div>
                            <span>PDF download for offline study</span>
                          </li>
                        </ul>
                        
                        <Button 
                          asChild 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          <Link href="/subscription">
                            🔓 Unlock Premium
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BlurredAnswer;