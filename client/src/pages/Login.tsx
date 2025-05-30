import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "@/components/ui/premium-card";
import { PremiumInput } from "@/components/ui/premium-form";
import { GradientButton } from "@/components/ui/premium-button";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { motion } from "framer-motion";
import NovaLogo from "@/components/ui/NovaLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // If user is already authenticated, redirect to main app
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to main app');
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setLocation("/");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Nova AI</title>
        <meta name="description" content="Log in to your Nova AI account to continue your learning journey." />
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
                <PremiumCardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Welcome Back
                </PremiumCardTitle>
                <PremiumCardDescription className="text-base">
                  Enter your credentials to access your Nova AI account
                </PremiumCardDescription>
              </div>
            </PremiumCardHeader>
            <form onSubmit={handleSubmit}>
              <PremiumCardContent className="space-y-6">
                <PremiumInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="glass"
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <PremiumInput
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    variant="glass"
                  />
                </div>

                <GradientButton
                  type="submit"
                  className="w-full shadow-glow"
                  disabled={loading}
                  size="lg"
                  gradient="primary"
                >
                  {loading ? "Logging in..." : "Login"}
                </GradientButton>

                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Register
                  </Link>
                </div>
              </PremiumCardContent>
            </form>
          </PremiumCard>
        </motion.div>
      </div>
    </>
  );
};

export default Login;