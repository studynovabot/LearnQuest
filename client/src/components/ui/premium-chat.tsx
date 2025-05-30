import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard } from "./premium-card";
import { GradientButton, GlassButton } from "./premium-button";
import { SendIcon, RobotIcon, UserIcon } from "./icons";

interface PremiumChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  isTyping?: boolean;
  avatar?: string;
  className?: string;
}

const PremiumChatBubble: React.FC<PremiumChatBubbleProps> = ({
  message,
  isUser = false,
  timestamp,
  isTyping = false,
  avatar,
  className
}) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);

  // Typewriter effect for AI messages
  React.useEffect(() => {
    if (isUser || isTyping) {
      setDisplayedText(message);
      setIsComplete(true);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [message, isUser, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Avatar for AI */}
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <RobotIcon size={16} className="text-white" />
          </div>
        </motion.div>
      )}

      {/* Message bubble */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className={cn(
          "max-w-[80%] relative group",
          isUser ? "order-1" : ""
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl relative overflow-hidden",
            "backdrop-blur-md border transition-all duration-300",
            isUser
              ? "bg-primary/20 border-primary/30 text-primary-foreground ml-auto gradient-primary text-white shadow-glow"
              : "glass-card-strong hover:shadow-premium"
          )}
        >
          {/* Shimmer effect for user messages */}
          {isUser && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          )}

          {/* Message content */}
          <div className="relative z-10">
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {displayedText}
                {!isComplete && !isUser && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block w-1 h-4 bg-current ml-1"
                  />
                )}
              </p>
            )}
          </div>

          {/* Timestamp */}
          {timestamp && isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs opacity-70 mt-1"
            >
              {timestamp}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Avatar for user */}
      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center shadow-glow-orange">
            <UserIcon size={16} className="text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1">
    <span className="text-sm text-muted-foreground">AI is typing</span>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-current rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  </div>
);

interface PremiumChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const PremiumChatInput: React.FC<PremiumChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  className
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn("relative", className)}
    >
      <PremiumCard variant="glass-strong" className="p-4">
        <div className="flex items-end gap-3">
          {/* Input field */}
          <div className="flex-1 relative">
            <motion.div
              animate={{
                scale: isFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-xl px-4 py-3 pr-12",
                  "glass-card border-glass-border-strong",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "placeholder:text-muted-foreground",
                  "transition-all duration-300",
                  "text-sm leading-relaxed",
                  isFocused && "shadow-glow"
                )}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />

              {/* Floating label effect */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-2 left-3 px-2 bg-background text-xs text-primary font-medium"
                  >
                    Message
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Send button */}
          <GradientButton
            gradient="primary"
            size="lg"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="shadow-glow flex-shrink-0"
            animate={true}
          >
            <SendIcon size={18} />
          </GradientButton>
        </div>
      </PremiumCard>
    </motion.div>
  );
};

interface PremiumChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PremiumChatContainer: React.FC<PremiumChatContainerProps> = ({
  children,
  className
}) => (
  <PremiumCard
    variant="glass"
    className={cn("h-full flex flex-col overflow-hidden", className)}
    glow={true}
  >
    {children}
  </PremiumCard>
);

export {
  PremiumChatBubble,
  PremiumChatInput,
  PremiumChatContainer,
  TypingIndicator,
};
