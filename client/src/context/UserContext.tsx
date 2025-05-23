import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { config } from "@/config";

// Define the context type
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, displayName: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Check if this is an old mock user that needs to be replaced
          if (parsedUser.id === 'user-123' || parsedUser.id.startsWith('demo-user') || parsedUser.id.startsWith('mock-') || parsedUser.id.startsWith('fallback-')) {
            console.log('Found old mock user, clearing...');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            setUser(parsedUser);
            console.log('User loaded from localStorage:', parsedUser);
          }
        } else {
          // In development, try to auto-login with your credentials
          if (import.meta.env.DEV) {
            console.log('Development mode - attempting auto-login...');
            await createDeveloperUser();
          } else {
            // In production, no auto-login - user must register/login manually
            console.log('Production mode - user must login manually');
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Create developer user for local development only
  const createDeveloperUser = async () => {
    console.log('🔄 Development mode - attempting auto-login...');

    try {
      // Try to login with your credentials first
      console.log('🔄 Attempting login with developer credentials...');
      const loginSuccess = await login('thakurranveersingh505@gmail.com', 'India#321');

      if (loginSuccess) {
        console.log('✅ Logged in with developer credentials');
        return;
      } else {
        console.log('⚠️ Login failed, attempting to register developer account...');
        // Try to register your account
        const registerSuccess = await register('thakurranveersingh505@gmail.com', 'Ranveer Singh', 'India#321');
        if (registerSuccess) {
          console.log('✅ Developer account registered successfully');
          return;
        }
      }

      throw new Error('Could not login or register developer account');
    } catch (error) {
      console.error('💥 Developer auto-login failed:', error);
      console.log('🔄 You will need to login manually');
      setUser(null);
    }
  };

  // Create a fallback user if backend is not available
  const createFallbackUser = async () => {
    console.log('🆘 Creating fallback user (backend unavailable)...');
    const fallbackUser: User = {
      id: `fallback-user-${Date.now()}`,
      email: "demo@example.com",
      displayName: "Demo User (Offline)",
      xp: 0,
      level: 1,
      streak: 0,
      title: undefined,
      avatarUrl: undefined,
      questionsCompleted: 0,
      hoursStudied: 0,
      isPro: false,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setUser(fallbackUser);
    localStorage.setItem('user', JSON.stringify(fallbackUser));
    console.log('🔧 Fallback user created:', fallbackUser);
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User logged in successfully:', userData);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, displayName: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, displayName, password, isPro: false }),
      });

      if (response.ok) {
        const userData = await response.json();

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User registered successfully:', userData);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      setLoading(true);
      // Mock refresh - replace with actual API call
      // const response = await api.get('/auth/me');

      // For now, just use the stored user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, log the user out
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Create the context value object
  const contextValue: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
