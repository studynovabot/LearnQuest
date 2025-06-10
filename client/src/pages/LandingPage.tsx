
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  Star, 
  Code, 
  Search, 
  Image, 
  FileCode, 
  Database,
  Github,
  Server,
  Lock,
  Zap
} from "lucide-react";
import { Helmet } from "react-helmet";
import { useUserContext } from "@/context/UserContext";

const LandingPage: React.FC = () => {
  const { user } = useUserContext();
  return (
    <>
      <Helmet>
        <title>LearnQuest - Your AI Study Companion</title>
        <meta name="description" content="LearnQuest helps students master any subject with personalized AI tutors, interactive learning tools, and comprehensive study materials." />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-background">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LearnQuest</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary">
                Features
              </a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary">
                Testimonials
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/app">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Go to App
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-8 max-w-3xl mx-auto">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  LearnQuest thinks like you, adapts to your learning style instantly
                </h1>
                <p className="text-muted-foreground md:text-xl max-w-[700px] mx-auto">
                  Access AI tutors, educational content, and personalized learning tools with our premium platform designed for academic excellence.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1 text-sm bg-muted rounded-full">Personalized</span>
                <span className="px-3 py-1 text-sm bg-muted rounded-full">Interactive</span>
                <span className="px-3 py-1 text-sm bg-muted rounded-full">Comprehensive</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {user ? (
                  <Link href="/app">
                    <Button size="lg" className="gap-1.5 bg-primary hover:bg-primary/90">
                      Go to App
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-1.5 bg-primary hover:bg-primary/90">
                        Start for free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline">
                        Log in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="w-full py-8 md:py-12 bg-muted/30">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              AI tutor trusted by thousands of students
            </h2>
            <div className="flex flex-col space-y-4">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-medium">
                  Get your AI Study Partner that works for you
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Autonomous AI tutor
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Delegate your learning tasks end-to-end
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Just describe what you need to learn — LearnQuest AI plans, explains, and helps you master the topic. It works like a personal tutor in your device, integrating with your curriculum and learning style.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Explains concepts step-by-step with reasoning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Searches and analyzes textbooks for accurate explanations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Creates personalized study plans and practice questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Simple, intuitive interface for all ages</span>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted/50">
                <img
                  src="/images/hero-image.svg"
                  alt="LearnQuest AI Tutor Interface"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=AI+Tutor+Interface";
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Second Feature */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 relative aspect-video overflow-hidden rounded-xl border bg-muted/50">
                <img
                  src="https://placehold.co/600x400/e2e8f0/64748b?text=In-App+Chat"
                  alt="LearnQuest In-App Chat"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  In-app chat
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ask, learn, and solve problems in natural language
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Get accurate, context-aware answers and explanations, tailored to your curriculum. Fast and meeting your specific learning needs.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Ask questions about any subject or topic</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Get step-by-step solutions to homework problems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Request explanations at your learning level</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Third Feature */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Comprehensive study materials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Access NCERT solutions and textbook explanations
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  LearnQuest provides detailed solutions to NCERT textbooks and other educational materials, helping you understand complex topics with ease.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Complete NCERT solutions for all classes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Step-by-step explanations of concepts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Visual aids like flow charts and diagrams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Practice questions with detailed solutions</span>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted/50">
                <img
                  src="https://placehold.co/600x400/e2e8f0/64748b?text=Study+Materials"
                  alt="LearnQuest Study Materials"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  See how students use AI tutor in real studies
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Watch use cases of LearnQuest AI autonomously solving students' problems while they focus on understanding.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col justify-between space-y-4 rounded-xl border p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="font-bold">LearnQuest AI saved me hours of study time</h3>
                  <p className="text-muted-foreground">
                    "LearnQuest has completely transformed how I study. The AI tutors explain concepts in a way that's easy to understand, and the NCERT solutions have been a lifesaver for my exams."
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium">RS</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rahul S.</p>
                    <p className="text-xs text-muted-foreground">Class 10 Student</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-xl border p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="font-bold">My grades improved dramatically</h3>
                  <p className="text-muted-foreground">
                    "As a parent, I'm impressed with how LearnQuest has helped my daughter improve her grades. The personalized approach and detailed explanations have made a huge difference."
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium">PK</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priya K.</p>
                    <p className="text-xs text-muted-foreground">Parent</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-xl border p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="font-bold">Complex topics made simple</h3>
                  <p className="text-muted-foreground">
                    "The interactive study tools and concept maps have helped me visualize complex topics. I've seen a significant improvement in my understanding and retention of difficult subjects."
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium">AM</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ananya M.</p>
                    <p className="text-xs text-muted-foreground">Class 12 Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  With AI tutor, transform how you learn
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="flex flex-col items-center text-center space-y-3 p-6">
                <Brain className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Understands your context</h3>
                <p className="text-muted-foreground">
                  LearnQuest analyzes your curriculum and learning style to deliver accurate, context-aware explanations and solutions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6">
                <Lightbulb className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Learns and evolves with you</h3>
                <p className="text-muted-foreground">
                  The more you use it, the smarter it gets. LearnQuest adapts to your learning pace and preferences.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6">
                <Lock className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Safe and secure</h3>
                <p className="text-muted-foreground">
                  Your data is protected and your privacy is our priority. Learn with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Powerful AI tools for every learning task
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm">
                <Code className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">AI Homework Helper</h3>
                <p className="text-muted-foreground mb-4">
                  Get step-by-step solutions to your homework problems in any subject.
                </p>
                {user ? (
                  <Link href="/app" className="text-primary hover:underline mt-auto">
                    Go to AI Homework Helper
                  </Link>
                ) : (
                  <Link href="/register" className="text-primary hover:underline mt-auto">
                    Try AI Homework Helper
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm">
                <Search className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Concept Explorer</h3>
                <p className="text-muted-foreground mb-4">
                  Understand complex concepts with interactive explanations and visual aids.
                </p>
                {user ? (
                  <Link href="/app" className="text-primary hover:underline mt-auto">
                    Go to Concept Explorer
                  </Link>
                ) : (
                  <Link href="/register" className="text-primary hover:underline mt-auto">
                    Try Concept Explorer
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm">
                <Image className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Visual Learning</h3>
                <p className="text-muted-foreground mb-4">
                  Convert text explanations into diagrams, charts, and visual aids for better understanding.
                </p>
                {user ? (
                  <Link href="/app" className="text-primary hover:underline mt-auto">
                    Go to Visual Learning
                  </Link>
                ) : (
                  <Link href="/register" className="text-primary hover:underline mt-auto">
                    Try Visual Learning
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm">
                <FileCode className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">NCERT Solutions</h3>
                <p className="text-muted-foreground mb-4">
                  Access comprehensive solutions for NCERT textbooks across all subjects and classes.
                </p>
                {user ? (
                  <Link href="/app" className="text-primary hover:underline mt-auto">
                    Go to NCERT Solutions
                  </Link>
                ) : (
                  <Link href="/register" className="text-primary hover:underline mt-auto">
                    Try NCERT Solutions
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm">
                <Database className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Practice Question Bank</h3>
                <p className="text-muted-foreground mb-4">
                  Practice with thousands of questions and get instant feedback on your answers.
                </p>
                {user ? (
                  <Link href="/app" className="text-primary hover:underline mt-auto">
                    Go to Practice Question Bank
                  </Link>
                ) : (
                  <Link href="/register" className="text-primary hover:underline mt-auto">
                    Try Practice Question Bank
                  </Link>
                )}
              </div>
              <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm">
                <Zap className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Exam Prep</h3>
                <p className="text-muted-foreground mb-4">
                  Prepare for exams with personalized study plans, mock tests, and performance analytics.
                </p>
                <Link href="/register" className="text-primary hover:underline mt-auto">
                  Try Exam Prep
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Supports all major subjects
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-12">
              {["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", 
                "Economics", "English", "Hindi", "Science", "Social Studies", "Computer Science"].map((subject) => (
                <div key={subject} className="flex items-center justify-center p-4 rounded-lg border bg-background">
                  <span className="font-medium">{subject}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/register">
                <Button size="lg" className="gap-1.5 bg-primary hover:bg-primary/90">
                  Get LearnQuest
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Try LearnQuest now
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Free to start. Fully powered AI tutor for students. Upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <div className="flex flex-col rounded-xl border shadow-sm bg-background">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">₹0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For personal and hobby learning
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Limited AI tutor access (5 questions/day)</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Basic NCERT solutions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Access to concept explanations</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col p-6 mt-auto">
                  {user ? (
                    <Link href="/app">
                      <Button className="w-full" variant="outline">
                        Go to App
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button className="w-full" variant="outline">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-xl border shadow-sm bg-background relative">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0 rounded-full bg-primary px-3 py-1">
                  <span className="text-xs font-medium text-primary-foreground">Popular</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">₹299</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For serious students
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Unlimited AI tutor access</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Full NCERT solutions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Performance analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Practice question bank</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col p-6 mt-auto">
                  {user ? (
                    <Link href="/app">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Go to App
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-xl border shadow-sm bg-background">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Premium</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">₹599</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For exam preparation
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Personalized study plans</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Mock tests & exam prep</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Visual learning tools</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col p-6 mt-auto">
                  {user ? (
                    <Link href="/app">
                      <Button className="w-full" variant="outline">
                        Go to App
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button className="w-full" variant="outline">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to transform your learning experience?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students who are achieving academic excellence with LearnQuest.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <Link href="/app">
                    <Button size="lg" variant="secondary" className="gap-1.5">
                      Go to App
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-6 md:py-8">
          <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8 px-4 md:px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LearnQuest</span>
            </div>
            <nav className="flex gap-4 sm:gap-6">
              <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs hover:underline underline-offset-4">
                Terms of Service
              </Link>
              <a href="#" className="text-xs hover:underline underline-offset-4">
                Contact
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                © 2024 LearnQuest. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;