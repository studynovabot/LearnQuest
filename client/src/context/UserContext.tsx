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
          try {
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
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // Temporarily disable auto-login to isolate null errors
          // if (import.meta.env.DEV) {
          //   console.log('Development mode - attempting auto-login...');
          //   try {
          //     await createDeveloperUser();
          //   } catch (devError) {
          //     console.error('Developer auto-login failed:', devError);
          //     setUser(null);
          //   }
          // } else {
            // No auto-login - user must register/login manually
            console.log('No auto-login - user must login manually');
            setUser(null);
          // }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth().catch((error) => {
      console.error('checkAuth promise rejection:', error);
      setLoading(false);
    });
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
      console.log('🔄 Starting login process...');

      const requestBody = { action: 'login', email, password };
      console.log('📤 Login request:', { email });

      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).catch((fetchError) => {
        console.error('Login fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      });

      console.log('📥 Login response status:', response.status);

      if (response.ok) {
        const data = await response.json().catch((jsonError) => {
          console.error('Login response JSON parse error:', jsonError);
          throw new Error('Invalid response format');
        });
        console.log('✅ Login successful:', data);

        // Store the user data from the response with first login flag
        const userWithFirstLogin = {
          ...(data.user || data),
          isFirstLogin: data.isFirstLogin || false
        };

        setUser(userWithFirstLogin);
        localStorage.setItem('user', JSON.stringify(userWithFirstLogin));

        return true;
      } else {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        console.error('❌ Login failed:', errorMessage);
        return false;
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, displayName: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Starting registration process...');

      const requestBody = { action: 'register', email, displayName, password, isPro: false };
      console.log('📤 Registration request:', { email, displayName, isPro: false });

      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).catch((fetchError) => {
        console.error('Register fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      });

      console.log('📥 Registration response status:', response.status);

      if (response.ok) {
        const userData = await response.json().catch((jsonError) => {
          console.error('Register response JSON parse error:', jsonError);
          throw new Error('Invalid response format');
        });
        console.log('✅ Registration successful:', userData);

        // Store the user data from the response with first login flag
        const userWithFirstLogin = {
          ...(userData.user || userData),
          isFirstLogin: userData.isFirstLogin || true // Registration is always first login
        };

        setUser(userWithFirstLogin);
        localStorage.setItem('user', JSON.stringify(userWithFirstLogin));

        return true;
      } else {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        console.error('❌ Registration failed:', errorMessage);
        return false;
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
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
        try {
          setUser(JSON.parse(storedUser));
        } catch (parseError) {
          console.error('Failed to parse stored user data in refresh:', parseError);
          localStorage.removeItem('user');
          setUser(null);
        }
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
