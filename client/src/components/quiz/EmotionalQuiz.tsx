import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEmotionalDesign } from '@/context/EmotionalDesignContext';
import { AnimatedButton, ProgressRing } from '@/components/emotional-design';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Clock, 
  Award, 
  Star,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface EmotionalQuizProps {
  title: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, totalPoints: number) => void;
}

const EmotionalQuiz: React.FC<EmotionalQuizProps> = ({
  title,
  questions,
  onComplete
}) => {
  const emotionalDesign = useEmotionalDesign();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Timer
  useEffect(() => {
    if (!quizComplete) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizComplete]);

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    emotionalDesign.sound.playSound('button-click');
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const pointsEarned = isCorrect ? currentQ.points : 0;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setTotalPoints(prev => prev + pointsEarned);
      setStreakCount(prev => prev + 1);
      
      // Celebrate correct answer
      emotionalDesign.celebrateCorrectAnswer({ x: 50, y: 40 });
      
      // Bonus celebration for streaks
      if (streakCount >= 2) {
        setTimeout(() => {
          emotionalDesign.interactions.triggerStreakBonus(streakCount + 1, { x: 70, y: 30 });
        }, 1000);
      }
    } else {
      setStreakCount(0);
      emotionalDesign.handleIncorrectAnswer({ x: 50, y: 40 });
    }

    // Auto-advance after showing result
    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      
      // Calculate final score and celebrate
      const finalScore = (score / questions.length) * 100;
      
      if (finalScore >= 90) {
        emotionalDesign.celebrateAchievement('Quiz Master');
      } else if (finalScore >= 70) {
        emotionalDesign.celebrateAchievement('Great Job');
      }
      
      onComplete?.(score, totalPoints);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalPoints(0);
    setQuizComplete(false);
    setStreakCount(0);
    setTimeSpent(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizComplete) {
    const finalScore = (score / questions.length) * 100;
    const performance = finalScore >= 90 ? 'excellent' : finalScore >= 70 ? 'good' : 'needs-improvement';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-4"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl text-green-700 dark:text-green-300">
              Quiz Complete! 🎉
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-green-600">{score}/{questions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-blue-600">{Math.round(finalScore)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Final Score</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Points Earned</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="text-lg font-semibold mb-2">
                {performance === 'excellent' && '🌟 Excellent work! You\'re a quiz champion!'}
                {performance === 'good' && '👏 Great job! You\'re doing well!'}
                {performance === 'needs-improvement' && '💪 Keep practicing! You\'ll get better!'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Time spent: {formatTime(timeSpent)}
              </div>
            </motion.div>

            <div className="flex justify-center space-x-4">
              <AnimatedButton
                variant="primary"
                onClick={resetQuiz}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </AnimatedButton>
              
              <AnimatedButton
                variant="secondary"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Continue Learning</span>
              </AnimatedButton>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-purple-600" />
              {title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              {streakCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 text-orange-600 font-semibold"
                >
                  <Star className="h-4 w-4" />
                  <span>{streakCount} streak!</span>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 ${
                  selectedAnswer === currentQ.correctAnswer 
                    ? 'bg-green-500/10' 
                    : 'bg-red-500/10'
                } z-10 pointer-events-none`}
              />
            )}
            
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">
                {currentQ.question}
              </CardTitle>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{currentQ.points} points</span>
                {showResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1"
                  >
                    {selectedAnswer === currentQ.correctAnswer ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-semibold">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-semibold">Incorrect</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === index
                        ? showResult
                          ? index === currentQ.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : showResult && index === currentQ.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && (
                        <div>
                          {index === currentQ.correctAnswer && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {selectedAnswer === index && index !== currentQ.correctAnswer && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Explanation
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          {currentQ.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <div className="flex justify-end">
                {!showResult ? (
                  <AnimatedButton
                    variant="primary"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex items-center space-x-2"
                  >
                    <span>Submit Answer</span>
                    <ArrowRight className="h-4 w-4" />
                  </AnimatedButton>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    Auto-advancing in a moment...
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EmotionalQuiz;