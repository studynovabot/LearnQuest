import React from 'react';
import { cn } from '@/lib/utils';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  className
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  // Logo URL - the hexagon logo with graduation cap
  const logoUrl = 'https://i.imgur.com/Yx3oUVR.png';

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <img
        src={logoUrl}
        alt="NOVA - Your AI Study Buddy"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default NovaLogo;
