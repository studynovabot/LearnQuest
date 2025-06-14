import { useUserContext } from "@/context/UserContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isAdmin as checkIsAdmin } from "@/lib/adminConfig";

export function useAuth() {
  const { user, loading, login, register, logout, refreshUser } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Check if current user is admin
  const isAdmin = user ? (checkIsAdmin(user.email) || user.role === 'admin') : false;

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
    isAdmin,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser
  };
}