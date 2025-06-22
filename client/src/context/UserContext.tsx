import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { config } from "@/config";
import { signInWithEmail, registerWithEmail, signOutUser, auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Define the context type
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, displayName: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for stored authentication...');
        
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Validate token is still valid by making a test API call
            const response = await fetch(`${config.apiUrl}/user-management?action=profile`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
                'X-User-ID': parsedUser.id
              }
            });
            
            if (response.ok) {
              // Token is valid, restore user session
              setUser(parsedUser);
              console.log('✅ User session restored from token:', parsedUser.email);
            } else {
              // Token is invalid or expired
              console.log('❌ Stored token is invalid, clearing session');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
            }
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          console.log('📭 No stored user or token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // No developer auto-login functionality

  // No fallback user functionality - proper authentication required

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Starting login process with API...');
      console.log('📤 Login request:', { email });

      // Use API authentication with JWT
      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', data);

      // Store the user data and JWT token
      const userWithFirstLogin = {
        ...data.user,
        isFirstLogin: data.isFirstLogin || false
      };

      setUser(userWithFirstLogin);
      localStorage.setItem('user', JSON.stringify(userWithFirstLogin));
      localStorage.setItem('token', data.token); // Store JWT token

      return true;
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
      console.log('🔄 Starting registration process with API...');
      console.log('📤 Registration request:', { 
        email, 
        displayName, 
        isPro: false, 
        subscriptionPlan: 'free',
        subscriptionStatus: 'trial',
        role: 'user'
      });

      // Use API authentication with JWT
      const response = await fetch(`${config.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          email,
          displayName,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('✅ Registration successful:', data);

      // Store the user data and JWT token
      const userWithFirstLogin = {
        ...data.user,
        isFirstLogin: data.isFirstLogin || true // Registration is always first login
      };

      setUser(userWithFirstLogin);
      localStorage.setItem('user', JSON.stringify(userWithFirstLogin));
      localStorage.setItem('token', data.token); // Store JWT token

      return true;
    } catch (error) {
      console.error("❌ Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Remove JWT token
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing user data...');
      
      // Get the current user ID
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error('No user found in localStorage during refresh');
        return;
      }
      
      let userId: string;
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.id;
        if (!userId) {
          throw new Error('No user ID found in stored user data');
        }
      } catch (parseError) {
        console.error('Failed to parse stored user data in refresh:', parseError);
        localStorage.removeItem('user');
        setUser(null);
        return;
      }
      
      // Fetch the latest user profile from the server
      try {
        console.log(`Fetching user profile for ID: ${userId}`);
        const storedToken = localStorage.getItem('token');
        const response = await fetch(`${config.apiUrl}/user-management?action=profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
            'X-User-ID': userId
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
        }
        
        // Parse the response
        const userData = await response.json();
        console.log('✅ User profile fetched successfully:', userData);
        
        // Update the stored user with the new data
        const parsedStoredUser = JSON.parse(storedUser);
        const updatedUser = {
          ...parsedStoredUser, // Keep existing fields
          ...userData, // Update with new profile data
          // Explicitly preserve these important fields if they exist in the stored user
          role: parsedStoredUser.role || userData.role || 'user',
          isPro: parsedStoredUser.isPro !== undefined ? parsedStoredUser.isPro : (userData.isPro || false),
          subscriptionPlan: parsedStoredUser.subscriptionPlan || userData.subscriptionPlan || 'free',
          subscriptionStatus: parsedStoredUser.subscriptionStatus || userData.subscriptionStatus || 'trial',
          subscriptionExpiry: parsedStoredUser.subscriptionExpiry || userData.subscriptionExpiry,
          updatedAt: new Date() // Update the timestamp
        };
        
        // Log the before and after state for debugging
        console.log('Before update - stored user:', parsedStoredUser);
        console.log('Server data:', userData);
        console.log('After update - merged user:', updatedUser);
        
        // Update localStorage and state
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ User data refreshed successfully');
      } catch (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        
        // If we can't fetch the profile, at least update the UI with the stored user
        try {
          setUser(JSON.parse(storedUser));
          console.log('⚠️ Using stored user data as fallback');
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails completely, log the user out
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Create the context value object
  const contextValue: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
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
