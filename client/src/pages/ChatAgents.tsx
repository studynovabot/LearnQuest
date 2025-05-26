import { useState, useRef, useEffect } from "react";
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat } from "@/hooks/useChat";
import { AITutor, ChatMessage } from "@/types";
import {
  SendIcon,
  RobotIcon,
  UserIcon,
  CompassIcon,
  SmileIcon,
  CalculatorIcon,
  LanguagesIcon,
  LockIcon,
  FlaskIcon,
  BookIcon,
  LandmarkIcon,
  CodeIcon,
  PaletteIcon,
  LeafIcon,
  BrainIcon,
  TrendingUpIcon,
  GlobeIcon,
  FlexIcon,
  BookOpenIcon,
  SparklesIcon,
  ChevronDownIcon
} from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { generateAvatar, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import FirebaseError from "@/components/firebase-error";
import { FirebaseStatus } from "@/components/firebase/FirebaseStatus";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatAgents = () => {
  const {
    agents,
    unlockedAgents,
    lockedAgents,
    activeAgent,
    isLoading,
    sendMessage,
    selectAgent,
    agentMessages,
    isSubmitting
  } = useChat();

  const { user } = useAuth();
  const { toast } = useToast();
  const { trackChatInteraction, trackError } = useAnalytics();
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | number | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(inputMessage);
      // Track chat interaction with analytics
      if (activeAgent) {
        trackChatInteraction(activeAgent.id.toString());
      }
      setInputMessage("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error sending message';
      trackError('chat', errorMessage);
      toast({
        title: "Error sending message",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleUnlockAgent = async (agent: AITutor) => {
    // All agents are unlocked by default now
    toast({
      title: "Agent Available!",
      description: `${agent.name} is ready to help you.`
    });
  };

  const getAgentIcon = (iconName?: string, size = 24) => {
    switch (iconName) {
      case 'user': return <UserIcon size={size} />;
      case 'robot': return <RobotIcon size={size} />;
      case 'compass': return <CompassIcon size={size} />;
      case 'smile': return <SmileIcon size={size} />;
      case 'calculator': return <CalculatorIcon size={size} />;
      case 'languages': return <LanguagesIcon size={size} />;
      case 'flask': return <FlaskIcon size={size} />;
      case 'book': return <BookIcon size={size} />;
      case 'landmark': return <LandmarkIcon size={size} />;
      case 'code': return <CodeIcon size={size} />;
      case 'palette': return <PaletteIcon size={size} />;
      case 'leaf': return <LeafIcon size={size} />;
      case 'brain': return <BrainIcon size={size} />;
      case 'trending-up': return <TrendingUpIcon size={size} />;
      case 'globe': return <GlobeIcon size={size} />;
      case 'flex': return <FlexIcon size={size} />;
      case 'book-open': return <BookOpenIcon size={size} />;
      case 'sparkles': return <SparklesIcon size={size} />;
      default: return <RobotIcon size={size} />;
    }
  };

  const getAgentColorClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 text-white';
      case 'purple': return 'bg-purple-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'amber': return 'bg-amber-500 text-white';
      case 'cyan': return 'bg-cyan-500 text-white';
      case 'pink': return 'bg-pink-500 text-white';
      case 'emerald': return 'bg-emerald-500 text-white';
      case 'indigo': return 'bg-indigo-500 text-white';
      case 'violet': return 'bg-violet-500 text-white';
      case 'red': return 'bg-red-500 text-white';
      case 'teal': return 'bg-teal-500 text-white';
      case 'yellow': return 'bg-yellow-500 text-black';
      case 'slate': return 'bg-slate-500 text-white';
      case 'rose': return 'bg-rose-500 text-white';
      default: return 'bg-primary text-white';
    }
  };

  // Mobile Tutor Selector Component
  const MobileTutorSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between mb-4 h-12"
        >
          <div className="flex items-center gap-3">
            {activeAgent ? (
              <>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", getAgentColorClass(activeAgent.color))}>
                  {getAgentIcon(activeAgent.iconName, 16)}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{activeAgent.name}</p>
                  <p className="text-xs text-muted-foreground">{activeAgent.subject}</p>
                </div>
              </>
            ) : (
              <>
                <RobotIcon size={20} className="text-muted-foreground" />
                <span>Select a Tutor</span>
              </>
            )}
          </div>
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-80 overflow-y-auto mobile-dropdown">
        {unlockedAgents.map((agent: AITutor) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => selectAgent(agent)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", getAgentColorClass(agent.color))}>
              {getAgentIcon(agent.iconName, 16)}
            </div>
            <div>
              <p className="font-medium text-sm">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.subject}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Helmet>
        <title>AI Tutors | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Chat with specialized AI tutors for different subjects. Get help with math, languages, sciences and more through our AI-powered learning assistants." />
      </Helmet>

      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle className="text-2xl font-bold">Nova AI Tutors</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-4">
              <FirebaseStatus />
            </div>
            <div className={cn(
              "flex min-h-[500px]",
              isMobile ? "flex-col mobile-chat-area" : "flex-row h-[calc(100vh-12rem)]"
            )}>
              {/* Desktop Sidebar - Hidden on Mobile */}
              {!isMobile && (
                <div className="w-80 flex-shrink-0 border-r border-border p-4 overflow-y-auto">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Your Tutors</h3>
                    <div className="space-y-2">
                      {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))
                      ) : (
                        <>
                          {unlockedAgents.map((agent: AITutor) => (
                            <motion.div
                              key={agent.id}
                              whileHover={{ x: 5 }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                                activeAgent?.id === agent.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                              )}
                              onClick={() => selectAgent(agent)}
                            >
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getAgentColorClass(agent.color))}>
                                {getAgentIcon(agent.iconName)}
                              </div>
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-xs text-muted-foreground">{agent.subject}</p>
                              </div>
                            </motion.div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {lockedAgents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Locked Tutors</h3>
                      <div className="space-y-2">
                        {lockedAgents.map((agent: AITutor) => (
                          <div
                            key={agent.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                              <LockIcon className="text-white" size={20} />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">Available soon</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnlockAgent(agent)}
                              disabled={unlockingId === agent.id}
                            >
                              {unlockingId === agent.id ? (
                                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                              ) : (
                                "Unlock"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Area - Full width on mobile, responsive */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className={cn(
                  "flex-grow overflow-y-auto",
                  isMobile ? "p-3" : "p-4"
                )}>
                  {/* Mobile Tutor Selector */}
                  {isMobile && <MobileTutorSelector />}

                  {activeAgent ? (
                    <div className="flex flex-col gap-4">
                      {/* Agent Header - Smaller on mobile */}
                      <div className={cn(
                        "flex items-center gap-3 bg-muted rounded-lg mb-4",
                        isMobile ? "p-2" : "p-3"
                      )}>
                        <div className={cn(
                          "rounded-full flex items-center justify-center",
                          getAgentColorClass(activeAgent.color),
                          isMobile ? "w-10 h-10" : "w-12 h-12"
                        )}>
                          {getAgentIcon(activeAgent.iconName, isMobile ? 20 : 28)}
                        </div>
                        <div className="flex-grow">
                          <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>{activeAgent.name}</h3>
                          <p className="text-sm text-muted-foreground">{activeAgent.subject} specialist</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs text-green-500">AI Enabled</span>
                        </div>
                      </div>

                      {agentMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <RobotIcon size={48} className="mx-auto mb-4 text-primary opacity-50" />
                          <h3 className="text-xl font-semibold mb-2">Start chatting with {activeAgent.name}</h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-4">
                            Ask questions about {activeAgent.subject?.toLowerCase()} and get personalized help with your studies.
                          </p>
                          <div className="inline-flex items-center bg-secondary/10 rounded-full px-3 py-1 text-xs text-secondary border border-secondary/20">
                            {Number(activeAgent.id) === 1 ? (
                              "Powered by Groq's Llama-3.3-70B-Versatile"
                            ) : Number(activeAgent.id) >= 2 && Number(activeAgent.id) <= 4 ? (
                              "Powered by Groq's Llama-3.3-70B-Versatile"
                            ) : Number(activeAgent.id) >= 5 && Number(activeAgent.id) <= 7 ? (
                              "Powered by Groq's Llama-3.3-70B-Versatile"
                            ) : Number(activeAgent.id) >= 8 && Number(activeAgent.id) <= 10 ? (
                              "Powered by Groq's Llama-3.3-70B-Versatile"
                            ) : Number(activeAgent.id) >= 11 && Number(activeAgent.id) <= 13 ? (
                              "Powered by Groq's Llama-3.3-70B-Versatile"
                            ) : (
                              "Powered by Groq's Llama-3.3-70B-Versatile"
                            )}
                          </div>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {agentMessages.map((message: ChatMessage) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                "flex gap-3 max-w-[85%]",
                                message.role === "user" ? "self-end flex-row-reverse ml-auto" : ""
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                  message.role === "user" ? "bg-muted" : getAgentColorClass(activeAgent.color)
                                )}
                              >
                                {message.role === "user" ? (
                                  <img
                                    src={generateAvatar(user?.displayName || "User")}
                                    alt="User avatar"
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  getAgentIcon(activeAgent.iconName, 16)
                                )}
                              </div>

                              <div className="relative">
                                <div
                                  className={cn(
                                    "rounded-xl p-3",
                                    message.role === "user"
                                      ? "bg-primary rounded-tr-none"
                                      : "bg-muted rounded-tl-none"
                                  )}
                                >
                                  {message.role === "assistant" ? (
                                    <TypewriterText
                                      text={message.content}
                                      speed={20}
                                      className="text-sm"
                                      onComplete={() => setTypingMessageId(null)}
                                    />
                                  ) : (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                </div>


                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <RobotIcon size={64} className="text-muted-foreground mb-6" />
                      <h2 className="text-2xl font-bold mb-2">Select an AI Tutor</h2>
                      <p className="text-muted-foreground max-w-md">
                        Choose from your available tutors to get specialized help with different subjects
                      </p>
                    </div>
                  )}
                </div>

                {activeAgent && (
                  <div className={cn(
                    "border-t border-border flex-shrink-0 bg-background",
                    isMobile ? "p-3 pb-safe mobile-chat-input" : "p-4"
                  )}>
                    <form onSubmit={handleSubmit} className="flex gap-2 max-w-full">
                      <Input
                        type="text"
                        placeholder={`Ask ${activeAgent.name} a question...`}
                        className={cn(
                          "flex-1 min-w-0 bg-muted border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50",
                          isMobile ? "h-12 text-base" : "h-10"
                        )}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={isSending}
                        style={{ fontSize: isMobile ? '16px' : undefined }} // Prevents zoom on iOS
                      />
                      <Button
                        type="submit"
                        disabled={isSending || !inputMessage.trim()}
                        className={cn(
                          "flex-shrink-0 touch-manipulation",
                          isMobile ? "h-12 w-12 p-0" : "h-10"
                        )}
                      >
                        {isSending ? (
                          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                        ) : (
                          <>
                            {!isMobile && "Send"}
                            <SendIcon className={cn(isMobile ? "" : "ml-2")} size={16} />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ChatAgents;
