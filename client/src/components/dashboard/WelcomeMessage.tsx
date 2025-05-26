import { User } from "@/types";
import { useEffect } from "react";

interface WelcomeMessageProps {
  user: User | null;
}

const WelcomeMessage = ({ user }: WelcomeMessageProps) => {
  if (!user) return null;

  const firstName = user.displayName?.split(' ')[0] || 'Student';
  const isFirstLogin = user.isFirstLogin;

  // Clear the first login flag after showing the welcome message
  useEffect(() => {
    if (isFirstLogin) {
      // Set a timeout to clear the first login flag after the user has seen the message
      const timer = setTimeout(() => {
        const updatedUser = { ...user, isFirstLogin: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }, 3000); // Clear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isFirstLogin, user]);

  // Different welcome messages based on login status
  const getWelcomeMessage = () => {
    if (isFirstLogin) {
      return {
        title: `Welcome to Nova AI, ${firstName}!`,
        subtitle: "Great to have you aboard! Let's start your learning journey with AI tutors and personalized content."
      };
    } else {
      return {
        title: `Welcome back, ${firstName}!`,
        subtitle: "Explore AI tutors and educational content to enhance your learning experience."
      };
    }
  };

  const { title, subtitle } = getWelcomeMessage();

  return (
    <div className="bg-muted rounded-xl p-4 flex items-start gap-4 max-w-md">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div>
        <p className="text-primary font-semibold mb-1">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
