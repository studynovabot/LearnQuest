import { z } from "zod";

// Base schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailHash: z.string().optional(), // Hashed email for privacy
  password: z.string(),
  displayName: z.string(),
  lastLogin: z.date().nullable(),
  isPro: z.boolean().default(false),
  className: z.string().default(''),
  board: z.string().default(''),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Privacy fields
  privacyCompliant: z.boolean().default(true),
  authMethod: z.enum(['password', 'otp']).default('password'),
  trialStarted: z.boolean().default(false),
  // Class Server & Goat Nitro fields
  xp: z.number().default(0),
  streak: z.number().default(0),
  lastStreakDate: z.date().nullable(),
  profilePic: z.string().nullable(),
  subscription_tier: z.enum(['free', 'pro', 'goat']).default('free')
});

export const subjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  progress: z.number().default(0),
  status: z.string().default("average")
});

export const aiTutorSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string().nullable(),
  iconName: z.string().nullable(),
  color: z.string().nullable()
});

// Class Server Schemas
export const classServerSchema = z.object({
  id: z.string(),
  class_name: z.string(),
  description: z.string(),
  icon_url: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date()
});

export const topicSchema = z.object({
  id: z.string(),
  server_id: z.string(),
  name: z.string(),
  description: z.string(),
  is_premium: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date()
});

export const serverMessageSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  topic_id: z.string(),
  text: z.string(),
  media_url: z.string().nullable(),
  media_type: z.enum(['image', 'pdf', 'doc', 'none']).default('none'),
  timestamp: z.date(),
  is_ai: z.boolean().default(false)
});

export const goatPerksSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  badge_style: z.string().nullable(),
  access_flags: z.array(z.string()).default([]),
  customizations: z.record(z.string()).default({}),
  created_at: z.date(),
  updated_at: z.date()
});

export const xpEventSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  amount: z.number(),
  reason: z.string(),
  timestamp: z.date()
});

// Privacy-related schemas
export const trialRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emailHash: z.string(),
  fingerprintHash: z.string(),
  ipHash: z.string(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  lastActivity: z.date(),
  endedAt: z.date().optional(),
  privacyCompliant: z.boolean().default(true),
  dataMinimized: z.boolean().default(true),
  autoDeleteAt: z.date()
});

export const otpVerificationSchema = z.object({
  id: z.string(),
  emailHash: z.string(),
  otpHash: z.string(),
  purpose: z.enum(['login', 'register', 'verification']),
  createdAt: z.date(),
  expiresAt: z.date(),
  attempts: z.number().default(0),
  verified: z.boolean().default(false),
  verifiedAt: z.date().optional()
});

export const deletionLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emailHash: z.string(),
  deletedAt: z.date(),
  recordsDeleted: z.number(),
  reason: z.string(),
  privacyCompliant: z.boolean().default(true),
  gdprCompliant: z.boolean().default(true)
});

export const chatMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  content: z.string(),
  createdAt: z.date(),
  agentId: z.string().nullable()
});

// Insert schemas
export const insertUserSchema = userSchema.omit({
  id: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true
});

export const insertSubjectSchema = subjectSchema.omit({ id: true });
export const insertChatMessageSchema = chatMessageSchema.omit({ id: true, createdAt: true });

// Insert schemas for Class Server
export const insertClassServerSchema = classServerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertTopicSchema = topicSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertServerMessageSchema = serverMessageSchema.omit({
  id: true,
  timestamp: true
});

export const insertGoatPerksSchema = goatPerksSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertXpEventSchema = xpEventSchema.omit({
  id: true,
  timestamp: true
});

// Educational Content Schemas
export const educationalContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['flow-charts', 'ncert-solutions', 'textbook-solutions']),
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
  type: z.enum(['flow-charts', 'ncert-solutions', 'textbook-solutions']),
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
export type AITutor = z.infer<typeof aiTutorSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Class Server Types
export type ClassServer = z.infer<typeof classServerSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type GoatPerks = z.infer<typeof goatPerksSchema>;
export type XpEvent = z.infer<typeof xpEventSchema>;

export type InsertClassServer = z.infer<typeof insertClassServerSchema>;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type InsertServerMessage = z.infer<typeof insertServerMessageSchema>;
export type InsertGoatPerks = z.infer<typeof insertGoatPerksSchema>;
export type InsertXpEvent = z.infer<typeof insertXpEventSchema>;

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

export const contentTypeSchema = z.object({
  type: z.enum(['flow-charts', 'ncert-solutions', 'textbook-solutions']),
  // ... existing code ...
});

export const contentRequestSchema = z.object({
  type: z.enum(['flow-charts', 'ncert-solutions', 'textbook-solutions']),
  // ... existing code ...
});
