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

  // Primary logo URL - the hexagon logo with graduation cap and text
  const logoUrl = 'https://i.imgur.com/Yx3oUVR.png';

  // Alternative logo URLs as fallbacks
  const fallbackUrls = [
    'https://i.imgur.com/Yx3oUVR.png', // Primary
    'https://raw.githubusercontent.com/user/repo/main/logo.png', // Alternative
    // SVG fallback with Study Nova branding
    'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Hexagon background -->
        <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="url(#grad)" stroke="#1e40af" stroke-width="3"/>
        <!-- Graduation cap -->
        <rect x="70" y="80" width="60" height="8" fill="white" rx="2"/>
        <polygon points="100,75 85,85 115,85" fill="white"/>
        <circle cx="115" cy="85" r="3" fill="white"/>
        <line x1="115" y1="85" x2="125" y2="95" stroke="white" stroke-width="2"/>
        <!-- Text -->
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">NOVA</text>
        <text x="100" y="140" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white">AI Study Buddy</text>
      </svg>
    `)
  ];

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
        onError={(e) => {
          // If the image fails to load, use the SVG fallback
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = fallbackUrls[2]; // Use the SVG fallback
        }}
      />
    </div>
  );
};

export default NovaLogo;
