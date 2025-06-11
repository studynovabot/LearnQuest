import React from "react";
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
  Github
} from "lucide-react";
import { Helmet } from "react-helmet";
import { useUserContext } from "@/context/UserContext";
import { StarIcon, CrownIcon } from "@/components/ui/icons";

const LandingPage: React.FC = () => {
  const { user } = useUserContext();
  return (
    <>
      <Helmet>
        <title>Study Nova - Your AI Study Companion</title>
        <meta name="description" content="Study Nova helps students master any subject with personalized AI tutors, interactive learning tools, and comprehensive study materials." />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-slate-950 text-white">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-4">
          <p className="text-sm">
            Study Nova is now the #1 AI-powered learning platform for students{" "}
            <a href="#features" className="underline hover:no-underline">
              Read More
            </a>
          </p>
        </div>

        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur border-b border-slate-800">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Study Nova</span>
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/app">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                    Go to App
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-slate-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  #1 AI-Powered Learning Platform for Students
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-[800px] mx-auto leading-relaxed">
                  Study Nova codes like you, thinks like you, and adapts to your learning style instantly.
                  Integrate it with your curriculum, fine-tune it to your subjects, and choose the best AI tutors for your tasks.
                  Learn anywhere and stay in full control of your education.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-full border border-slate-700">Personalized</span>
                <span className="px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-full border border-slate-700">AI-powered</span>
                <span className="px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-full border border-slate-700">Comprehensive</span>
              </div>
              <p className="text-slate-400 text-base">
                Start for free in your favorite subjects, or contact us for premium solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {user ? (
                  <Link href="/app">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-3 text-base">
                      Go to App
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-3 text-base">
                        Start for Free
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3 text-base">
                        Book a demo
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="w-full py-12 md:py-16 bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-200">
              AI learning agent trusted by thousands of students
            </h2>
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-medium text-slate-300">
                  Get your AI Study Partner that works for you
                </h3>
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