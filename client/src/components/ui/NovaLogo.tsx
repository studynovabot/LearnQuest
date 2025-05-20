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

  // Logo URL - the hexagon logo with graduation cap and text
  const logoUrl = 'https://i.imgur.com/Yx3oUVR.png';

  // If the image doesn't load, use this direct data URL as fallback
  const fallbackLogoUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgODAiPjxwYXRoIGZpbGw9IiMzMDQyOTkiIGQ9Ik0xMTYuNSAyMi44aDEwLjd2MzQuNGgtMTAuN3ptMjkuNiAwaDEwLjd2MzQuNGgtMTAuN3ptLTU5LjIgMGgxMC43djM0LjRIODYuOXptNDQuNCAzNC40TDExNi41IDIyLjhoMTQuOGwxNC44IDM0LjRoLTE0Ljh6Ii8+PHBhdGggZmlsbD0iIzMwNDI5OSIgZD0iTTE5MS4zIDIyLjhoMTAuN3YzNC40aC0xMC43ek0xOTEuMyA1Ny4ybC0xNC44LTM0LjRoMTQuOGwxNC44IDM0LjRoLTE0Ljh6Ii8+PHBhdGggZmlsbD0iIzMwNDI5OSIgZD0iTTE5MS4zIDU3LjJsLTE0LjgtMzQuNGgxNC44bDE0LjggMzQuNGgtMTQuOHoiLz48cGF0aCBmaWxsPSIjMzA0Mjk5IiBkPSJNMTkxLjMgMjIuOGgxMC43djM0LjRoLTEwLjd6Ii8+PHRleHQgeD0iMTkwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzA0Mjk5Ij5ZT1VSIEFJIFNUVURZIEJVRERZPC90ZXh0PjxwYXRoIGZpbGw9IiM0Mjc2ZjUiIGQ9Ik01NS44IDQwTDQwIDYzLjlsMzEuNi0uMUw4Ny40IDQwIDcxLjYgMTYuMSA0MCAxNnptMTUuOC0xNS45TDg3LjQgNDBMNzEuNiA2My44IDU1LjggNDBsMTUuOC0xNS45eiIvPjxwYXRoIGZpbGw9IiMzMDQyOTkiIGQ9Ik01NS44IDQwTDQwIDE2LjFsMzEuNi0uMUw1NS44IDQwem0wIDBMNDAgNjMuOWwzMS42LS4xTDU1LjggNDB6Ii8+PHBhdGggZmlsbD0iIzMwNDI5OSIgZD0iTTY1LjcgMzIuNWgtOC45djE1aDguOWMxLjggMCAzLjMtLjYgNC40LTEuN3MxLjctMi42IDEuNy00LjQtLjYtMy4zLTEuNy00LjQtMi42LTEuNy00LjQtMS43em0tMi4yIDEwLjl2LTYuOGgxLjhjMSAwIDEuOC4zIDIuNC45cy45IDEuNCAxIDIuNGMwIDEtLjMgMS44LS45IDIuNC0uNi42LTEuNCAxLTIuNCAxaC0xLjl6Ii8+PHBhdGggZmlsbD0iIzMwNDI5OSIgZD0iTTYzLjUgMzYuNmgxLjhjMSAwIDEuOC4zIDIuNC45cy45IDEuNCAxIDIuNGMwIDEtLjMgMS44LS45IDIuNC0uNi42LTEuNCAxLTIuNCAxaC0xLjl2LTYuN20wLTQuMWgtOC45djE1aDguOWMxLjggMCAzLjMtLjYgNC40LTEuN3MxLjctMi42IDEuNy00LjQtLjYtMy4zLTEuNy00LjQtMi42LTEuNy00LjQtMS43eiIvPjwvc3ZnPg==';

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
          // If the image fails to load, use the fallback
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = fallbackLogoUrl;
        }}
      />
    </div>
  );
};

export default NovaLogo;
