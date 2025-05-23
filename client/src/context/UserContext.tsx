import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { config } from "@/config";

// Define the context type
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, displayName: string, password: string) => Promise<boolean>;
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
            console.log('Found old mock user, clearing and creating new demo user...');
            localStorage.removeItem('user');
            await createDemoUser();
          } else {
            setUser(parsedUser);
            console.log('User loaded from localStorage:', parsedUser);
          }
        } else {
          // Always try to create/login demo user if no user is stored
          console.log('No stored user found, creating demo user...');
          await createDemoUser();
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Create a fallback user if everything fails
        await createFallbackUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Create a demo user for development
  const createDemoUser = async () => {
    console.log('🔄 Starting demo user creation process...');

    try {
      // Use the existing test user that we know works
      const testUser = {
        id: 'user_1747991020366_4atbkfx',
        username: 'testuser',
        displayName: 'Test User',
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

      setUser(testUser);
      localStorage.setItem('user', JSON.stringify(testUser));
      console.log('✅ Using existing test user:', testUser);
    } catch (error) {
      console.error('💥 Demo user creation failed, using fallback:', error);
      await createFallbackUser();
    }
  };

  // Create a fallback user if backend is not available
  const createFallbackUser = async () => {
    console.log('🆘 Creating fallback user (backend unavailable)...');
    const fallbackUser: User = {
      id: `fallback-user-${Date.now()}`,
      username: "demo_user_fallback",
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
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
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
  const register = async (username: string, displayName: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, displayName, password, isPro: false }),
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
