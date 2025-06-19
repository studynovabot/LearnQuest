import React from 'react';
import NovaMascotDialogue from './NovaMascotDialogue';

interface MascotDialogueProps {
  message: string;
  emotion?: 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'confused' | 'proud' | 'sleepy' | 'focused';
  position?: 'left' | 'right' | 'center';
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

export const MascotDialogue: React.FC<MascotDialogueProps> = ({
  message,
  emotion = 'happy',
  position = 'left',
  onClose,
  autoHide = true,
  duration = 5000,
  size = 'lg',
  className = ''
}) => {
  return (
    <NovaMascotDialogue
      message={message}
      emotion={emotion}
      position={position}
      size={size}
      className={className}
      autoHide={autoHide}
      duration={duration}
      onComplete={onClose}
      showParticles={true}
      bubbleStyle="modern"
    />
  );
};

export default MascotDialogue;