import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard } from "./premium-card";
import { GradientButton, GlassButton } from "./premium-button";
import { SendIcon, RobotIcon, UserIcon } from "./icons";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";

interface PremiumChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  isTyping?: boolean;
  avatar?: string | React.ReactNode;
  className?: string;
}

const PremiumChatBubble: React.FC<PremiumChatBubbleProps> = ({
  message: messageProp, // Renamed prop to avoid conflict
  isUser = false,
  timestamp,
  isTyping = false,
  avatar,
  className
}) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);
  const { themeConfig, selectedTheme } = useAdvancedTheme();

  // Ensure message is a string and log a warning if it's not initially
  if (typeof messageProp !== 'string') {
    console.warn('PremiumChatBubble received non-string message prop. Type:', typeof messageProp, 'Value:', messageProp);
  }
  const message = messageProp || ""; // Default to empty string

  // Fast word-by-word typewriter effect with option to skip animation for long messages
  React.useEffect(() => {
    if (isUser || isTyping) {
      setDisplayedText(message);
      setIsComplete(true);
      return;
    }

    // Skip animation for very long messages (over 500 characters)
    if (message.length > 500) {
      setDisplayedText(message);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);

    // Split the message into chunks (multiple words)
    const words = message.split(/(\s+)/); // Split by whitespace but keep the whitespace
    let wordIndex = 0;
    
    // Very fast typing speed for chunk-by-chunk animation
    const typingSpeed = 3; // Extremely fast typing speed
    const wordsPerInterval = 5; // Display multiple words at once for faster rendering

    const timer = setInterval(() => {
      if (wordIndex < words.length) {
        // Add multiple words at once to the displayed text
        let newText = '';
        for (let i = 0; i < wordsPerInterval && wordIndex + i < words.length; i++) {
          newText += words[wordIndex + i];
        }
        setDisplayedText(prev => prev + newText);
        wordIndex += wordsPerInterval;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [message, isUser, isTyping, selectedTheme]); // Use the derived 'message' in dependencies

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
            {typeof avatar === 'string' ? (
              <img src={avatar} alt="AI" className="w-full h-full rounded-full" />
            ) : avatar ? (
              <div className="text-white">{avatar}</div>
            ) : (
              <RobotIcon size={16} className="text-white" />
            )}
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
            "theme-transition", // Add theme transition class
            isUser
              ? getThemeAwareUserBubbleClasses(selectedTheme)
              : getThemeAwareAIBubbleClasses(selectedTheme)
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

          {/* Timestamp removed as per user request */}
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
            {typeof avatar === 'string' ? (
              <img src={avatar} alt="User" className="w-full h-full rounded-full" />
            ) : avatar ? (
              <div className="text-white">{avatar}</div>
            ) : (
              <UserIcon size={16} className="text-white" />
            )}
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
  const { selectedTheme } = useAdvancedTheme();

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
                  "focus:outline-none focus:ring-2",
                  "placeholder:text-muted-foreground",
                  "transition-all duration-300 theme-transition",
                  "text-sm leading-relaxed",
                  getThemeAwareInputClasses(selectedTheme, isFocused)
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

// Theme-aware styling functions
const getThemeAwareUserBubbleClasses = (theme: string): string => {
  const baseClasses = "ml-auto text-white shadow-glow";

  switch (theme) {
    case 'ocean-blue':
      return `${baseClasses} bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400/30`;
    case 'forest-green':
      return `${baseClasses} bg-gradient-to-r from-green-500 to-green-600 border-green-400/30`;
    case 'sunset-orange':
      return `${baseClasses} bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400/30`;
    case 'purple-galaxy':
      return `${baseClasses} bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400/30`;
    case 'minimalist-gray':
      return `${baseClasses} bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500/30`;
    default:
      return `${baseClasses} bg-gradient-to-r from-primary to-primary/90 border-primary/30`;
  }
};

const getThemeAwareAIBubbleClasses = (theme: string): string => {
  const baseClasses = "glass-card-strong hover:shadow-premium";

  switch (theme) {
    case 'ocean-blue':
      return `${baseClasses} bg-blue-500/10 border-blue-400/20 hover:border-blue-400/40`;
    case 'forest-green':
      return `${baseClasses} bg-green-500/10 border-green-400/20 hover:border-green-400/40`;
    case 'sunset-orange':
      return `${baseClasses} bg-orange-500/10 border-orange-400/20 hover:border-orange-400/40`;
    case 'purple-galaxy':
      return `${baseClasses} bg-purple-500/10 border-purple-400/20 hover:border-purple-400/40`;
    case 'minimalist-gray':
      return `${baseClasses} bg-gray-500/10 border-gray-400/20 hover:border-gray-400/40`;
    default:
      return baseClasses;
  }
};

const getThemeAwareInputClasses = (theme: string, isFocused: boolean): string => {
  const focusClasses = isFocused ? "shadow-glow" : "";

  switch (theme) {
    case 'ocean-blue':
      return `focus:ring-blue-500/50 ${focusClasses}`;
    case 'forest-green':
      return `focus:ring-green-500/50 ${focusClasses}`;
    case 'sunset-orange':
      return `focus:ring-orange-500/50 ${focusClasses}`;
    case 'purple-galaxy':
      return `focus:ring-purple-500/50 ${focusClasses}`;
    case 'minimalist-gray':
      return `focus:ring-gray-500/50 ${focusClasses}`;
    default:
      return `focus:ring-primary/50 ${focusClasses}`;
  }
};

export {
  PremiumChatBubble,
  PremiumChatInput,
  PremiumChatContainer,
  TypingIndicator,
};
