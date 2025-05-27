import { useCallback } from 'react';
// import { track } from '@vercel/analytics';

// Define the gtag function to match the one from Google Analytics
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set',
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}

export function useAnalytics() {
  /**
   * Track a page view
   */
  const trackPageView = useCallback((path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: path,
      });
      console.log(`[Analytics] Page view: ${path}`);
    }
  }, []);

  /**
   * Track a user event
   */
  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    // Track with Google Analytics (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    // Track with Vercel Analytics (temporarily disabled for deployment)
    // try {
    //   track(action, {
    //     category,
    //     label,
    //     value,
    //   });
    // } catch (error) {
    //   console.warn('Vercel Analytics tracking failed:', error);
    // }

    console.log(`[Analytics] Event: ${action} (${category}${label ? ` - ${label}` : ''}${value ? ` - ${value}` : ''})`);
  }, []);

  /**
   * Track user login
   */
  const trackLogin = useCallback((method: string) => {
    trackEvent('login', 'user', method);
  }, [trackEvent]);

  /**
   * Track user registration
   */
  const trackSignup = useCallback((method: string) => {
    trackEvent('sign_up', 'user', method);
  }, [trackEvent]);

  /**
   * Track task creation
   */
  const trackTaskCreation = useCallback(() => {
    trackEvent('create_task', 'tasks');
  }, [trackEvent]);

  /**
   * Track task completion
   */
  const trackTaskCompletion = useCallback((xpEarned: number) => {
    trackEvent('complete_task', 'tasks', undefined, xpEarned);
  }, [trackEvent]);

  /**
   * Track AI chat interaction
   */
  const trackChatInteraction = useCallback((tutorId: string) => {
    trackEvent('chat_message', 'chat', tutorId);
  }, [trackEvent]);

  /**
   * Track error events
   */
  const trackError = useCallback((errorType: string, errorMessage: string) => {
    trackEvent('error', errorType, errorMessage);
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackLogin,
    trackSignup,
    trackTaskCreation,
    trackTaskCompletion,
    trackChatInteraction,
    trackError
  };
}
