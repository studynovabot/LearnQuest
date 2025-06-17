import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500",
    secondary: "bg-card/80 backdrop-blur-sm border border-border/40 text-primary hover:bg-muted/50 hover:border-primary/30 focus:ring-primary",
    ghost: "text-muted-foreground hover:text-primary hover:bg-muted/30 focus:ring-primary",
    outline: "border border-primary/30 text-primary hover:bg-primary/10 focus:ring-primary",
    gradient: "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500"
  };
  
  const sizes = {
    sm: "px-5 py-2.5 text-sm rounded-xl",
    md: "px-7 py-3.5 text-base rounded-xl",
    lg: "px-9 py-4.5 text-lg rounded-2xl",
    xl: "px-12 py-6 text-xl rounded-2xl"
  };
  
  return (
    <button 
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};