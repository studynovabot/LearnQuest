// Unified authentication system - Traditional + OTP with privacy protection
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';
import { generateOTP, sendOTPEmail, storeOTP, verifyOTPFromDB, cleanupExpiredOTPs } from './_utils/otp-service.js';
import { hashEmail, sanitizeUserData, getClientIP } from './_utils/privacy.js';
import { checkTrialEligibility, recordTrialStart } from './_utils/trial-abuse-prevention.js';
import bcrypt from 'bcryptjs';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('🔐 Auth API called:', req.method, req.url);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('🔄 Initializing Firebase...');
      // Initialize Firebase
      initializeFirebase();
      console.log('✅ Firebase initialized');

      const { action, email, password, displayName, isPro, otp, fingerprint } = req.body;
      console.log('📧 Auth request:', { action, email: email ? '***@***.***' : null, authMethod: otp ? 'OTP' : 'password' });

      // Clean up expired OTPs periodically
      if (Math.random() < 0.1) { // 10% chance
        cleanupExpiredOTPs().catch(console.error);
      }

      // Validate required fields based on auth method
      if (!email) {
        return res.status(400).json({
          message: 'Email is required',
          privacyCompliant: true
        });
      }

      // Determine action from URL or body - handle traditional, OTP, and register patterns
      let authAction = action;
      if (!authAction) {
        if (req.url?.includes('/register') || req.url?.includes('register')) {
          authAction = 'register';
        } else if (req.url?.includes('/login') || req.url?.includes('login')) {
          authAction = 'login';
        } else {
          authAction = 'login'; // default to login
        }
      }

      console.log('🎯 Determined action:', authAction);

      // Handle OTP-specific actions
      if (authAction === 'send-otp') {
        return await handleSendOTP(req, res, email, fingerprint);
      } else if (authAction === 'verify-login') {
        return await handleOTPLogin(req, res, email, otp);
      } else if (authAction === 'verify-register') {
        return await handleOTPRegister(req, res, email, otp, displayName, password, fingerprint);
      }

      if (authAction === 'login') {
        // Handle traditional password login
        if (!password) {
          return res.status(400).json({
            message: 'Password is required for traditional login',
            privacyCompliant: true
          });
        }

        console.log('🔍 Looking up user by email...');
        const user = await storage.getUserByEmail(email);

        if (!user) {
          console.log('❌ User not found');
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('✅ User found, verifying password...');
        // Compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          console.log('❌ Invalid password');
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('✅ Password valid, checking if first login...');

        // Check if this is the user's first login (within 5 minutes of account creation)
        let createdAt, lastLogin, isFirstLogin;

        try {
          // Handle different date formats from Firestore
          if (user.createdAt && user.createdAt.toDate) {
            // Firestore Timestamp
            createdAt = user.createdAt.toDate();
          } else if (user.createdAt) {
            // String or Date object
            createdAt = new Date(user.createdAt);
          } else {
            // Fallback to current time
            createdAt = new Date();
          }

          if (user.lastLogin && user.lastLogin.toDate) {
            // Firestore Timestamp
            lastLogin = user.lastLogin.toDate();
          } else if (user.lastLogin) {
            // String or Date object
            lastLogin = new Date(user.lastLogin);
          } else {
            lastLogin = null;
          }

          const now = new Date();
          const timeSinceCreation = now.getTime() - createdAt.getTime();
          isFirstLogin = !lastLogin || timeSinceCreation < (5 * 60 * 1000); // 5 minutes

          console.log('🕐 First login check:', {
            createdAt: createdAt.toISOString(),
            lastLogin: lastLogin?.toISOString(),
            timeSinceCreation: timeSinceCreation / 1000 / 60,
            isFirstLogin
          });
        } catch (dateError) {
          console.error('❌ Date parsing error:', dateError);
          // Fallback: assume it's not first login
          isFirstLogin = false;
        }

        // Update lastLogin timestamp
        const updatedUser = await storage.updateUserLastLogin(user.id);

        // Don't return the password and add first login flag
        const { password: _, ...userWithoutPassword } = {
          ...updatedUser,
          isFirstLogin
        };

        console.log('✅ Login successful for user:', userWithoutPassword.id, 'First login:', isFirstLogin);
        return res.status(200).json({
          user: userWithoutPassword,
          isFirstLogin
        });

      } else if (authAction === 'register') {
        // Handle traditional password registration
        if (!password || !displayName) {
          return res.status(400).json({
            message: 'Password and display name are required for registration',
            privacyCompliant: true
          });
        }

        console.log('🔍 Checking if user already exists...');
        const existingUser = await storage.getUserByEmail(email);

        if (existingUser) {
          console.log('❌ User already exists');
          return res.status(409).json({ message: 'User already exists with this email' });
        }

        console.log('🔐 Hashing password...');
        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('👤 Creating new user...');

        // Check if user should be admin
        const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
        const isAdmin = adminEmails.includes(email);

        // Create new user with privacy compliance
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          email,
          emailHash: hashEmail(email), // Store hashed email for privacy
          password: hashedPassword,
          displayName,
          isPro: isPro || false,
          className: '',
          board: '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          updatedAt: new Date(),
          // Privacy metadata
          privacyCompliant: true,
          authMethod: 'password',
          trialStarted: !isAdmin
        };

        console.log('💾 Saving user to storage...');
        const savedUser = await storage.createUser(newUser);

        // Don't return the password and mark as first login
        const { password: _, ...userWithoutPassword } = {
          ...savedUser,
          isFirstLogin: true
        };

        console.log('✅ Registration successful for user:', userWithoutPassword.id);
        return res.status(201).json({
          user: userWithoutPassword,
          isFirstLogin: true
        });

      } else {
        console.log('❌ Invalid action:', authAction);
        return res.status(400).json({
          message: 'Invalid action. Use "login", "register", "send-otp", "verify-login", or "verify-register"',
          privacyCompliant: true
        });
      }

    } catch (error) {
      console.error('❌ Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({
        message: errorMessage,
        privacyCompliant: true
      });
    }
  });
}

// OTP Handler Functions
async function handleSendOTP(req, res, email, fingerprint) {
  try {
    const { purpose = 'login' } = req.body;

    console.log('📤 Sending OTP for purpose:', purpose);

    // Check if this is for registration and validate trial eligibility
    if (purpose === 'register') {
      if (!fingerprint) {
        return res.status(400).json({
          message: 'Device verification required for registration',
          privacyCompliant: true
        });
      }

      const trialCheck = await checkTrialEligibility(email, fingerprint, req);

      if (!trialCheck.eligible) {
        return res.status(429).json({
          message: 'Free trial limit reached. Please contact support if you believe this is an error.',
          reason: trialCheck.reason,
          privacyCompliant: true
        });
      }
    }

    // Generate and send OTP
    const otpCode = generateOTP(6);

    // Store OTP in database
    const stored = await storeOTP(email, otpCode, purpose);
    if (!stored) {
      return res.status(500).json({
        message: 'Failed to generate verification code. Please try again.',
        privacyCompliant: true
      });
    }

    // Send OTP via email
    const sent = await sendOTPEmail(email, otpCode, purpose);
    if (!sent) {
      return res.status(500).json({
        message: 'Failed to send verification code. Please check your email address.',
        privacyCompliant: true
      });
    }

    console.log('✅ OTP sent successfully');
    return res.status(200).json({
      message: 'Verification code sent to your email',
      expiresIn: 600, // 10 minutes
      privacyCompliant: true
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return res.status(500).json({
      message: 'Failed to send verification code',
      privacyCompliant: true
    });
  }
}

async function handleOTPLogin(req, res, email, otp) {
  try {
    if (!otp) {
      return res.status(400).json({
        message: 'Verification code is required',
        privacyCompliant: true
      });
    }

    console.log('🔍 Verifying OTP for login...');

    // Verify OTP
    const verification = await verifyOTPFromDB(email, otp, 'login');
    if (!verification.success) {
      return res.status(400).json({
        message: verification.error,
        privacyCompliant: true
      });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: 'Account not found. Please register first.',
        privacyCompliant: true
      });
    }

    // Update last login
    const updatedUser = await storage.updateUserLastLogin(user.id);

    // Return sanitized user data
    const safeUserData = sanitizeUserData(updatedUser);

    console.log('✅ OTP login successful for user:', user.id);
    return res.status(200).json({
      user: safeUserData,
      isFirstLogin: false,
      authMethod: 'otp',
      privacyCompliant: true
    });

  } catch (error) {
    console.error('❌ OTP login error:', error);
    return res.status(500).json({
      message: 'Login failed. Please try again.',
      privacyCompliant: true
    });
  }
}

async function handleOTPRegister(req, res, email, otp, displayName, password, fingerprint) {
  try {
    if (!otp || !displayName || !password || !fingerprint) {
      return res.status(400).json({
        message: 'All fields are required for registration',
        privacyCompliant: true
      });
    }

    console.log('🔍 Verifying OTP for registration...');

    // Verify OTP
    const verification = await verifyOTPFromDB(email, otp, 'register');
    if (!verification.success) {
      return res.status(400).json({
        message: verification.error,
        privacyCompliant: true
      });
    }

    // Double-check trial eligibility
    const trialCheck = await checkTrialEligibility(email, fingerprint, req);
    if (!trialCheck.eligible) {
      return res.status(429).json({
        message: 'Registration not allowed. Trial limit reached.',
        privacyCompliant: true
      });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'Account already exists. Please login instead.',
        privacyCompliant: true
      });
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('👤 Creating new user...');

    // Check if user should be admin
    const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
    const isAdmin = adminEmails.includes(email);

    // Create new user with privacy-safe data
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      email,
      emailHash: hashEmail(email), // Store hashed email for privacy
      password: hashedPassword,
      displayName,
      isPro: false,
      className: '',
      board: '',
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date(),
      lastLogin: new Date(),
      updatedAt: new Date(),
      // Privacy metadata
      privacyCompliant: true,
      authMethod: 'otp',
      trialStarted: !isAdmin
    };

    console.log('💾 Saving user to storage...');
    const savedUser = await storage.createUser(newUser);

    // Record trial start for abuse prevention
    if (!isAdmin) {
      await recordTrialStart(email, fingerprint, req, savedUser.id);
    }

    // Return sanitized user data
    const safeUserData = sanitizeUserData(savedUser);

    console.log('✅ OTP registration successful for user:', savedUser.id);
    return res.status(201).json({
      user: safeUserData,
      isFirstLogin: true,
      authMethod: 'otp',
      privacyCompliant: true
    });

  } catch (error) {
    console.error('❌ OTP registration error:', error);
    return res.status(500).json({
      message: 'Registration failed. Please try again.',
      privacyCompliant: true
    });
  }
}
