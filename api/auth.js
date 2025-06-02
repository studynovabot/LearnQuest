// Clean authentication system for LearnQuest
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';
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

      const { action, email, password, displayName } = req.body;

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

        // Fallback hardcoded admin check
        if (email === 'thakurranveersingh505@gmail.com' && password === 'India#321') {
          const adminUser = {
            id: 'admin_user_001',
            email: 'thakurranveersingh505@gmail.com',
            displayName: 'Admin User',
            role: 'admin',
            isPro: true,
            className: '',
            board: '',
            createdAt: new Date(),
            lastLogin: new Date(),
            isFirstLogin: false
          };

          console.log('Hardcoded admin login successful');
          return res.status(200).json({
            user: adminUser,
            isFirstLogin: false,
            message: 'Login successful (hardcoded)'
          });
        }

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

      } else {
        return res.status(400).json({
          message: 'Invalid action. Use "login" or "register"'
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
