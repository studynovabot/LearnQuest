import React, { useEffect } from 'react';
import { useEmotionalDesign } from '@/context/EmotionalDesignContext';
import FloatingNova from './FloatingNova';

interface NovaIntegrationProps {
  className?: string;
}

export const NovaIntegration: React.FC<NovaIntegrationProps> = ({ className = '' }) => {
  const { mascotEnabled, showWelcome } = useEmotionalDesign();

  // Show welcome message when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      showWelcome(false); // false = new user
    }, 2000); // Show after 2 seconds

    return () => clearTimeout(timer);
  }, [showWelcome]);

  if (!mascotEnabled) {
    return null;
  }

  return (
    <div className={`nova-integration ${className}`}>
      {/* Floating Nova Assistant */}
      <FloatingNova
        enabled={mascotEnabled}
        position="bottom-right"
        messages={[
          "Need help with your studies? I'm here!",
          "You're doing great! Keep learning!",
          "Ready for your next challenge?",
          "Let's explore something new together!",
          "I believe in you! You've got this!",
          "Learning is an adventure - let's go!",
          "Every question is a step forward!",
          "Your curiosity is your superpower!",
          "StudyNova AI is here to help you succeed!",
          "What would you like to learn today?"
        ]}
      />
    </div>
  );
};

export default NovaIntegration;