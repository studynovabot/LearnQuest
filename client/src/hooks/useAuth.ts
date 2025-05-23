import { useUserContext } from "@/context/UserContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { user, loading, login, register, logout, refreshUser } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    if (isSubmitting) return false;

    try {
      setIsSubmitting(true);
      return await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (email: string, displayName: string, password: string) => {
    if (isSubmitting) return false;

    try {
      setIsSubmitting(true);
      return await register(email, displayName, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return {
    user,
    loading: loading || isSubmitting,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser
  };
}