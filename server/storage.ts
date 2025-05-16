import { 
  type User, type InsertUser,
  type Subject, type InsertSubject,
  type Task, type InsertTask,
  type AITutor,
  type UserTutor,
  type ChatMessage, type InsertChatMessage,
  type StoreItem, type InsertStoreItem,
  type UserItem, type InsertUserItem
} from "@shared/schema";

// Extend the storage interface with all the necessary CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  // Subject operations
  getUserSubjects(userId: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, data: Partial<Subject>): Promise<Subject | undefined>;
  
  // Task operations
  getUserTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<void>;
  
  // AI Tutor operations
  createTutor(tutor: AITutor): Promise<AITutor>;
  getAllTutors(): Promise<AITutor[]>;
  getUserTutors(userId: string): Promise<(AITutor & { unlocked: boolean })[]>;
  unlockTutor(userId: string, tutorId: string): Promise<boolean>;
  
  // Chat operations
  getUserChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Store operations
  getAllStoreItems(): Promise<StoreItem[]>;
  getUserItems(userId: string): Promise<string[]>; // Array of itemIds
  purchaseItem(userId: string, itemId: string): Promise<boolean>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Streak operations
  updateUserStreak(userId: string, increment: boolean): Promise<number>;
  getLastLoginDate(userId: string): Promise<Date | undefined>;
  
  // XP operations
  addUserXP(userId: string, amount: number): Promise<User>;
  getUserRank(userId: string): Promise<number>;

  // Delete old chat messages, keeping only the most recent N
  deleteOldChatMessages(userId: string, keep?: number): Promise<number>;
}
