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
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-lg',
    lg: 'w-32 h-32 text-xl',
    xl: 'w-40 h-40 text-2xl',
  };

  return (
    <div className={cn(
      'relative rounded-full flex items-center justify-center',
      sizeClasses[size],
      className || 'bg-blue-600'
    )}>
      <span className="text-white font-bold tracking-wider">
        NOVA
      </span>
      {/* Add a subtle pulse animation */}
      <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-pulse"></div>
    </div>
  );
};

export default NovaLogo;
