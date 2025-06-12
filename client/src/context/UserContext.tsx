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
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user authenticated:', firebaseUser.email);
          
          // Convert Firebase user to app User
          const { signInWithEmail, convertFirebaseUserToUser } = await import('@/utils/firebase');
          const userData = await convertFirebaseUserToUser(firebaseUser);
          
          // Special case for admin users
          if (userData.email === 'thakurranveersingh505@gmail.com' || userData.email === 'tradingproffical@gmail.com') {
            userData.role = 'admin';
          }
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User loaded from Firebase auth:', userData);
        } else {
          console.log('No Firebase user found, checking localStorage...');
          
          // Try to get user from localStorage as fallback
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              
              // Check if this is a mock user
              if (parsedUser.id === 'user-123' || parsedUser.id.startsWith('demo-user') || 
                  parsedUser.id.startsWith('mock-') || parsedUser.id.startsWith('fallback-') ||
                  parsedUser.id === 'admin_user_001') {
                console.log('Found mock user, clearing...');
                localStorage.removeItem('user');
                setUser(null);
                
                // Try to auto-login with the provided credentials
                if (import.meta.env.DEV) {
                  console.log('Development mode - attempting auto-login with provided credentials');
                  login('thakurranveersingh505@gmail.com', 'India#321')
                    .then(success => {
                      if (success) {
                        console.log('Auto-login successful');
                      } else {
                        console.log('Auto-login failed');
                      }
                    })
                    .catch(error => {
                      console.error('Auto-login error:', error);
                    });
                }
              } else {
                // Use the stored user data
                setUser(parsedUser);
                console.log('User loaded from localStorage:', parsedUser);
              }
            } catch (parseError) {
              console.error('Failed to parse stored user data:', parseError);
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            // No user found
            setUser(null);
            
            // Try to auto-login with the provided credentials in development mode
            if (import.meta.env.DEV) {
              console.log('Development mode - attempting auto-login with provided credentials');
              login('thakurranveersingh505@gmail.com', 'India#321')
                .then(success => {
                  if (success) {
                    console.log('Auto-login successful');
                  } else {
                    console.log('Auto-login failed');
                  }
                })
                .catch(error => {
                  console.error('Auto-login error:', error);
                });
            }
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Create developer user for local development only
  const createDeveloperUser = async () => {
    console.log('🔄 Development mode - attempting auto-login with Firebase...');

    try {
      // Try to login with the provided credentials first
      console.log('🔄 Attempting login with developer credentials...');
      const loginSuccess = await login('thakurranveersingh505@gmail.com', 'India#321');

      if (loginSuccess) {
        console.log('✅ Logged in with developer credentials');
        return;
      } else {
        console.log('⚠️ Login failed, attempting to register developer account...');
        // Try to register the account
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
      subscriptionPlan: 'free',
      subscriptionStatus: 'trial',
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      role: 'user', // Adding required role
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
      console.log('🔄 Starting login process with Firebase...');
      console.log('📤 Login request:', { email });

      // Use Firebase authentication
      const userData = await signInWithEmail(email, password);
      console.log('✅ Login successful:', userData);

      // Store the user data
      const userWithFirstLogin = {
        ...userData,
        isFirstLogin: false
      };

      setUser(userWithFirstLogin);
      localStorage.setItem('user', JSON.stringify(userWithFirstLogin));

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
      console.log('🔄 Starting registration process with Firebase...');
      console.log('📤 Registration request:', { 
        email, 
        displayName, 
        isPro: false, 
        subscriptionPlan: 'free',
        subscriptionStatus: 'trial',
        role: 'user'
      });

      // Use Firebase authentication
      const userData = await registerWithEmail(email, displayName, password);
      console.log('✅ Registration successful:', userData);

      // Store the user data with first login flag
      const userWithFirstLogin = {
        ...userData,
        isFirstLogin: true // Registration is always first login
      };

      setUser(userWithFirstLogin);
      localStorage.setItem('user', JSON.stringify(userWithFirstLogin));

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
      await signOutUser();
      setUser(null);
      localStorage.removeItem('user');
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
        const response = await fetch(`${config.apiUrl}/user-profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`,
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
