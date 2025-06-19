import React from 'react';
import NovaMascot from './NovaMascot';

interface NovaBotProps {
  emotion?: 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'confused' | 'proud' | 'sleepy' | 'focused';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  animate?: boolean;
}

export const NovaBot: React.FC<NovaBotProps> = ({ 
  emotion = 'idle', 
  size = 'md', 
  className = '',
  animate = true
}) => {
  // Convert old size format to new format
  const convertSize = (oldSize: string): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' => {
    switch (oldSize) {
      case 'sm': return 'sm';
      case 'md': return 'md';
      case 'lg': return 'lg';
      case 'xl': return 'xl';
      default: return 'md';
    }
  };

  return (
    <NovaMascot
      emotion={emotion}
      size={convertSize(size)}
      className={className}
      animate={animate}
      showParticles={emotion === 'celebrating' || emotion === 'excited'}
    />
  );
};

export default NovaBot;