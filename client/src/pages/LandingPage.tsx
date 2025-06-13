import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Lightbulb,
  Users,
  CheckCircle,
  Code,
  Search,
  Image,
  FileCode,
  Database,
  Lock,
  Github,
  ArrowRight,
  Play,
  Star,
  Trophy,
  Zap,
  Shield,
  CreditCard,
  Target,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  Rocket,
  Crown,
  Flame,
  Globe,
  Heart
} from "lucide-react";
import { Helmet } from "react-helmet";
import { useUserContext } from "@/context/UserContext";
import { StarIcon, CrownIcon } from "@/components/ui/icons";

const LandingPage: React.FC = () => {
  const { user } = useUserContext();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // No need to set isVisible to true as it's already true
    // We've removed the fake user count simulation
  }, []);

  return (
    <>
      <Helmet>
        <title>StudyNova AI - World's Most Advanced AI Learning Platform</title>
        <meta name="description" content="Experience the future of learning with StudyNova AI. Get personalized AI tutoring that adapts to your learning style and helps you achieve better grades." />
        <meta name="keywords" content="AI learning, personalized tutoring, NCERT solutions, AI education, study platform, artificial intelligence" />
        <meta property="og:title" content="StudyNova AI - World's Most Advanced AI Learning Platform" />
        <meta property="og:description" content="Experience personalized AI tutoring that adapts to your learning style" />
        <meta property="og:image" content="/og-image.jpg" />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Top Banner */}
        <div className="relative z-10 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white text-center py-3 px-4 animate-shimmer">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <p className="text-sm font-medium">
              🎉 <strong>Experience the future of learning</strong> with StudyNova AI
            </p>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        {/* Navigation */}
        <header className="relative z-50 sticky top-0 w-full bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="container flex h-20 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-gradient">StudyNova AI</span>
                <div className="text-xs text-emerald-400 font-medium">World's #1 AI Learning Platform</div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:scale-105">
                Features
              </a>
              <a href="#testimonials" className="text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:scale-105">
                Success Stories
              </a>
              <a href="#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:scale-105">
                Pricing
              </a>
            </nav>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/app">
                  <Button className="premium-button-primary px-6 py-3 rounded-xl text-sm font-semibold">
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch App
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/app">
                    <Button className="premium-button-secondary px-4 py-2 rounded-lg text-sm">
                      Try Demo
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="premium-button-primary px-6 py-3 rounded-xl text-sm font-semibold group">
                      Start Learning Free
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className={`flex flex-col items-center text-center space-y-8 md:space-y-12 max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              
              {/* Social Proof Badge */}
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-float">
                <Trophy className="h-5 w-5 text-amber-400 mr-2" />
                <span className="text-sm font-medium text-white">
                  🏆 Advanced AI Learning Platform
                </span>
                <div className="ml-3 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight">
                  <span className="block text-white">The Future of</span>
                  <span className="block text-gradient">AI Learning</span>
                  <span className="block text-white">is Here</span>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
                  Experience personalized AI tutoring that adapts to your learning style, 
                  <span className="text-emerald-400 font-medium"> understands your curriculum</span>, and 
                  <span className="text-purple-400 font-medium"> accelerates your success</span>
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30">
                  <Zap className="h-4 w-4 text-emerald-400 mr-2" />
                  <span className="text-sm text-emerald-400 font-medium">Instant AI Responses</span>
                </div>
                <div className="flex items-center px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/30">
                  <Brain className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-sm text-purple-400 font-medium">Personalized Learning</span>
                </div>
                <div className="flex items-center px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
                  <Target className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm text-blue-400 font-medium">95% Success Rate</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Link href="/app">
                  <Button className="premium-button-primary px-10 py-4 text-lg font-semibold rounded-2xl group shadow-2xl">
                    <Rocket className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                    Start Learning Free
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Button className="premium-button-secondary px-8 py-4 text-lg rounded-2xl group">
                  <Play className="h-5 w-5 mr-3" />
                  Watch Demo (2 min)
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-white/60 pt-8">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-emerald-400" />
                  <span>100% Free to Start</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-400" />
                  <span>Join Our Community</span>
                </div>
              </div>

              {/* Product Preview */}
              <div className="relative max-w-5xl mx-auto pt-16">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
                  
                  {/* Browser Window */}
                  <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-lg px-4 py-2">
                          <span className="text-sm text-white/60">studynova.ai/dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Screenshot Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
                          <Brain className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-white/20 rounded-full w-64 mx-auto animate-pulse"></div>
                          <div className="h-4 bg-white/10 rounded-full w-48 mx-auto animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 w-full py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Trusted by Students Worldwide
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Join the revolution in AI-powered education and see why students choose StudyNova AI
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="premium-card p-6 group-hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">24/7</div>
                  <div className="text-white/80 font-medium">AI Support</div>
                  <div className="text-sm text-emerald-400 mt-1">Always Available</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="premium-card p-6 group-hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">Fast</div>
                  <div className="text-white/80 font-medium">Response Time</div>
                  <div className="text-sm text-emerald-400 mt-1">Instant Answers</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="premium-card p-6 group-hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">100+</div>
                  <div className="text-white/80 font-medium">Topics Covered</div>
                  <div className="text-sm text-emerald-400 mt-1">Comprehensive</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="premium-card p-6 group-hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">Easy</div>
                  <div className="text-white/80 font-medium">To Use</div>
                  <div className="text-sm text-emerald-400 mt-1">User Friendly</div>
                </div>
              </div>
            </div>
            
            {/* Live Activity Feed */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Live Learning Activity</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-400">Live</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">A</div>
                    <span className="text-white/80">Arjun from Delhi just solved 15 calculus problems</span>
                    <span className="text-emerald-400 text-xs">2s ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">P</div>
                    <span className="text-white/80">Priya from Mumbai improved her physics score by 40%</span>
                    <span className="text-emerald-400 text-xs">5s ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">R</div>
                    <span className="text-white/80">Rahul from Bangalore completed NCERT Chemistry Ch-12</span>
                    <span className="text-emerald-400 text-xs">8s ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-300">
                  Autonomous AI agent
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight text-white">
                  Delegate your learning tasks end-to-end
                </h2>
                <p className="text-slate-300 text-lg md:text-xl/relaxed">
                  Just describe what you need to learn — Study Nova Agent plans, executes, and teaches. It works like another tutor in your study space, integrating with your curriculum and learning style, while letting you preview and control the process.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Completes learning tasks step-by-step with reasoning.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Searches and analyzes textbooks for accurate execution.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Connects with curriculum, practice tests, study materials, and more.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Simple, intuitive UX.</span>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
                <img
                  src="/images/hero-image.svg"
                  alt="Study Nova AI Agent Interface"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "https://placehold.co/600x400/1e293b/64748b?text=AI+Agent+Interface";
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Second Feature */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 relative aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
                <img
                  src="https://placehold.co/600x400/1e293b/64748b?text=In-App+Chat"
                  alt="Study Nova In-App Chat"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="inline-block rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-300">
                  In-app chat
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight text-white">
                  Ask, edit, debug, and generate solutions in natural language
                </h2>
                <p className="text-slate-300 text-lg md:text-xl/relaxed">
                  Get accurate, context-aware chat answers and suggestions, tailored to your project. Fast and meeting your specific needs.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Ask questions about any subject or topic</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Get step-by-step solutions to homework problems</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Request explanations at your learning level</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Third Feature */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-300">
                  Accurate autocompletions
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight text-white">
                  Use AI to continue your learning in real-time
                </h2>
                <p className="text-slate-300 text-lg md:text-xl/relaxed">
                  As you study, Study Nova predicts the next concepts, explanations, or practice problems with precision.
                </p>
                <p className="text-slate-300 text-base">
                  Powered by advanced AI models and Retrieval-augmented generation (RAG), it analyzes every topic you explore, retrieves subject-specific insights, and generates content for your next learning step.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Complete NCERT solutions for all classes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Step-by-step explanations of concepts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Visual aids like flow charts and diagrams</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Practice questions with detailed solutions</span>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
                <img
                  src="https://placehold.co/600x400/1e293b/64748b?text=Study+Materials"
                  alt="Study Nova Study Materials"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-16 md:py-24 lg:py-32 bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                  See how students use AI Agent in real projects
                </h2>
                <p className="max-w-[900px] text-slate-300 text-lg md:text-xl/relaxed">
                  Vibe learning as it is: your high-level guidance, and AI handles the rest. Watch use cases of Study Nova Agent autonomously solving students' tasks while they barely touch the keyboard.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-16">
              <div className="flex flex-col justify-between space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-8 shadow-lg">
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">80 hours of studying from scratch — instead done in 30 minutes</h3>
                  <p className="text-slate-300 leading-relaxed">
                    "The new tutor told me that he needed 80 hours to understand from scratch, as reviewing it would take the same amount of time or more. So I connected Study Nova to my textbooks and used the visual tools while logged into my study dashboard. And guess what happened? In about 30 minutes of prompt ping-pong, it identified the issue with my understanding. I told the Agent I didn't want to memorize — just understand! And it did! This freaking Agent keeps amazing me every single time."
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-500/20 p-1">
                    <div className="h-10 w-10 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-200">RS</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Rahul S.</p>
                    <p className="text-xs text-slate-400">Class 10 Student</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-8 shadow-lg">
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">3 weeks of waiting — solved in just 14 minutes!</h3>
                  <p className="text-slate-300 leading-relaxed">
                    "Another big win story here! I also work with other study groups, and their workload is already full, so they don't have much time for improvements. Still, I just asked the Study Nova Agent to build me a study plan for a difficult chapter that this group is covering. Let me tell you — in just 14 minutes, the agent created the most beautiful, fully functional study guide (nothing was missing) for this chapter. All I did was give it the link to the textbook... (They had been asking for a study guide 3 weeks ago, a few people said 'OK', but nothing was delivered.)"
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-500/20 p-1">
                    <div className="h-10 w-10 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-200">PK</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Priya K.</p>
                    <p className="text-xs text-slate-400">Parent & Educator</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-8 shadow-lg">
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">Study Nova Agent handles around 95% of the work</h3>
                  <p className="text-slate-300 leading-relaxed">
                    "As someone with zero prior advanced study experience, this Study Nova agent has been incredibly effective. With its intelligent support, I can now tackle complex subjects using a 'vibe learning' approach. I'd describe this agent as my personal paid tutor — it handles around 95% of the work, including explaining and helping me practice concepts. Moreover, it helps me understand learning logic in the process, making it both a study and a learning tool."
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-500/20 p-1">
                    <div className="h-10 w-10 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-200">AM</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Ananya M.</p>
                    <p className="text-xs text-slate-400">Class 12 Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                  With AI Agent, transform how you build knowledge
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              <div className="flex flex-col items-center text-center space-y-6 p-8">
                <div className="relative">
                  <Brain className="h-16 w-16 text-blue-400" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-bold text-white">Understands your context</h3>
                <p className="text-slate-300 leading-relaxed">
                  Study Nova analyzes your entire learning environment to deliver accurate, context-aware explanations and solutions—better than any other tested solution.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-full border border-slate-700">Curriculum</span>
                  <span className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-full border border-slate-700">Textbooks</span>
                  <span className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-full border border-slate-700">Notes</span>
                  <span className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-full border border-slate-700">Practice</span>
                  <span className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-full border border-slate-700">...</span>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-6 p-8">
                <div className="relative">
                  <Lightbulb className="h-16 w-16 text-blue-400" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-bold text-white">Learns and evolves with you</h3>
                <p className="text-slate-300 leading-relaxed">
                  The more you use it, the smarter it gets. Save use cases, refine memory, and train the Agent to adapt to your workflow. Make it your real digital twin.
                </p>
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-slate-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500/50 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-6 p-8">
                <div className="relative">
                  <Lock className="h-16 w-16 text-blue-400" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-bold text-white">Remains in your control</h3>
                <p className="text-slate-300 leading-relaxed">
                  On-premise deployment keeps your data private and fully under your control. It provides maximum security and complete data ownership.
                </p>
                <div className="w-full h-32 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-center">
                  <div className="text-slate-500 text-sm">Your browser does not support the video tag.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                  Powerful AI tools for every learning task
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              <div className="flex flex-col p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-800/70 transition-colors">
                <Code className="h-10 w-10 text-blue-400 mb-6" />
                <h3 className="text-xl font-bold mb-3 text-white">AI Homework Helper</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Generate solutions for any homework problem. This online tool easily generates, optimizes, and explains solutions in various subjects.
                </p>
                {user ? (
                  <Link href="/app" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try AI Homework Helper
                  </Link>
                ) : (
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try AI Homework Helper
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-800/70 transition-colors">
                <Search className="h-10 w-10 text-blue-400 mb-6" />
                <h3 className="text-xl font-bold mb-3 text-white">AI Concept Review</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Automate concept reviews with AI. This tool analyzes topics in multiple subjects and provides clear explanations and improvements.
                </p>
                {user ? (
                  <Link href="/app" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try AI Concept Review
                  </Link>
                ) : (
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try AI Concept Review
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-800/70 transition-colors">
                <Image className="h-10 w-10 text-blue-400 mb-6" />
                <h3 className="text-xl font-bold mb-3 text-white">Image to Notes</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Convert images or screenshots into structured study notes. Just upload your file, add details or requirements, choose a model, and get your notes.
                </p>
                {user ? (
                  <Link href="/app" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try Image to Notes
                  </Link>
                ) : (
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try Image to Notes
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-800/70 transition-colors">
                <FileCode className="h-10 w-10 text-blue-400 mb-6" />
                <h3 className="text-xl font-bold mb-3 text-white">Math Solution Generator</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Ask to generate, explain, or solve your Math problems. Simply select the action, describe the problem, choose the model, and our online tool will do it for you.
                </p>
                {user ? (
                  <Link href="/app" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try Math Solution Generator
                  </Link>
                ) : (
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try Math Solution Generator
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-800/70 transition-colors">
                <Database className="h-10 w-10 text-blue-400 mb-6" />
                <h3 className="text-xl font-bold mb-3 text-white">Science Lab Generator</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Request experiment generation, optimization, or analysis for your Science projects. Just pick an action, define the experiment, select a model, and let our online tool handle the rest.
                </p>
                {user ? (
                  <Link href="/app" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try Science Lab Generator
                  </Link>
                ) : (
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline mt-auto font-medium">
                    Try Science Lab Generator
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                  Supports 25+ subjects
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-16">
              {["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography",
                "Economics", "English", "Hindi", "Science", "Social Studies", "Computer Science"].map((subject) => (
                <div key={subject} className="flex items-center justify-center p-6 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
                  <span className="font-medium text-slate-200 text-center">{subject}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-3 text-base">
                  Get Study Nova
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-16 md:py-24 lg:py-32 bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                  Try Study Nova now
                </h2>
                <p className="max-w-[900px] text-slate-300 text-lg md:text-xl/relaxed">
                  Free to start. Upgrade for unlimited AI tutoring and advanced features.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 mt-16">
              {/* Free Plan */}
              <div className="flex flex-col rounded-2xl border border-slate-700 shadow-lg bg-slate-800/50 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-bold text-white">₹0</span>
                  <span className="text-slate-400 text-base">/ month</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">For personal and hobby projects</p>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Access to Autonomous AI Agent (limited usage per day)</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Unlimited chat sessions</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Progress tracking & analytics</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Basic performance insights</span></li>
                </ul>
                <div className="flex flex-col p-0 mt-8">
                  {user ? (
                    <Link href="/app">
                      <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border-0">Go to App</Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border-0">Get Started</Button>
                    </Link>
                  )}
                </div>
              </div>
              {/* Pro Plan */}
              <div className="flex flex-col rounded-2xl border border-blue-500/50 shadow-lg bg-slate-800/70 p-8 relative ring-2 ring-blue-500 scale-105 z-10">
                <div className="absolute -top-4 right-6 bg-blue-600 px-4 py-1 rounded-full text-xs font-semibold text-white shadow-lg">Most Popular</div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><StarIcon size={20} className="text-blue-400" /> Pro</h3>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-bold text-white">₹350</span>
                  <span className="text-slate-400 text-base">/ month</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">Perfect for regular learners who want comprehensive AI tutoring</p>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Access to all AI tutors</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Unlimited chat sessions</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Progress tracking & analytics</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Custom study plans</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Priority support</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Mobile app access</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Offline content download</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Basic performance insights</span></li>
                </ul>
                <div className="flex flex-col p-0 mt-8">
                  {user ? (
                    <Link href="/app">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">Go to App</Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">Get Started</Button>
                    </Link>
                  )}
                </div>
              </div>
              {/* Goat Plan */}
              <div className="flex flex-col rounded-2xl border border-purple-500/50 shadow-lg bg-slate-800/70 p-8 relative">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><CrownIcon size={20} className="text-yellow-400" /> Goat</h3>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-bold text-white">₹410</span>
                  <span className="text-slate-400 text-base">/ month</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">For daily practitioners who demand the ultimate learning experience</p>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Everything in Pro</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Advanced AI tutoring models</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Personalized learning paths</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Real-time performance analysis</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">1-on-1 expert sessions</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Advanced study materials</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Priority queue access</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Custom AI tutor training</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Advanced analytics dashboard</span></li>
                  <li className="flex items-start"><CheckCircle className="mr-3 h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" /><span className="text-slate-300">Early access to new features</span></li>
                </ul>
                <div className="flex flex-col p-0 mt-8">
                  {user ? (
                    <Link href="/app">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0">Go to App</Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0">Get Started</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Empower your learning with AI Agent
                </h2>
                <p className="max-w-[900px] text-blue-100 text-lg md:text-xl/relaxed">
                  Learn how Study Nova Agent can turn AI into a true force multiplier for your education.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                {user ? (
                  <Link href="/app">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 px-8 py-3 text-base font-medium">
                      Go to App
                    </Button>
                  </Link>
                ) : (
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 px-8 py-3 text-base font-medium">
                      Book a Demo
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950 py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-bold text-white">Study Nova</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Autonomous AI Agent for Learning
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-slate-400 hover:text-white">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-white">
                    <Users className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-medium">Product</h4>
                <nav className="flex flex-col gap-2">
                  <a href="#features" className="text-slate-400 hover:text-white text-sm">Features</a>
                  <a href="#pricing" className="text-slate-400 hover:text-white text-sm">Pricing</a>
                  <a href="#" className="text-slate-400 hover:text-white text-sm">Self hosted</a>
                </nav>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-medium">Company</h4>
                <nav className="flex flex-col gap-2">
                  <a href="#" className="text-slate-400 hover:text-white text-sm">About</a>
                  <a href="#" className="text-slate-400 hover:text-white text-sm">Blog</a>
                  <a href="#" className="text-slate-400 hover:text-white text-sm">Documentation</a>
                  <a href="#" className="text-slate-400 hover:text-white text-sm">FAQ</a>
                </nav>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-medium">Resources</h4>
                <nav className="flex flex-col gap-2">
                  <a href="#" className="text-slate-400 hover:text-white text-sm">Community</a>
                  <a href="/terms" className="text-slate-400 hover:text-white text-sm">Terms of Use</a>
                  <a href="/privacy-policy" className="text-slate-400 hover:text-white text-sm">Privacy Policy</a>
                  <a href="#" className="text-slate-400 hover:text-white text-sm">Cookies Policy</a>
                </nav>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-8 text-center">
              <p className="text-slate-400 text-sm">
                © 2025 Study Nova. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;