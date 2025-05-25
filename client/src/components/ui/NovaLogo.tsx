import React from 'react';
import { cn } from '@/lib/utils';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  iconOnly?: boolean; // For compact spaces like sidebar
}

const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  className,
  iconOnly = false
}) => {
  // Size mappings
  const sizeClasses = iconOnly ? {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  } : {
    sm: 'w-24 h-8',
    md: 'w-32 h-10',
    lg: 'w-48 h-14',
    xl: 'w-64 h-20',
  };

  // Icon-only version for compact spaces - exact match to provided design
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <!-- Lighter blue gradients for better visibility -->
        <linearGradient id="iconHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="iconRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#93C5FD;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:0.7" />
        </linearGradient>
      </defs>

      <!-- Outer hexagonal rings - multiple layers like in original -->
      <polygon points="60,10 95,30 95,70 60,90 25,70 25,30" fill="none" stroke="url(#iconRingGrad)" stroke-width="3" opacity="0.6"/>
      <polygon points="60,15 88,32 88,68 60,85 32,68 32,32" fill="none" stroke="url(#iconRingGrad)" stroke-width="2" opacity="0.8"/>

      <!-- Main inner hexagon -->
      <polygon points="60,20 83,35 83,65 60,80 37,65 37,35" fill="url(#iconHexGrad)"/>

      <!-- Graduation cap - positioned exactly like original -->
      <g transform="translate(60,50)">
        <!-- Cap base (mortarboard) -->
        <rect x="-12" y="-3" width="24" height="6" fill="white" rx="1"/>
        <!-- Cap top (square academic cap) -->
        <rect x="-10" y="-8" width="20" height="5" fill="white" rx="1"/>
        <!-- Tassel -->
        <circle cx="8" cy="-5" r="1.5" fill="white"/>
        <line x1="8" y1="-3" x2="12" y2="3" stroke="white" stroke-width="1.5"/>
      </g>
    </svg>
  `;

  // Full logo version - exact match to provided design
  const fullLogoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120">
      <defs>
        <!-- Lighter blue gradients for better visibility -->
        <linearGradient id="fullHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="fullRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#93C5FD;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:0.7" />
        </linearGradient>
      </defs>

      <!-- Outer hexagonal rings - multiple layers like in original -->
      <polygon points="60,10 95,30 95,70 60,90 25,70 25,30" fill="none" stroke="url(#fullRingGrad)" stroke-width="3" opacity="0.6"/>
      <polygon points="60,15 88,32 88,68 60,85 32,68 32,32" fill="none" stroke="url(#fullRingGrad)" stroke-width="2" opacity="0.8"/>

      <!-- Main inner hexagon -->
      <polygon points="60,20 83,35 83,65 60,80 37,65 37,35" fill="url(#fullHexGrad)"/>

      <!-- Graduation cap - positioned exactly like original -->
      <g transform="translate(60,50)">
        <!-- Cap base (mortarboard) -->
        <rect x="-12" y="-3" width="24" height="6" fill="white" rx="1"/>
        <!-- Cap top (square academic cap) -->
        <rect x="-10" y="-8" width="20" height="5" fill="white" rx="1"/>
        <!-- Tassel -->
        <circle cx="8" cy="-5" r="1.5" fill="white"/>
        <line x1="8" y1="-3" x2="12" y2="3" stroke="white" stroke-width="1.5"/>
      </g>

      <!-- NOVA text - lighter color for better visibility -->
      <text x="140" y="50" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#60A5FA">NOVA AI</text>

      <!-- Subtitle - updated text and lighter color -->
      <text x="140" y="70" font-family="Arial, sans-serif" font-size="14" font-weight="normal" fill="#93C5FD">Your AI Study Buddy</text>
    </svg>
  `;

  const logoSvg = iconOnly ? iconSvg : fullLogoSvg;

  const logoUrl = `data:image/svg+xml;base64,${btoa(logoSvg)}`;

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <img
        src={logoUrl}
        alt="NOVA AI - Your AI Study Buddy"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default NovaLogo;
