import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  X, 
  Info, 
  Lock, 
  Eye, 
  CheckCircle,
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyBannerProps {
  variant?: 'compact' | 'detailed' | 'floating';
  showOnce?: boolean;
  className?: string;
}

export default function PrivacyBanner({ 
  variant = 'compact', 
  showOnce = true,
  className = '' 
}: PrivacyBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if banner has been dismissed
    const dismissed = localStorage.getItem('privacy-banner-dismissed');
    const lastShown = localStorage.getItem('privacy-banner-last-shown');
    
    if (showOnce && dismissed) {
      return;
    }
    
    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasBeenShown(true);
      
      if (lastShown) {
        const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        if (daysSinceShown < 7) { // Don't show again for 7 days
          return;
        }
      }
      
      localStorage.setItem('privacy-banner-last-shown', Date.now().toString());
    }, 2000);

    return () => clearTimeout(timer);
  }, [showOnce]);

  const dismissBanner = () => {
    setIsVisible(false);
    if (showOnce) {
      localStorage.setItem('privacy-banner-dismissed', 'true');
    }
  };

  const CompactBanner = () => (
    <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <Shield className="h-4 w-4 text-green-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            🔒 <strong>Privacy First:</strong> Your device ID is used only to prevent trial abuse. 
            We never store or sell personal data.
          </span>
          <Badge variant="outline" className="text-xs">
            GDPR Compliant
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={dismissBanner}
          className="ml-2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );

  const DetailedBanner = () => (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">🛡️ Privacy-First Learning Platform</h3>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Student Safe
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>No personal file access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Email-only authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Auto-delete after 30 days</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              We use anonymous device IDs only to prevent trial abuse and ensure fair access for all students. 
              Your privacy is our priority - no tracking, no ads, no data selling.
            </p>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/privacy-policy" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Privacy Policy
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings?tab=privacy" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Privacy Settings
                </a>
              </Button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={dismissBanner}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FloatingBanner = () => (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-green-200 bg-white dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="font-medium text-sm">Privacy Protected</h4>
              <p className="text-xs text-muted-foreground">
                Your device ID helps prevent abuse. No personal data stored.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs h-6" asChild>
                  <a href="/privacy-policy">
                    Learn More
                    <ExternalLink className="h-2 w-2 ml-1" />
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={dismissBanner}
                  className="text-xs h-6 px-2"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getBannerComponent = () => {
    switch (variant) {
      case 'detailed':
        return <DetailedBanner />;
      case 'floating':
        return <FloatingBanner />;
      default:
        return <CompactBanner />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: variant === 'floating' ? 50 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: variant === 'floating' ? 50 : -20 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {getBannerComponent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Privacy Trust Badge Component
export function PrivacyTrustBadge({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant="outline" 
      className={`bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 ${sizeClasses[size]}`}
    >
      <Shield className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
      Privacy First
    </Badge>
  );
}

// Privacy Notice for Forms
export function PrivacyFormNotice() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            🔒 Your privacy is protected
          </p>
          <p className="text-blue-700 dark:text-blue-300 mt-1">
            We only collect your email for verification. No personal browsing data, 
            files, or location is ever accessed or stored.
          </p>
        </div>
      </div>
    </div>
  );
}
