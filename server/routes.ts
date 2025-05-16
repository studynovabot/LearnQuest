import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./index";
import * as z from "zod";
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertChatMessageSchema
} from "@shared/schema";
import { seedDatabase } from "./seed"; // Import seedDatabase from the appropriate module
import { getAIServiceForAgent } from './ai';
import multer from 'multer';
import { getStorage } from 'firebase-admin/storage';

// Validation helper function
function validateRequest<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
  // Always return a value to satisfy TypeScript
  throw new Error('Validation failed');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes (prefix with /api)
  const apiRouter = '/api';

  // Health check route to verify Firebase connectivity
  app.get(`${apiRouter}/health`, async (req: Request, res: Response) => {
    try {
      // Try to get tutors as a simple test of Firebase connectivity
      const tutors = await storage.getAllTutors();
      
      // If we get here, Firebase is connected
      res.status(200).json({ 
        status: 'ok', 
        firebase: 'connected',
        tutorsCount: tutors.length,
        message: 'Firebase connection is working properly'
      });
    } catch (error) {
      // If there's an error, Firebase is not connected properly
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      console.error('Firebase health check failed:', errorMessage);
      
      res.status(500).json({ 
        status: 'error', 
        firebase: 'disconnected',
        message: 'Firebase connection issue. Please ensure the Firestore API is enabled.', 
        error: errorMessage 
      });
    }
  });
  
  // Seed database route
  app.get(`${apiRouter}/seed`, async (req: Request, res: Response) => {
    try {
      await seedDatabase();
      res.status(200).json({ 
        status: 'ok', 
        message: 'Database seeded successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to seed database', 
        error: errorMessage 
      });
    }
  });

  // Auth routes
  app.post(`${apiRouter}/auth/register`, async (req: Request, res: Response) => {
    try {
      // Always set isPro to a boolean value (never undefined)
      const userData = validateRequest(insertUserSchema, {
        username: String(req.body.username ?? ''),
        password: String(req.body.password ?? ''),
        displayName: String(req.body.displayName ?? ''),
        isPro: Boolean(req.body.isPro) // Ensure isPro is always a boolean
      });
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({ ...userData, isPro: userData.isPro ?? false });
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post(`${apiRouter}/auth/login`, async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Compare password with bcrypt
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update login streak
      const lastLogin = await storage.getLastLoginDate(user.id);
      let streakUpdated = false;
      
      if (lastLogin) {
        const now = new Date();
        const lastDate = new Date(lastLogin);
        
        // Check if last login was yesterday or older but not more than 2 days ago
        const dayDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day, increment streak
          await storage.updateUserStreak(user.id, true);
          streakUpdated = true;
        } else if (dayDiff > 1) {
          // Streak broken
          await storage.updateUserStreak(user.id, false);
        }
      }
      
      // Add login XP reward
      const loginXP = user.isPro ? 30 : 15;
      const updatedUser = await storage.addUserXP(user.id, loginXP);
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({ 
        user: userWithoutPassword,
        loginReward: loginXP,
        streakUpdated
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // User routes
  app.get(`${apiRouter}/users/me`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      const rank = await storage.getUserRank(userId);
      res.status(200).json({ ...userWithoutPassword, rank });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Subject routes
  app.get(`${apiRouter}/subjects`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const subjects = await storage.getUserSubjects(userId);
      res.status(200).json(subjects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.patch(`${apiRouter}/subjects/:id`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const subjectId = req.params.id;
      const subjects = await storage.getUserSubjects(userId);
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      const updatedSubject = await storage.updateSubject(subjectId, req.body);
      res.status(200).json(updatedSubject);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Task routes
  app.get(`${apiRouter}/tasks`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const tasks = await storage.getUserTasks(userId);
      res.status(200).json(tasks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post(`${apiRouter}/tasks`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Always set priority to a string value (never undefined)
      const taskData = validateRequest(insertTaskSchema, {
        userId: userId,
        progress: req.body.progress ?? null,
        description: String(req.body.description ?? ''),
        xpReward: Number(req.body.xpReward ?? 0),
        priority: String(req.body.priority ?? 'medium')
      });
      const task = await storage.createTask({ ...taskData, priority: taskData.priority || 'medium' });
      res.status(201).json(task);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.patch(`${apiRouter}/tasks/:id`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const taskId = req.params.id;
      const tasks = await storage.getUserTasks(userId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const wasCompleted = task.completed;
      const updatedTask = await storage.updateTask(taskId, req.body);
      // If marking as completed and it was not completed before, award XP
      if (updatedTask && updatedTask.completed && !wasCompleted) {
        await storage.addUserXP(userId, updatedTask.xpReward);
      }
      res.status(200).json(updatedTask);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.delete(`${apiRouter}/tasks/:id`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const taskId = req.params.id;
      const tasks = await storage.getUserTasks(userId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // AI Tutor routes
  app.get(`${apiRouter}/tutors`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const tutors = await storage.getUserTutors(userId);
      res.status(200).json(tutors);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post(`${apiRouter}/tutors/:id/unlock`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const tutorId = req.params.id;
      
      const result = await storage.unlockTutor(userId, tutorId);
      
      if (!result) {
        return res.status(400).json({ message: "Failed to unlock tutor. You may not have enough XP." });
      }
      
      const tutors = await storage.getUserTutors(userId);
      res.status(200).json(tutors);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Chat routes
  app.get(`${apiRouter}/chat`, async (req: Request, res: Response) => {
    try {
      // Return an empty array since chat messages are no longer saved in the database
      res.status(200).json([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // --- AI Chat endpoint with agent selection ---
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { content, agentId } = req.body;
      if (!content) {
        return res.status(400).json({ message: "No content provided" });
      }

      // Get the agent from the database
      let agent;
      if (agentId) {
        const allTutors = await storage.getAllTutors();
        agent = allTutors.find(tutor => tutor.id === agentId);
      }

      // Get context for Personal AI Coach (agent ID 9)
      let context = '';
      if (agentId === '9') {
        try {
          const userId = req.user?.id;
          if (!userId) return res.status(401).json({ message: "Unauthorized" });
          // Get user's tasks
          const tasks = await storage.getUserTasks(userId);
          const incompleteTasks = tasks.filter(task => !task.completed);
          const completedTasks = tasks.filter(task => task.completed);
          // Get user's subjects
          const subjects = await storage.getUserSubjects(userId);
          
          // Create context string
          context = `
User has ${incompleteTasks.length} incomplete tasks and ${completedTasks.length} completed tasks.
Incomplete tasks: ${incompleteTasks.map(t => t.description).join(', ')}
Subject progress: ${subjects.map(s => `${s.name}: ${s.progress}% (${s.status})`).join(', ')}
          `.trim();
        } catch (error) {
          console.error('Error getting context for Personal AI Coach:', error);
        }
      }

      // Get the appropriate AI service for this agent
      const aiService = await getAIServiceForAgent(agent);
      
      // Generate a response using the AI service
      const { content: responseContent, xpAwarded } = await aiService.generateResponse(
        content,
        agentId ? parseInt(agentId, 10) : undefined,
        context
      );

      // Create a chat message with the response
      const assistantResponse = {
        id: `assistant-${Date.now()}`,
        content: responseContent,
        role: 'assistant',
        createdAt: new Date(),
        userId: 'system',
        agentId: agentId || '1',
        xpAwarded
      };

      res.status(200).json(assistantResponse);
    } catch (error) {
      // Enhanced error logging for Nova Chat
      console.error('Error in chat endpoint:', {
        error,
        requestBody: req.body,
        env: {
          GROQ_API_KEY: !!process.env.GROQ_API_KEY,
          TOGETHER_AI_API_KEY: !!process.env.TOGETHER_AI_API_KEY,
          GROQ_API_URL: process.env.GROQ_API_URL,
        }
      });
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage, details: error });
    }
  });

  // Store routes
  app.get(`${apiRouter}/store`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const items = await storage.getAllStoreItems();
      const userItems = await storage.getUserItems(userId);
      
      const itemsWithPurchaseStatus = items.map(item => ({
        ...item,
        unlocked: userItems.includes(item.id)
      }));
      
      res.status(200).json(itemsWithPurchaseStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post(`${apiRouter}/store/:id/purchase`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const itemId = req.params.id;
      
      const result = await storage.purchaseItem(userId, itemId);
      
      if (!result) {
        return res.status(400).json({ message: "Failed to purchase item. You may not have enough XP." });
      }
      
      const items = await storage.getAllStoreItems();
      const userItems = await storage.getUserItems(userId);
      
      const itemsWithPurchaseStatus = items.map(item => ({
        ...item,
        unlocked: userItems.includes(item.id)
      }));
      
      res.status(200).json(itemsWithPurchaseStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Leaderboard route
  app.get(`${apiRouter}/leaderboard`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await storage.getLeaderboard(limit);
      // Filter out demo users
      const filteredUsers = users.filter(user => user.displayName !== 'Demo User' && user.username !== 'Demo User');
      // Only return safe fields for leaderboard
      const leaderboard = filteredUsers.map(user => ({
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        rank: filteredUsers.indexOf(user) + 1
      }));
      res.status(200).json(leaderboard);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Motivational quote route
  app.get(`${apiRouter}/quote`, async (req: Request, res: Response) => {
    try {
      // Static list of educational quotes
      const quotes = [
        { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
        { quote: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
        { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
        { quote: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
        { quote: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
        { quote: "The only person who is educated is the one who has learned how to learn and change.", author: "Carl Rogers" },
        { quote: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
        { quote: "The function of education is to teach one to think intensively and to think critically.", author: "Martin Luther King Jr." },
        { quote: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" }
      ];
      
      // Return a random quote
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      res.status(200).json(randomQuote);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // XP Award route - for teacher or admin to award XP
  app.post(`${apiRouter}/xp/award`, async (req: Request, res: Response) => {
    try {
      const { username, amount, reason } = req.body;
      
      if (!username || !amount) {
        return res.status(400).json({ message: "Username and amount are required" });
      }
      
      const awardAmount = parseInt(amount);
      
      if (isNaN(awardAmount) || awardAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.addUserXP(user.id, awardAmount);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({ 
        success: true,
        user: userWithoutPassword,
        awarded: awardAmount,
        reason: reason || "XP awarded"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Answer rating route - to give XP based on answer quality
  app.post(`${apiRouter}/rating/answer`, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const { rating } = req.body;
      
      if (!rating) {
        return res.status(400).json({ message: "Rating is required" });
      }
      
      // Calculate XP based on rating
      let xpAwarded = 0;
      
      switch (rating) {
        case 'amazing':
          xpAwarded = 30;
          break;
        case 'decent':
          xpAwarded = 20;
          break;
        case 'needs_improvement':
          xpAwarded = 10;
          break;
        case 'incorrect':
          xpAwarded = 0;
          break;
        default:
          return res.status(400).json({ message: "Invalid rating" });
      }
      
      // Award XP if applicable
      let updatedUser = null;
      if (xpAwarded > 0) {
        updatedUser = await storage.addUserXP(userId, xpAwarded);
        // Don't return the password
        const { password, ...userWithoutPassword } = updatedUser;
        updatedUser = userWithoutPassword;
      }
      
      res.status(200).json({ 
        success: true, 
        rating, 
        xpAwarded,
        user: updatedUser
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // --- Tutors endpoint ---
  app.get('/api/tutors', async (req: Request, res: Response) => {
    try {
      const tutors = await storage.getAllTutors();
      res.json(tutors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tutors' });
    }
  });

  // --- Store endpoint ---
  app.get('/api/store', async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllStoreItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch store items' });
    }
  });

  // --- Profile endpoints ---
  app.get('/api/profile', async (req: Request, res: Response) => {
    try {
      // TODO: Replace with real authentication logic
      const userId = req.query.userId || req.body.userId || req.headers['x-user-id'] || 'userId';
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      // Only return safe fields
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });
  app.patch('/api/profile', async (req: Request, res: Response) => {
    try {
      // TODO: Replace with real authentication logic
      const userId = req.query.userId || req.body.userId || req.headers['x-user-id'] || 'userId';
      const { displayName, className, subjects, avatarUrl } = req.body;
      const updateData: any = {};
      if (displayName) updateData.displayName = displayName;
      if (className) updateData.className = className;
      if (subjects) updateData.subjects = subjects;
      if (avatarUrl) updateData.avatarUrl = avatarUrl;
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Multer setup for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // Profile picture upload endpoint
  app.post('/api/profile/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
    try {
      // TODO: Replace with real authentication logic
      const userId = req.query.userId || req.body.userId || req.headers['x-user-id'] || 'userId';
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const file = req.file;
      const ext = file.originalname.split('.').pop();
      const fileName = `avatars/${userId}_${Date.now()}.${ext}`;
      const bucket = getStorage().bucket();
      const fileRef = bucket.file(fileName);
      await fileRef.save(file.buffer, {
        contentType: file.mimetype,
        public: true,
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      // Make the file public
      await fileRef.makePublic();
      const publicUrl = fileRef.publicUrl();
      // Update user's avatarUrl
      await storage.updateUser(userId, { avatarUrl: publicUrl });
      res.json({ avatarUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
