import { z } from "zod";

// Base schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  displayName: z.string(),
  xp: z.number().default(0),
  level: z.number().default(1),
  streak: z.number().default(0),
  lastLogin: z.date().nullable(),
  isPro: z.boolean().default(false),
  title: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  questionsCompleted: z.number().default(0),
  hoursStudied: z.number().default(0),
  className: z.string().default(''),
  board: z.string().default(''),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const subjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  progress: z.number().default(0),
  status: z.string().default("average")
});

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  description: z.string(),
  completed: z.boolean().default(false),
  xpReward: z.number(),
  priority: z.string().default("medium"),
  progress: z.number().nullable(),
  createdAt: z.date()
});

export const aiTutorSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string().nullable(),
  iconName: z.string().nullable(),
  color: z.string().nullable(),
  xpRequired: z.number().nullable()
});

export const userTutorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tutorId: z.string(),
  unlocked: z.boolean().default(false)
});

export const chatMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  content: z.string(),
  createdAt: z.date(),
  agentId: z.string().nullable(),
  xpAwarded: z.number().nullable()
});

export const storeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  price: z.number(),
  iconName: z.string(),
  gradient: z.record(z.string())
});

export const userItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  itemId: z.string(),
  purchasedAt: z.date()
});

// Insert schemas
export const insertUserSchema = userSchema.omit({
  id: true,
  xp: true,
  level: true,
  streak: true,
  lastLogin: true,
  title: true,
  avatarUrl: true,
  questionsCompleted: true,
  hoursStudied: true,
  createdAt: true,
  updatedAt: true
});

export const insertSubjectSchema = subjectSchema.omit({ id: true });
export const insertTaskSchema = taskSchema.omit({ id: true, completed: true, createdAt: true });
export const insertChatMessageSchema = chatMessageSchema.omit({ id: true, createdAt: true });
export const insertStoreItemSchema = storeItemSchema.omit({ id: true });
export const insertUserItemSchema = userItemSchema.omit({ id: true, purchasedAt: true });

// Educational Content Schemas
export const educationalContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['flash-notes', 'flow-charts', 'ncert-solutions', 'textbook-solutions']),
  board: z.string(), // CBSE, ICSE, etc.
  class: z.string(), // 6, 7, 8, 9, 10, 11, 12
  subject: z.string(),
  chapter: z.string().nullable(),
  content: z.any(), // JSON content structure
  originalFileName: z.string().nullable(),
  fileUrl: z.string().nullable(),
  extractedText: z.string().nullable(),
  status: z.enum(['draft', 'processing', 'published', 'archived']).default('draft'),
  uploadedBy: z.string(), // User ID
  verifiedBy: z.string().nullable(), // Admin ID who verified
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).nullable(),
  estimatedTime: z.number().nullable(), // in minutes
  views: z.number().default(0),
  likes: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable()
});

export const contentUploadSchema = z.object({
  id: z.string(),
  originalFileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  uploadPath: z.string(),
  downloadUrl: z.string(),
  type: z.enum(['flash-notes', 'flow-charts', 'ncert-solutions', 'textbook-solutions']),
  board: z.string(),
  class: z.string(),
  subject: z.string(),
  chapter: z.string().nullable(),
  status: z.enum(['uploaded', 'processing', 'processed', 'failed']).default('uploaded'),
  uploadedBy: z.string(),
  processingLog: z.array(z.string()).default([]),
  extractedContentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const contentSearchSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  searchableText: z.string(),
  keywords: z.array(z.string()),
  board: z.string(),
  class: z.string(),
  subject: z.string(),
  chapter: z.string().nullable(),
  type: z.string(),
  createdAt: z.date()
});

// Types
export type User = z.infer<typeof userSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type AITutor = z.infer<typeof aiTutorSchema>;
export type UserTutor = z.infer<typeof userTutorSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type StoreItem = z.infer<typeof storeItemSchema>;
export type UserItem = z.infer<typeof userItemSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertStoreItem = z.infer<typeof insertStoreItemSchema>;
export type InsertUserItem = z.infer<typeof insertUserItemSchema>;

// Educational Content Types
export type EducationalContent = z.infer<typeof educationalContentSchema>;
export type ContentUpload = z.infer<typeof contentUploadSchema>;
export type ContentSearch = z.infer<typeof contentSearchSchema>;

// Insert schemas for educational content
export const insertEducationalContentSchema = educationalContentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  views: true,
  likes: true
});

export const insertContentUploadSchema = contentUploadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContentSearchSchema = contentSearchSchema.omit({
  id: true,
  createdAt: true
});

export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;
export type InsertContentUpload = z.infer<typeof insertContentUploadSchema>;
export type InsertContentSearch = z.infer<typeof insertContentSearchSchema>;

// XP system types
export type QuestionRating = 'amazing' | 'decent' | 'needs_improvement' | 'incorrect';
