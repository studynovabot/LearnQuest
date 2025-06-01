import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from '@/components/ui/premium-card';
import { PremiumInput } from '@/components/ui/premium-form';
import { GradientButton } from '@/components/ui/premium-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Shield, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import NovaLogo from '@/components/ui/NovaLogo';
import { PrivacyFormNotice, PrivacyTrustBadge } from '@/components/privacy/PrivacyBanner';
import { getDeviceInfoForAuth } from '@/services/fingerprint';
import { config } from '@/config';

interface OTPLoginProps {
  mode?: 'login' | 'register';
}

export default function OTPLogin({ mode = 'login' }: OTPLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Initialize device fingerprint
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const deviceInfo = await getDeviceInfoForAuth();
        setDeviceFingerprint(deviceInfo.hashedFingerprint);
      } catch (error) {
        console.error('Failed to get device fingerprint:', error);
      }
    };
    
    initFingerprint();
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'register' && (!displayName || !password)) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all registration fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send-otp',
          email,
          purpose: mode,
          fingerprint: deviceFingerprint
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setCountdown(60); // 60 seconds cooldown
        toast({
          title: "Verification Code Sent",
          description: "Check your email for the 6-digit code",
        });
      } else {
        toast({
          title: "Failed to Send Code",
          description: data.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const action = mode === 'login' ? 'verify-login' : 'verify-register';
      const body: any = {
        action,
        email,
        otp
      };

      if (mode === 'register') {
        body.displayName = displayName;
        body.password = password;
        body.fingerprint = deviceFingerprint;
      }

      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: mode === 'login' ? "Login Successful" : "Registration Successful",
          description: `Welcome ${data.user.displayName}!`,
        });
        
        setLocation('/');
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Stable event handlers to prevent input focus loss
  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleDisplayNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  }, []);

  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleOtpChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
  }, []);

  const EmailStep = () => (
    <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }}>
      <PremiumCardContent className="space-y-6">
        <PremiumInput
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          required
          variant="glass"
        />
        
        {mode === 'register' && (
          <>
            <PremiumInput
              label="Display Name"
              type="text"
              placeholder="Enter your name"
              value={displayName}
              onChange={handleDisplayNameChange}
              required
              variant="glass"
            />
            <PremiumInput
              label="Password"
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={handlePasswordChange}
              required
              variant="glass"
            />
          </>
        )}

        <PrivacyFormNotice />

        <GradientButton
          type="submit"
          className="w-full shadow-glow"
          disabled={loading}
          size="lg"
          gradient="primary"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending Code...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Verification Code
            </div>
          )}
        </GradientButton>

        <div className="text-center text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{" "}
              <Link href="/otp-register" className="text-primary hover:underline font-medium">
                Register with OTP
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/otp-login" className="text-primary hover:underline font-medium">
                Login with OTP
              </Link>
            </>
          )}
        </div>
      </PremiumCardContent>
    </form>
  );

  const OTPStep = () => (
    <form onSubmit={(e) => { e.preventDefault(); verifyOTP(); }}>
      <PremiumCardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </AlertDescription>
        </Alert>

        <PremiumInput
          label="Verification Code"
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={handleOtpChange}
          required
          variant="glass"
          className="text-center text-2xl tracking-widest"
          maxLength={6}
        />

        <div className="flex items-center justify-between text-sm">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('email')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Change Email
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={sendOTP}
            disabled={countdown > 0 || loading}
            className="flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </Button>
        </div>

        <GradientButton
          type="submit"
          className="w-full shadow-glow"
          disabled={loading || otp.length !== 6}
          size="lg"
          gradient="primary"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Verifying...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verify & {mode === 'login' ? 'Login' : 'Register'}
            </div>
          )}
        </GradientButton>
      </PremiumCardContent>
    </form>
  );

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'Secure Login' : 'Secure Registration'} | Study Nova</title>
        <meta name="description" content={`${mode === 'login' ? 'Login' : 'Register'} securely with email verification. Privacy-first authentication.`} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <PremiumCard variant="glass" glow={true} className="shadow-premium-lg">
            <PremiumCardHeader className="space-y-6 text-center">
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <NovaLogo size="lg" />
              </motion.div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <PremiumCardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    {step === 'email' 
                      ? (mode === 'login' ? 'Secure Login' : 'Secure Registration')
                      : 'Verify Email'
                    }
                  </PremiumCardTitle>
                  <PrivacyTrustBadge size="sm" />
                </div>
                <PremiumCardDescription className="text-base">
                  {step === 'email' 
                    ? 'Enter your email for secure, password-free authentication'
                    : 'Enter the verification code sent to your email'
                  }
                </PremiumCardDescription>
              </div>
            </PremiumCardHeader>
            
            {step === 'email' ? <EmailStep /> : <OTPStep />}
          </PremiumCard>
          
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to traditional login
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
