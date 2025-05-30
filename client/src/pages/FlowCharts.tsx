import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "@/components/ui/premium-card";
import { PremiumSelect } from "@/components/ui/premium-form";
import { GradientButton, GlassButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GitBranchIcon, ArrowRightIcon, CheckCircleIcon, PlayIcon, SparklesIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, SkipForwardIcon } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FlowChartStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  connections: string[];
}

interface FlowChart {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: FlowChartStep[];
  estimatedTime: number;
}

const FlowCharts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [flowCharts, setFlowCharts] = useState<FlowChart[]>([]);
  const [currentChart, setCurrentChart] = useState<FlowChart | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample data
  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];

  const sampleFlowCharts: FlowChart[] = [
    {
      id: '1',
      title: 'Photosynthesis Process',
      description: 'Step-by-step process of how plants make their food',
      subject: 'Science',
      class: '7',
      chapter: 'Nutrition in Plants',
      difficulty: 'medium',
      estimatedTime: 15,
      steps: [
        {
          id: 'step1',
          title: 'Raw Materials',
          description: 'Plants absorb carbon dioxide from air and water from soil',
          isCompleted: false,
          connections: ['step2']
        },
        {
          id: 'step2',
          title: 'Chlorophyll Absorption',
          description: 'Chlorophyll in leaves absorbs sunlight energy',
          isCompleted: false,
          connections: ['step3']
        },
        {
          id: 'step3',
          title: 'Chemical Reaction',
          description: 'CO₂ + H₂O + Sunlight → Glucose + Oxygen',
          isCompleted: false,
          connections: ['step4']
        },
        {
          id: 'step4',
          title: 'Products Formation',
          description: 'Glucose is stored as food, oxygen is released',
          isCompleted: false,
          connections: []
        }
      ]
    },
    {
      id: '2',
      title: 'Solving Linear Equations',
      description: 'Step-by-step method to solve linear equations',
      subject: 'Mathematics',
      class: '8',
      chapter: 'Linear Equations',
      difficulty: 'easy',
      estimatedTime: 12,
      steps: [
        {
          id: 'step1',
          title: 'Identify the Equation',
          description: 'Write the equation in standard form ax + b = c',
          isCompleted: false,
          connections: ['step2']
        },
        {
          id: 'step2',
          title: 'Isolate Variable Terms',
          description: 'Move all terms with variables to one side',
          isCompleted: false,
          connections: ['step3']
        },
        {
          id: 'step3',
          title: 'Isolate Constants',
          description: 'Move all constant terms to the other side',
          isCompleted: false,
          connections: ['step4']
        },
        {
          id: 'step4',
          title: 'Solve for Variable',
          description: 'Divide both sides by the coefficient of the variable',
          isCompleted: false,
          connections: ['step5']
        },
        {
          id: 'step5',
          title: 'Verify Solution',
          description: 'Substitute the value back into the original equation',
          isCompleted: false,
          connections: []
        }
      ]
    }
  ];

  useEffect(() => {
    setFlowCharts(sampleFlowCharts);
  }, []);

  const startFlowChart = (chart: FlowChart) => {
    const resetChart = {
      ...chart,
      steps: chart.steps.map(step => ({ ...step, isCompleted: false }))
    };
    setCurrentChart(resetChart);
    setCurrentStepIndex(0);
    setIsStudying(true);
  };

  const completeStep = () => {
    if (!currentChart) return;

    const updatedChart = { ...currentChart };
    updatedChart.steps[currentStepIndex].isCompleted = true;
    setCurrentChart(updatedChart);

    if (currentStepIndex < updatedChart.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Flow chart completed
      setIsStudying(false);
      toast({
        title: "Flow Chart Completed! 🎉",
        description: `You've successfully completed the ${currentChart.title} flow chart.`,
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToNextStep = () => {
    if (currentChart && currentStepIndex < currentChart.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const filteredCharts = flowCharts.filter(chart => {
    return (!selectedClass || chart.class === selectedClass) &&
           (!selectedSubject || chart.subject === selectedSubject);
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = () => {
    if (!currentChart) return 0;
    const completedSteps = currentChart.steps.filter(step => step.isCompleted).length;
    return (completedSteps / currentChart.steps.length) * 100;
  };

  return (
    <>
      <Helmet>
        <title>Flow Charts | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Interactive flow charts for step-by-step learning of complex concepts across all subjects." />
      </Helmet>

      <div className="space-y-6">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-3 gradient-primary rounded-2xl shadow-glow">
              <GitBranchIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Flow Charts
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Interactive step-by-step visual learning for complex concepts
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full"
          >
            <SparklesIcon size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-500">Visual Learning Made Easy</span>
          </motion.div>
        </motion.div>

        {/* Flow Chart Study Modal */}
        <AnimatePresence>
          {isStudying && currentChart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{currentChart.title}</h2>
                  <Button variant="outline" onClick={() => setIsStudying(false)}>
                    Close
                  </Button>
                </div>

                <Progress value={getProgressPercentage()} className="mb-6" />

                {/* Flow Chart Visualization */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {currentChart.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <motion.div
                          className={`
                            relative p-4 rounded-lg border-2 min-w-[200px] text-center
                            ${index === currentStepIndex ? 'border-primary bg-primary/10' :
                              step.isCompleted ? 'border-green-500 bg-green-500/10' :
                              'border-muted bg-muted/50'}
                          `}
                          animate={{
                            scale: index === currentStepIndex ? 1.05 : 1,
                          }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            {step.isCompleted ? (
                              <CheckCircleIcon size={24} className="text-green-500" />
                            ) : index === currentStepIndex ? (
                              <PlayIcon size={24} className="text-primary" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                            )}
                          </div>
                          <h3 className="font-semibold text-sm">{step.title}</h3>
                        </motion.div>

                        {index < currentChart.steps.length - 1 && (
                          <ArrowRightIcon size={20} className="mx-2 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Step Details */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Step {currentStepIndex + 1}:</span>
                      <span>{currentChart.steps[currentStepIndex].title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentChart.steps[currentStepIndex].description}</p>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                  >
                    Previous
                  </Button>

                  <Button
                    onClick={completeStep}
                    className="flex-1"
                  >
                    {currentStepIndex === currentChart.steps.length - 1 ? 'Complete Flow Chart' : 'Next Step'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={goToNextStep}
                    disabled={currentStepIndex === currentChart.steps.length - 1}
                  >
                    Skip
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Find Flow Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedClass('');
                  setSelectedSubject('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Flow Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharts.map((chart) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{chart.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Class {chart.class} • {chart.subject}
                      </p>
                    </div>
                    <Badge className={getDifficultyColor(chart.difficulty)}>
                      {chart.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {chart.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {chart.steps.length} steps
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ~{chart.estimatedTime} min
                    </span>
                  </div>

                  <Button
                    onClick={() => startFlowChart(chart)}
                    className="w-full"
                    disabled={isStudying}
                  >
                    Start Flow Chart
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCharts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <GitBranchIcon size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Flow Charts Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default FlowCharts;
