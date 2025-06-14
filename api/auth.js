// Clean authentication system for LearnQuest
import { handleCors } from '../utils/cors.js';
import { initializeFirebase } from '../utils/firebase.js';
import { storage } from '../utils/storage.js';
import bcrypt from 'bcryptjs';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('Auth request received:', req.body);

      // Initialize Firebase
      try {
        initializeFirebase();
        console.log('Firebase initialized successfully');
      } catch (firebaseError) {
        console.error('Firebase initialization failed:', firebaseError.message);
        // Continue with hardcoded admin check for critical access
      }

      const { action, email, password, displayName, currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Determine action
      let authAction = action;
      if (!authAction) {
        if (req.url?.includes('/register') || req.url?.includes('register')) {
          authAction = 'register';
        } else {
          authAction = 'login';
        }
      }

      if (authAction === 'login') {
        if (!password) {
          return res.status(400).json({ message: 'Password is required' });
        }

        // Try Firebase authentication first
        try {
          const user = await storage.getUserByEmail(email);
          if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
              // Check if first login
              let isFirstLogin = false;
              try {
                const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                const lastLogin = user.lastLogin?.toDate ? user.lastLogin.toDate() : (user.lastLogin ? new Date(user.lastLogin) : null);
                const now = new Date();
                const timeSinceCreation = now.getTime() - createdAt.getTime();
                isFirstLogin = !lastLogin || timeSinceCreation < (5 * 60 * 1000); // 5 minutes
              } catch (dateError) {
                isFirstLogin = false;
              }

              // Update last login
              const updatedUser = await storage.updateUserLastLogin(user.id);

              // Return user data without password
              const { password: _, ...userWithoutPassword } = {
                ...updatedUser,
                isFirstLogin
              };

              console.log('Firebase login successful for:', email);
              return res.status(200).json({
                user: userWithoutPassword,
                isFirstLogin
              });
            }
          }
        } catch (firebaseError) {
          console.error('Firebase auth failed, trying hardcoded admin:', firebaseError.message);
        }

        // No hardcoded admin login - proper authentication required

        console.log('Invalid credentials for:', email);
        return res.status(401).json({ message: 'Invalid credentials' });

      } else if (authAction === 'register') {
        if (!password || !displayName) {
          return res.status(400).json({
            message: 'Password and display name are required'
          });
        }

        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(email);
          if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Check if user should be admin
          const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
          const isAdmin = adminEmails.includes(email);

          // Create new user
          const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            email,
            password: hashedPassword,
            displayName,
            isPro: false,
            className: '',
            board: '',
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date(),
            lastLogin: new Date(),
            updatedAt: new Date()
          };

          const savedUser = await storage.createUser(newUser);

          // Return user data without password
          const { password: _, ...userWithoutPassword } = {
            ...savedUser,
            isFirstLogin: true
          };

          console.log('Registration successful for:', email);
          return res.status(201).json({
            user: userWithoutPassword,
            isFirstLogin: true
          });

        } catch (registrationError) {
          console.error('Registration failed:', registrationError.message);
          return res.status(500).json({
            message: 'Registration failed. Please try again.'
          });
        }

      } else if (action === 'change-password') {
        // Handle password change
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ message: 'Authorization header required' });
        }

        const userId = authHeader.replace('Bearer ', '');
        if (!userId) {
          return res.status(401).json({ message: 'Invalid authorization token' });
        }

        if (!currentPassword || !newPassword) {
          return res.status(400).json({ message: 'Current password and new password are required' });
        }

        // Validate new password strength
        if (newPassword.length < 6) {
          return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        if (newPassword.length > 128) {
          return res.status(400).json({ message: 'New password must be less than 128 characters' });
        }

        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
          return res.status(400).json({
            message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
          });
        }

        try {
          const user = await storage.getUserById(userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Verify current password
          const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
          }

          // Check if new password is different from current password
          const isSamePassword = await bcrypt.compare(newPassword, user.password);
          if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
          }

          // Hash new password
          const hashedNewPassword = await bcrypt.hash(newPassword, 12);

          // Update password
          await storage.updateUserPassword(userId, hashedNewPassword);

          console.log(`✅ Password changed successfully for user: ${userId}`);
          return res.status(200).json({ message: 'Password changed successfully' });

        } catch (error) {
          console.error('Error changing password:', error);
          return res.status(500).json({ message: 'Failed to change password' });
        }

      } else if (action === 'delete-account') {
        // Handle account deletion
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ message: 'Authorization header required' });
        }

        const userId = authHeader.replace('Bearer ', '');
        if (!userId) {
          return res.status(401).json({ message: 'Invalid authorization token' });
        }

        try {
          const user = await storage.getUserById(userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Check if user is admin (prevent admin deletion)
          if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be deleted through this endpoint' });
          }

          // Delete user account and related data
          await storage.deleteUser(userId);

          console.log(`✅ Account deleted successfully for user: ${userId} (${user.email})`);
          return res.status(200).json({
            message: 'Account deleted successfully',
            deletedAt: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error deleting account:', error);
          return res.status(500).json({ message: 'Failed to delete account' });
        }

      } else {
        return res.status(400).json({
          message: 'Invalid action. Use "login", "register", "change-password", or "delete-account"'
        });
      }

    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({
        message: 'Authentication failed',
        error: error.message
      });
    }
  });
}
