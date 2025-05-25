import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, RobotIcon, HistoryIcon } from "@/components/ui/icons";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { generateAvatar } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ChatInterface = () => {
  const { agentMessages, isLoading, sendMessage } = useChat();
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      setInputMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Take recent messages only (last 10)
  const recentMessages = (agentMessages || []).slice(-10);

  // Add a welcome message if there are no messages
  const displayMessages: ChatMessage[] = recentMessages.length > 0
              ? recentMessages.map(message => ({
                  ...message,
                  role: message.role === 'user' || message.role === 'assistant' ? message.role : 'assistant', // Ensure role matches expected values
                  timestamp: message.timestamp || Date.now(),
                })) as ChatMessage[]
              : [{
                  id: Date.now(),
                  role: 'assistant',
                  content: 'Welcome to LearnQuest! How can I help you today?',
                  timestamp: Date.now(),
                  // Remove userId as it's not in the ChatMessage type
                }];

  // Debug log for troubleshooting
  console.log('agentMessages:', agentMessages);

  if (isLoading && agentMessages.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && agentMessages.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Nova Chat</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground flex items-center gap-1">
            <HistoryIcon size={16} />
            <span>History</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <RobotIcon size={48} className="mb-4 text-primary opacity-50" />
            <p>Ask Nova anything about your studies!</p>
            <p className="text-sm mt-2">Start by typing your question below.</p>
            <p className="text-xs text-red-500 mt-4">(Debug: No chat messages found. Check backend and network tab.)</p>
          </div>
          <form onSubmit={handleSubmit} className="relative mt-4">
            <Input
              type="text"
              placeholder="Ask anything..."
              className="w-full bg-muted border-border rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
            />
            <Button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary rounded-lg flex items-center justify-center p-0 touch-manipulation"
              disabled={isSending || !inputMessage.trim()}
            >
              {isSending ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
              ) : (
                <SendIcon size={16} />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Nova Chat</CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground flex items-center gap-1">
          <HistoryIcon size={16} />
          <span>History</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div
          className="bg-background rounded-xl p-4 mb-4 overflow-y-auto flex flex-col gap-4"
          style={{
            minHeight: "300px",
            maxHeight: "500px",
            height: "calc(100vh - 400px)"
          }}
        >
          {recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <RobotIcon size={48} className="mb-4 text-primary opacity-50" />
              <p>Ask Nova anything about your studies!</p>
              <p className="text-sm mt-2">Start by typing your question below.</p>
            </div>
          ) : (
            <AnimatePresence>
              {displayMessages.map((message: ChatMessage) => (
                <motion.div
                  key={message.timestamp} // Use timestamp instead of createdAt
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    message.role === "user" ? "self-end flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === "user" ? "bg-muted" : "bg-primary"
                    )}
                  >
                    {message.role === "user" ? (
                      user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="User avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src={generateAvatar(user?.displayName || "User")}
                          alt="User avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      )
                    ) : (
                      <RobotIcon className="text-white" size={16} />
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
                      <p className="text-sm">{message.content}</p>
                    </div>

                    {/* XP Award Indicator */}
                    {message.xpAwarded && message.xpAwarded > 0 && (
                      <motion.div
                        className="absolute -top-4 -right-4 bg-secondary rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1 xp-gained"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8L15 13.2L19 14.1L15.5 18.2L16.5 22L12 20.2L7.5 22L8.5 18.2L5 14.1L9 13.2L12 8Z" fill="currentColor" />
                        </svg>
                        <span>+{message.xpAwarded} XP</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="text"
            placeholder="Ask anything..."
            className="w-full bg-muted border-border rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
          />
          <Button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary rounded-lg flex items-center justify-center p-0 touch-manipulation"
            disabled={isSending || !inputMessage.trim()}
          >
            {isSending ? (
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
            ) : (
              <SendIcon size={16} />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;