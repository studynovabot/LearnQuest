import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false
}) => {
  return (
    <div 
      className={cn(
        "bg-card text-card-foreground backdrop-blur-sm rounded-2xl border border-border shadow-xl",
        hover && "hover:shadow-2xl hover:scale-105 transition-all duration-300",
        glow && "animate-glow",
        gradient && "bg-gradient-to-br from-background/90 to-indigo-50/90",
        className
      )}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600'
  };

  return (
    <PremiumCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </PremiumCard>
  );
};

interface TutorCardProps {
  name: string;
  subject: string;
  description: string;
  avatar: string;
  status: 'online' | 'offline';
  lastUsed: string;
  onClick?: () => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  name,
  subject,
  description,
  avatar,
  status,
  lastUsed,
  onClick
}) => {
  return (
    <PremiumCard className="p-6 cursor-pointer group" hover>
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
            {avatar}
          </div>
          {status === 'online' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-background rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{subject}</p>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/70">Last used: {lastUsed}</span>
        <div className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
          →
        </div>
      </div>
    </PremiumCard>
  );
};