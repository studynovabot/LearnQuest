import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the User type
interface User {
  id: string;
  username: string;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  title?: string | null;
  avatarUrl?: string | null;
  questionsCompleted: number;
  hoursStudied: number;
  maxLevel?: number;
  // Add other user properties as needed
}

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
        // Try to get user from localStorage or a token
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Mock login - replace with actual API call
      // const response = await api.post('/auth/login', { username, password });
      
      // Simulate successful login
      const mockUser: User = {
        id: "user-123",
        username,
        displayName: username,
        xp: 0,
        level: 1,
        streak: 0,
        title: null,
        avatarUrl: null,
        questionsCompleted: 0,
        hoursStudied: 0,
        maxLevel: 100,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
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
      // Mock registration - replace with actual API call
      // const response = await api.post('/auth/register', { username, displayName, password });
      
      // Simulate successful registration
      const mockUser: User = {
        id: "user-" + Date.now(),
        username,
        displayName,
        xp: 0,
        level: 1,
        streak: 0,
        title: null,
        avatarUrl: null,
        questionsCompleted: 0,
        hoursStudied: 0,
        maxLevel: 100,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
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
