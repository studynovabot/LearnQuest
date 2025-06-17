import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Award, Star, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopperAnswerFormatProps {
  question: string;
  answer: string;
  subject?: string;
  marks?: number;
  className?: string;
  studentName?: string;
}

const TopperAnswerFormat: React.FC<TopperAnswerFormatProps> = ({
  question,
  answer,
  subject = 'General',
  marks = 5,
  className,
  studentName = 'Topper Student'
}) => {
  // Format the answer with proper structure based on marks
  const formattedAnswer = formatAnswerByMarks(answer, marks);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm",
        className
      )}
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
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Download size={14} />
              <span>PDF</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Answer content */}
      <div className="p-4 relative">
        {/* Premium badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
          <Award size={12} className="mr-1" />
          <span>Topper Format</span>
        </div>
        
        {/* Answer sheet styling */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 mt-2">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                <Star size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium">{studentName}</div>
                <div className="text-xs text-muted-foreground">Top Rank Student</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex">
                {[...Array(Math.min(marks, 5))].map((_, i) => (
                  <CheckCircle key={i} size={14} className="text-green-500 fill-green-500 mr-0.5" />
                ))}
              </div>
              <span className="text-sm font-medium text-green-600 ml-1">{marks}/{marks}</span>
            </div>
          </div>
          
          {/* Formatted answer with proper structure */}
          <div className="prose dark:prose-invert max-w-none">
            {formattedAnswer.map((section, index) => (
              <div key={index} className="mb-4">
                {section.title && (
                  <h4 className="text-md font-medium mb-2">{section.title}</h4>
                )}
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            ))}
          </div>
          
          {/* Teacher's remarks */}
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground italic">
              <span className="font-medium text-green-600 dark:text-green-400">Teacher's Remarks:</span> Excellent answer with proper structure and complete points. Well done!
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to format answer based on marks
function formatAnswerByMarks(answer: string, marks: number): Array<{title?: string, content: string}> {
  // For 2 marks questions
  if (marks <= 2) {
    return [{ content: answer }];
  }
  
  // For 3-4 marks questions
  if (marks <= 4) {
    const paragraphs = answer.split('\n\n').filter(p => p.trim());
    
    if (paragraphs.length <= 2) {
      return [{ content: answer }];
    }
    
    return [
      { title: 'Introduction', content: paragraphs[0] },
      { content: paragraphs.slice(1).join('<br><br>') }
    ];
  }
  
  // For 5+ marks questions (full structure)
  const paragraphs = answer.split('\n\n').filter(p => p.trim());
  
  if (paragraphs.length <= 3) {
    // Not enough content for full structure
    return [{ content: answer }];
  }
  
  return [
    { title: 'Introduction', content: paragraphs[0] },
    { title: 'Main Content', content: paragraphs.slice(1, -1).join('<br><br>') },
    { title: 'Conclusion', content: paragraphs[paragraphs.length - 1] }
  ];
}

export default TopperAnswerFormat;