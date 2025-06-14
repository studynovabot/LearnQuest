import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Book, 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Loader2, 
  Search, 
  Upload, 
  File, 
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/useChat";

// Types
interface NCERTClass {
  id: string;
  name: string;
  subjects: NCERTSubject[];
}

interface NCERTSubject {
  id: string;
  name: string;
  icon: string;
  chapters: NCERTChapter[];
}

interface NCERTChapter {
  id: string;
  name: string;
  questions: NCERTQuestionSection[];
}

interface NCERTQuestionSection {
  id: string;
  name: string;
  type: "intext" | "exercise" | "example";
  questions: NCERTQuestion[];
}

interface NCERTQuestion {
  id: string;
  number: string;
  text: string;
  solution?: string;
  hasDetailedSolution: boolean;
}

interface UploadStatus {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "success" | "error";
  message?: string;
}

const NCERTSolutions = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { sendMessage } = useChat();
  
  // State for navigation
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<NCERTQuestion | null>(null);
  
  // State for solution
  const [solution, setSolution] = useState<string>("");
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  
  // State for admin upload
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for NCERT classes, subjects, chapters, and questions
  const ncertClasses: NCERTClass[] = [
    {
      id: "class6",
      name: "Class 6",
      subjects: [
        {
          id: "math6",
          name: "Mathematics",
          icon: "📐",
          chapters: [
            {
              id: "math6_ch1",
              name: "Chapter 1: Knowing Our Numbers",
              questions: [
                {
                  id: "math6_ch1_ex1",
                  name: "Exercise 1.1",
                  type: "exercise",
                  questions: [
                    {
                      id: "math6_ch1_ex1_q1",
                      number: "1",
                      text: "Fill in the blanks: (a) 1 lakh = _______ ten thousand (b) 1 million = _______ hundred thousand",
                      hasDetailedSolution: true
                    },
                    {
                      id: "math6_ch1_ex1_q2",
                      number: "2",
                      text: "Place commas correctly and write the numerals: (a) Seventy-three lakh seventy-five thousand three hundred seven (b) Nine crore five lakh forty-one",
                      hasDetailedSolution: true
                    }
                  ]
                },
                {
                  id: "math6_ch1_ex2",
                  name: "Exercise 1.2",
                  type: "exercise",
                  questions: [
                    {
                      id: "math6_ch1_ex2_q1",
                      number: "1",
                      text: "A book exhibition was held for four days in a school. The number of tickets sold at the counter on the first, second, third and final day was respectively 1094, 1812, 2050 and 2751. Find the total number of tickets sold on all the four days.",
                      hasDetailedSolution: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "science6",
          name: "Science",
          icon: "🔬",
          chapters: [
            {
              id: "science6_ch1",
              name: "Chapter 1: Food: Where Does It Come From?",
              questions: [
                {
                  id: "science6_ch1_ex1",
                  name: "Exercise",
                  type: "exercise",
                  questions: [
                    {
                      id: "science6_ch1_ex1_q1",
                      number: "1",
                      text: "Do you find that all living beings need the same kind of food?",
                      hasDetailedSolution: true
                    },
                    {
                      id: "science6_ch1_ex1_q2",
                      number: "2",
                      text: "Name five plants and their parts that we eat.",
                      hasDetailedSolution: true
                    }
                  ]
                },
                {
                  id: "science6_ch1_intext",
                  name: "Intext Questions",
                  type: "intext",
                  questions: [
                    {
                      id: "science6_ch1_intext_q1",
                      number: "1",
                      text: "What are the various sources of food?",
                      hasDetailedSolution: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "class10",
      name: "Class 10",
      subjects: [
        {
          id: "math10",
          name: "Mathematics",
          icon: "📊",
          chapters: [
            {
              id: "math10_ch1",
              name: "Chapter 1: Real Numbers",
              questions: [
                {
                  id: "math10_ch1_ex1",
                  name: "Exercise 1.1",
                  type: "exercise",
                  questions: [
                    {
                      id: "math10_ch1_ex1_q1",
                      number: "1",
                      text: "Use Euclid's division algorithm to find the HCF of: (i) 135 and 225 (ii) 196 and 38220 (iii) 867 and 255",
                      hasDetailedSolution: true
                    }
                  ]
                },
                {
                  id: "math10_ch1_ex2",
                  name: "Exercise 1.2",
                  type: "exercise",
                  questions: [
                    {
                      id: "math10_ch1_ex2_q1",
                      number: "1",
                      text: "Express each number as a product of its prime factors: (i) 140 (ii) 156 (iii) 3825 (iv) 5005 (v) 7429",
                      hasDetailedSolution: true
                    }
                  ]
                },
                {
                  id: "math10_ch1_examples",
                  name: "Examples",
                  type: "example",
                  questions: [
                    {
                      id: "math10_ch1_example_1",
                      number: "Example 1",
                      text: "Find the HCF of 96 and 404 by the Euclidean algorithm.",
                      hasDetailedSolution: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  // Filter classes based on search query
  const filteredClasses = searchQuery 
    ? ncertClasses.filter(cls => 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subjects.some(subj => 
          subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subj.chapters.some(ch => 
            ch.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      )
    : ncertClasses;
  
  // Get current selected data
  const currentClass = selectedClass 
    ? ncertClasses.find(cls => cls.id === selectedClass) 
    : null;
    
  const currentSubject = currentClass && selectedSubject
    ? currentClass.subjects.find(subj => subj.id === selectedSubject)
    : null;
    
  const currentChapter = currentSubject && selectedChapter
    ? currentSubject.chapters.find(ch => ch.id === selectedChapter)
    : null;
    
  const currentSection = currentChapter && selectedSection
    ? currentChapter.questions.find(sec => sec.id === selectedSection)
    : null;
  
  // Reset selections when parent selection changes
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedSection(null);
    setSelectedQuestion(null);
  }, [selectedClass]);
  
  useEffect(() => {
    setSelectedChapter(null);
    setSelectedSection(null);
    setSelectedQuestion(null);
  }, [selectedSubject]);
  
  useEffect(() => {
    setSelectedSection(null);
    setSelectedQuestion(null);
  }, [selectedChapter]);
  
  useEffect(() => {
    setSelectedQuestion(null);
  }, [selectedSection]);
  
  // Handle file upload for admin
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset upload status
    setUploadStatus({
      fileName: file.name,
      progress: 0,
      status: "uploading"
    });
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadStatus(prev => {
        if (!prev) return null;
        
        const newProgress = Math.min(prev.progress + 10, 100);
        const newStatus = newProgress === 100 ? "processing" : "uploading";
        
        return {
          ...prev,
          progress: newProgress,
          status: newStatus
        };
      });
    }, 500);
    
    // Simulate processing after upload completes
    setTimeout(() => {
      clearInterval(interval);
      
      // Simulate successful processing
      setUploadStatus({
        fileName: file.name,
        progress: 100,
        status: "success",
        message: "PDF processed successfully. Questions and solutions extracted and saved to database."
      });
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been processed and added to the NCERT solutions database.`,
      });
    }, 6000);
  };
  
  // Generate solution for selected question
  const generateSolution = async () => {
    if (!selectedQuestion) return;
    
    setIsGeneratingSolution(true);
    setSolution("");
    
    try {
      // Construct a prompt for the AI
      const prompt = `
        I need a detailed, step-by-step solution for the following NCERT question:
        
        ${selectedQuestion.text}
        
        Please provide a clear explanation as if you're a friendly tutor helping a student understand the concept. 
        Include all working steps, explanations of the approach, and any relevant formulas or rules.
        If applicable, explain why this approach works and how to verify the answer.
        Format your response with proper HTML for better presentation.
      `;
      
      // In a real implementation, we would call the AI service
      // For now, we'll use the sendMessage function from useChat
      try {
        const response = await sendMessage(prompt);
        
        // Format the response with proper styling
        const formattedSolution = `
          <div class="solution-container">
            <h3 class="text-lg font-bold mb-4">Solution:</h3>
            ${response}
          </div>
        `;
        
        setSolution(formattedSolution);
      } catch (error) {
        console.error("Error calling AI service:", error);
        
        // Fallback to mock solutions if AI service fails
        let mockSolution = "";
        
        if (selectedQuestion.id === "math6_ch1_ex1_q1") {
          mockSolution = `
            <div class="solution-container">
              <h3 class="text-lg font-bold mb-4">Solution:</h3>
              <p>Let's break this down step by step:</p>
              
              <div class="solution-step bg-primary/5 p-4 rounded-lg my-4 border border-primary/20">
                <h4 class="font-semibold text-primary mb-2">(a) 1 lakh = _____ ten thousand</h4>
                <p>We know that:</p>
                <ul class="list-disc pl-5 my-2 space-y-1">
                  <li>1 lakh = 100,000</li>
                  <li>1 ten thousand = 10,000</li>
                </ul>
                <p>To find how many ten thousands are in 1 lakh, we divide:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  1 lakh ÷ 10,000 = 100,000 ÷ 10,000 = 10
                </div>
                <p>Therefore, <strong class="text-primary">1 lakh = 10 ten thousand</strong></p>
              </div>
              
              <div class="solution-step bg-primary/5 p-4 rounded-lg my-4 border border-primary/20">
                <h4 class="font-semibold text-primary mb-2">(b) 1 million = _____ hundred thousand</h4>
                <p>We know that:</p>
                <ul class="list-disc pl-5 my-2 space-y-1">
                  <li>1 million = 1,000,000</li>
                  <li>1 hundred thousand = 100,000</li>
                </ul>
                <p>To find how many hundred thousands are in 1 million, we divide:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  1 million ÷ 100,000 = 1,000,000 ÷ 100,000 = 10
                </div>
                <p>Therefore, <strong class="text-primary">1 million = 10 hundred thousand</strong></p>
              </div>
              
              <div class="solution-summary bg-muted/50 p-4 rounded-lg mt-6 border border-border">
                <p class="font-medium">To summarize:</p>
                <ul class="list-disc pl-5 my-2 space-y-1">
                  <li>(a) 1 lakh = 10 ten thousand</li>
                  <li>(b) 1 million = 10 hundred thousand</li>
                </ul>
              </div>
            </div>
          `;
        } else if (selectedQuestion.id === "math10_ch1_ex1_q1") {
          mockSolution = `
            <div class="solution-container">
              <h3 class="text-lg font-bold mb-4">Solution:</h3>
              <p>We'll use Euclid's division algorithm to find the HCF of each pair of numbers.</p>
              
              <div class="solution-step bg-primary/5 p-4 rounded-lg my-4 border border-primary/20">
                <h4 class="font-semibold text-primary mb-2">(i) HCF of 135 and 225</h4>
                <p>According to Euclid's algorithm, we divide the larger number by the smaller number and find the remainder:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  225 = 135 × 1 + 90
                </div>
                <p>Now we divide the divisor (135) by the remainder (90):</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  135 = 90 × 1 + 45
                </div>
                <p>We continue this process:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  90 = 45 × 2 + 0
                </div>
                <p>Since the remainder is now 0, the HCF is the last non-zero remainder, which is 45.</p>
                <p>Therefore, <strong class="text-primary">HCF of 135 and 225 is 45</strong></p>
              </div>
              
              <div class="solution-step bg-primary/5 p-4 rounded-lg my-4 border border-primary/20">
                <h4 class="font-semibold text-primary mb-2">(ii) HCF of 196 and 38220</h4>
                <p>Using Euclid's algorithm:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  38220 = 196 × 195 + 0
                </div>
                <p>Since the remainder is 0, the HCF is 196.</p>
                <p>Therefore, <strong class="text-primary">HCF of 196 and 38220 is 196</strong></p>
              </div>
              
              <div class="solution-step bg-primary/5 p-4 rounded-lg my-4 border border-primary/20">
                <h4 class="font-semibold text-primary mb-2">(iii) HCF of 867 and 255</h4>
                <p>Using Euclid's algorithm:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  867 = 255 × 3 + 102
                </div>
                <p>Now we divide 255 by 102:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  255 = 102 × 2 + 51
                </div>
                <p>We continue:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  102 = 51 × 2 + 0
                </div>
                <p>Since the remainder is now 0, the HCF is 51.</p>
                <p>Therefore, <strong class="text-primary">HCF of 867 and 255 is 51</strong></p>
              </div>
              
              <div class="solution-summary bg-muted/50 p-4 rounded-lg mt-6 border border-border">
                <p class="font-medium">To summarize:</p>
                <ul class="list-disc pl-5 my-2 space-y-1">
                  <li>(i) HCF of 135 and 225 is 45</li>
                  <li>(ii) HCF of 196 and 38220 is 196</li>
                  <li>(iii) HCF of 867 and 255 is 51</li>
                </ul>
              </div>
            </div>
          `;
        } else {
          // Generic solution for other questions with enhanced styling
          mockSolution = `
            <div class="solution-container">
              <h3 class="text-lg font-bold mb-4">Solution:</h3>
              <p>Let me solve this step-by-step:</p>
              
              <div class="solution-step bg-primary/5 p-4 rounded-lg my-4 border border-primary/20">
                <p>First, let's understand what the question is asking. We need to ${selectedQuestion.text.includes("find") ? "find" : "determine"} ${selectedQuestion.text.split("?")[0].split("find").pop() || "the answer"}.</p>
                
                <p class="mt-3 font-medium">The approach to solve this is:</p>
                <ol class="list-decimal pl-5 my-2 space-y-1">
                  <li>Break down the problem into manageable parts</li>
                  <li>Apply the relevant formulas and concepts</li>
                  <li>Work through each step methodically</li>
                  <li>Verify our answer</li>
                </ol>
                
                <p class="mt-3">Working through the solution:</p>
                <div class="math-working bg-background p-3 rounded my-2 font-mono text-sm border border-border">
                  [Detailed working would be shown here with all steps]
                </div>
                
                <p class="mt-3">Therefore, the answer is [final answer with explanation].</p>
              </div>
              
              <div class="solution-summary bg-muted/50 p-4 rounded-lg mt-6 border border-border">
                <p class="font-medium">To summarize:</p>
                <ul class="list-disc pl-5 my-2 space-y-1">
                  <li>We approached this by [method]</li>
                  <li>The key concept used was [concept]</li>
                  <li>The final answer is [answer]</li>
                </ul>
                
                <p class="mt-3 italic">I hope this helps you understand! If you have any questions about any step, feel free to ask.</p>
              </div>
            </div>
          `;
        }
        
        setSolution(mockSolution);
      }
      
      setIsGeneratingSolution(false);
      
    } catch (error) {
      console.error("Error generating solution:", error);
      toast({
        title: "Error",
        description: "Failed to generate solution. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingSolution(false);
    }
  };
  
  // Ask AI for more detailed explanation (for premium users)
  const askAIForHelp = async () => {
    if (!selectedQuestion) return;
    
    // Check if user has premium plan
    const hasPremiumAccess = user?.subscriptionPlan === "pro" || user?.subscriptionPlan === "goat";
    
    if (!hasPremiumAccess) {
      toast({
        title: "Premium Feature",
        description: "Detailed AI explanations are available for Pro and GOAT plan subscribers.",
        variant: "default",
      });
      return;
    }
    
    setIsGeneratingSolution(true);
    
    try {
      // Construct a more conversational prompt for the AI
      const prompt = `
        I'm having trouble understanding this NCERT question:
        
        "${selectedQuestion.text}"
        
        I've seen the solution, but I still don't fully understand it. Could you explain it to me like you're my friend helping me study? 
        Please use simple language and maybe some real-world examples to help me understand the concept better.
        Make your explanation very detailed and step-by-step, but in a friendly, conversational tone.
      `;
      
      // Call the AI service
      const response = await sendMessage(prompt);
      
      // Open chat with the AI response
      // In a real implementation, you would navigate to the chat page or open a chat modal
      toast({
        title: "AI Tutor Ready",
        description: "Your personal AI tutor is ready to help you understand this concept better.",
        variant: "default",
      });
      
      // For now, we'll just update the solution with a more conversational explanation
      const conversationalSolution = `
        <div class="solution-container">
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold">AI</span>
              </div>
              <div>
                <p class="font-medium text-blue-800 dark:text-blue-300 mb-1">Your Personal AI Tutor</p>
                <p class="text-sm text-blue-600 dark:text-blue-400">Hey there! I noticed you wanted some extra help with this question. Let me explain it in a way that's easier to understand.</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            ${response}
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mt-6 border border-blue-200 dark:border-blue-800">
            <p class="text-sm text-blue-600 dark:text-blue-400">Does that make more sense now? If you still have questions, you can always ask me for more help!</p>
          </div>
        </div>
      `;
      
      setSolution(conversationalSolution);
      setIsGeneratingSolution(false);
      
    } catch (error) {
      console.error("Error getting AI help:", error);
      toast({
        title: "Error",
        description: "Failed to connect with AI tutor. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingSolution(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>NCERT Solutions | StudyNova AI - Step-by-Step Solutions for All Classes</title>
        <meta name="description" content="Get instant, step-by-step NCERT solutions for all subjects and classes. Detailed explanations, examples, and practice questions with AI-powered assistance." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              NCERT Solutions
            </h1>
            <p className="text-muted-foreground text-lg">
              Step-by-step solutions for all NCERT textbooks with detailed explanations
            </p>
          </motion.div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Navigation Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-4 xl:col-span-3"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    NCERT Navigator
                  </CardTitle>
                  <CardDescription>
                    Select your class, subject, and chapter
                  </CardDescription>
                  
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search classes, subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {/* Classes */}
                  <div className="space-y-4">
                    {filteredClasses.map((cls) => (
                      <div key={cls.id} className="space-y-2">
                        <Button
                          variant={selectedClass === cls.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedClass(cls.id)}
                        >
                          <Book className="h-4 w-4 mr-2" />
                          {cls.name}
                        </Button>
                        
                        {/* Subjects (show if class is selected) */}
                        {selectedClass === cls.id && (
                          <div className="pl-6 space-y-2">
                            {cls.subjects.map((subject) => (
                              <div key={subject.id}>
                                <Button
                                  variant={selectedSubject === subject.id ? "secondary" : "ghost"}
                                  className="w-full justify-start"
                                  onClick={() => setSelectedSubject(subject.id)}
                                >
                                  <span className="mr-2">{subject.icon}</span>
                                  {subject.name}
                                </Button>
                                
                                {/* Chapters (show if subject is selected) */}
                                {selectedSubject === subject.id && (
                                  <div className="pl-6 space-y-2 mt-2">
                                    {subject.chapters.map((chapter) => (
                                      <div key={chapter.id}>
                                        <Button
                                          variant={selectedChapter === chapter.id ? "outline" : "ghost"}
                                          size="sm"
                                          className="w-full justify-start text-sm"
                                          onClick={() => setSelectedChapter(chapter.id)}
                                        >
                                          <FileText className="h-3 w-3 mr-2" />
                                          {chapter.name.length > 30 
                                            ? `${chapter.name.substring(0, 30)}...` 
                                            : chapter.name}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {filteredClasses.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No matches found</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery("")}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Admin Upload Section */}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Admin Upload
                      </CardTitle>
                      <CardDescription>
                        Upload NCERT PDFs to extract questions and solutions
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Tabs defaultValue="upload">
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                          <TabsTrigger value="history">Upload History</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload" className="space-y-4">
                          <div className="grid gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Select Class</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ncertClasses.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                      {cls.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Select Subject</label>
                              <Select disabled={!selectedClass}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentClass?.subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Chapter Name</label>
                              <Input placeholder="e.g., Chapter 1: Real Numbers" />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium block">Upload PDF</label>
                              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                <input
                                  type="file"
                                  id="pdf-upload"
                                  className="hidden"
                                  accept=".pdf"
                                  onChange={handleFileUpload}
                                />
                                <label 
                                  htmlFor="pdf-upload"
                                  className="cursor-pointer flex flex-col items-center justify-center"
                                >
                                  <File className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground mb-1">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF files only (max 10MB)
                                  </p>
                                </label>
                              </div>
                            </div>
                            
                            {uploadStatus && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">{uploadStatus.fileName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {uploadStatus.status === "uploading" && "Uploading..."}
                                    {uploadStatus.status === "processing" && "Processing..."}
                                    {uploadStatus.status === "success" && "Completed"}
                                    {uploadStatus.status === "error" && "Failed"}
                                  </span>
                                </div>
                                <Progress value={uploadStatus.progress} />
                                
                                {uploadStatus.message && (
                                  <div className={`text-xs p-2 rounded ${
                                    uploadStatus.status === "success" 
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }`}>
                                    {uploadStatus.message}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="history">
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                              Recent uploads will appear here
                            </div>
                            
                            <div className="border rounded-lg divide-y">
                              <div className="p-3 flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">Class 10 Mathematics Chapter 1.pdf</p>
                                  <p className="text-xs text-muted-foreground">Uploaded 2 days ago</p>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Processed
                                </Badge>
                              </div>
                              <div className="p-3 flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">Class 9 Science Chapter 3.pdf</p>
                                  <p className="text-xs text-muted-foreground">Uploaded 5 days ago</p>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Processed
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
            
            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-8 xl:col-span-9"
            >
              {!selectedChapter ? (
                // Show welcome screen if no chapter selected
                <Card className="h-full flex flex-col justify-center items-center p-8">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
                  <h2 className="text-2xl font-bold text-center mb-2">Select a Chapter</h2>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Choose a class, subject, and chapter from the navigation panel to view NCERT questions and solutions.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                    {ncertClasses.slice(0, 6).map((cls) => (
                      <Button
                        key={cls.id}
                        variant="outline"
                        className="h-auto py-3"
                        onClick={() => setSelectedClass(cls.id)}
                      >
                        {cls.name}
                      </Button>
                    ))}
                  </div>
                </Card>
              ) : !selectedSection ? (
                // Show chapter overview if chapter selected but no section
                <Card>
                  <CardHeader>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <span>{currentClass?.name}</span>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span>{currentSubject?.name}</span>
                    </div>
                    <CardTitle>{currentChapter?.name}</CardTitle>
                    <CardDescription>
                      Select a question section to view questions and solutions
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentChapter?.questions.map((section) => (
                        <Button
                          key={section.id}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-start"
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <div className="flex items-center mb-2">
                            {section.type === "exercise" && (
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                            )}
                            {section.type === "example" && (
                              <BookOpen className="h-4 w-4 mr-2 text-primary" />
                            )}
                            {section.type === "intext" && (
                              <Info className="h-4 w-4 mr-2 text-primary" />
                            )}
                            <span className="font-medium">{section.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : !selectedQuestion ? (
                // Show question list if section selected but no question
                <Card>
                  <CardHeader>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <span className="cursor-pointer hover:underline" onClick={() => setSelectedChapter(null)}>
                        {currentClass?.name}
                      </span>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span className="cursor-pointer hover:underline" onClick={() => setSelectedChapter(null)}>
                        {currentSubject?.name}
                      </span>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span>{currentChapter?.name}</span>
                    </div>
                    <CardTitle>{currentSection?.name}</CardTitle>
                    <CardDescription>
                      Select a question to view the detailed solution
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {currentSection?.questions.map((question) => (
                        <div
                          key={question.id}
                          className="border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">Question {question.number}</h3>
                            <Badge variant="outline">
                              {question.hasDetailedSolution ? "Detailed Solution" : "Basic Solution"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{question.text}</p>
                          <Button size="sm" variant="default">
                            View Solution
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Show question and solution
                <Card>
                  <CardHeader>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <span className="cursor-pointer hover:underline" onClick={() => setSelectedChapter(null)}>
                        {currentClass?.name}
                      </span>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span className="cursor-pointer hover:underline" onClick={() => setSelectedChapter(null)}>
                        {currentSubject?.name}
                      </span>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span className="cursor-pointer hover:underline" onClick={() => setSelectedSection(null)}>
                        {currentChapter?.name}
                      </span>
                      <ChevronRight className="h-4 w-4 mx-1" />
                      <span>{currentSection?.name}</span>
                    </div>
                    <CardTitle>Question {selectedQuestion.number}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Question */}
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h3 className="font-medium mb-2">Question:</h3>
                      <p>{selectedQuestion.text}</p>
                    </div>
                    
                    {/* Solution */}
                    {solution ? (
                      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                        <div dangerouslySetInnerHTML={{ __html: solution }} />
                        
                        {/* Premium AI Help Button */}
                        <div className="mt-6 flex justify-center">
                          <Button
                            onClick={askAIForHelp}
                            variant="outline"
                            className="group relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-300 dark:border-blue-700"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 animate-shimmer" />
                            <div className="flex items-center gap-2 relative z-10">
                              <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Still confused? Ask AI Tutor for help</span>
                              {user?.subscriptionPlan === "pro" || user?.subscriptionPlan === "goat" ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                                  Premium
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                                  Pro Plan
                                </Badge>
                              )}
                            </div>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        {isGeneratingSolution ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Generating detailed solution...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div>
                              <h3 className="text-lg font-medium mb-1">Solution Available</h3>
                              <p className="text-muted-foreground mb-4">
                                Get a detailed, step-by-step explanation for this question
                              </p>
                              <Button onClick={generateSolution}>
                                Show Solution
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Navigation buttons */}
                    {solution && (
                      <div className="flex justify-between pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSolution("");
                            setSelectedQuestion(null);
                          }}
                        >
                          Back to Questions
                        </Button>
                        
                        <div className="space-x-2">
                          <Button variant="outline">
                            Previous Question
                          </Button>
                          <Button>
                            Next Question
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NCERTSolutions;