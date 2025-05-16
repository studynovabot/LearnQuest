import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateLevelProgress(xp: number, maxXP: number): number {
  return Math.min(100, Math.floor((xp / maxXP) * 100));
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 750) + 1;
}

export function calculateXpToNextLevel(xp: number): number {
  const level = calculateLevel(xp);
  const nextLevelXp = level * 750;
  return nextLevelXp - xp;
}

export function getStatusColor(status: 'needs_improvement' | 'average' | 'good' | 'excellent' | string): string {
  switch (status) {
    case 'needs_improvement':
      return 'progress-fill-red';
    case 'average':
      return 'progress-fill-yellow';
    case 'good':
      return 'progress-fill-blue';
    case 'excellent':
      return 'progress-fill-green';
    default:
      return 'progress-fill';
  }
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high' | string): string {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-muted-foreground';
  }
}

export function getDayName(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

export function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays > 1 && diffInDays < 7) return rtf.format(diffInDays, 'day');
  
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function getLastSevenDays(): { date: Date, day: string }[] {
  const result: { date: Date, day: string }[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    result.push({
      date,
      day: getDayName(date)
    });
  }
  
  return result;
}

export function generateAvatar(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
    
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=60A5FA&size=128`;
}
