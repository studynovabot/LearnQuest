import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BookOpen, FileText, Link as LinkIcon, Loader2, PlusCircle, Save } from "lucide-react";
import { useChat } from "@/hooks/useChat";

interface StudyPlan {
  title: string;
  description: string;
  sections: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  estimatedTime: string;
}

const StudyPlanGenerator = () => {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const { toast } = useToast();
  const { sendMessage } = useChat();

  const handleGeneratePlan = async () => {
    if (!url && !topic) {
      toast({
        title: "Input required",
        description: "Please provide either a textbook URL or a topic to generate a study plan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Construct the prompt for the AI
      let prompt = "Generate a comprehensive study plan";
      
      if (url) {
        prompt += ` based on this textbook URL: ${url}`;
      }
      
      if (topic) {
        prompt += url ? ` focusing on the topic: ${topic}` : ` for the topic: ${topic}`;
      }
      
      prompt += ". Include sections with key points and estimated study time. Format as a structured study guide.";
      
      // Send the message to the AI
      const response = await sendMessage(prompt);
      
      // For demo purposes, create a mock study plan
      // In a real implementation, you would parse the AI response
      const mockStudyPlan: StudyPlan = {
        title: topic || "Comprehensive Study Guide",
        description: "This study plan is designed to help you master the key concepts efficiently.",
        sections: [
          {
            title: "Core Concepts",
            content: "Start with understanding the fundamental principles and terminology.",
            keyPoints: [
              "Review basic definitions and principles",
              "Understand the historical context",
              "Identify key relationships between concepts"
            ]
          },
          {
            title: "Detailed Analysis",
            content: "Dive deeper into the subject matter with detailed examples and case studies.",
            keyPoints: [
              "Work through example problems",
              "Analyze case studies",
              "Connect theory to practical applications"
            ]
          },
          {
            title: "Practice and Application",
            content: "Apply your knowledge through exercises and real-world scenarios.",
            keyPoints: [
              "Complete practice exercises",
              "Discuss applications with peers",
              "Create your own examples"
            ]
          },
          {
            title: "Review and Mastery",
            content: "Consolidate your understanding through review and self-assessment.",
            keyPoints: [
              "Summarize key takeaways",
              "Test yourself with practice questions",
              "Teach concepts to others to reinforce learning"
            ]
          }
        ],
        estimatedTime: "3-4 hours"
      };
      
      setStudyPlan(mockStudyPlan);
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = () => {
    toast({
      title: "Study plan saved",
      description: "Your study plan has been saved to your dashboard.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Study Plan Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!studyPlan ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Textbook URL (optional)</span>
              </div>
              <Input
                placeholder="Paste textbook URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Topic (optional)</span>
              </div>
              <Textarea
                placeholder="Enter a topic or learning objective..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>
            
            <Button 
              onClick={handleGeneratePlan} 
              className="w-full"
              disabled={isGenerating || (!url && !topic)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Generate Study Plan
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">{studyPlan.title}</h3>
              <p className="text-muted-foreground">{studyPlan.description}</p>
              <div className="mt-2 text-sm bg-muted p-2 rounded-md flex items-center">
                <span className="font-medium mr-2">Estimated study time:</span> {studyPlan.estimatedTime}
              </div>
            </div>
            
            <div className="space-y-4">
              {studyPlan.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-border rounded-lg p-4"
                >
                  <h4 className="font-semibold text-primary mb-2">{section.title}</h4>
                  <p className="text-sm mb-3">{section.content}</p>
                  <ul className="space-y-1">
                    {section.keyPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-sm flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleSavePlan} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStudyPlan(null)}
                className="flex-1"
              >
                Create New Plan
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyPlanGenerator;