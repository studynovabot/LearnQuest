import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Types for class server data
export interface ClassServer {
  id: string;
  class_name: string;
  description: string;
  icon_url: string | null;
  created_at: string;
  teacher_id: string | null;
  member_count?: number;
  banner_url?: string | null;
  categories?: ServerCategory[];
}

export interface ServerCategory {
  id: string;
  name: string;
  topics: Topic[];
}

export interface ServerMember {
  id: string;
  user_id: string;
  server_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  nickname?: string | null;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  user: {
    id: string;
    displayName: string;
    profilePic: string | null;
    subscription_tier: string;
  };
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  server_id: string;
  is_premium: boolean;
  created_at: string;
  category_id?: string;
  type?: 'text' | 'voice' | 'announcement';
  unread_count?: number;
  last_message_at?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export interface Message {
  id: string;
  text: string;
  user_id: string;
  topic_id: string;
  timestamp: string;
  media_url: string | null;
  media_type: 'image' | 'pdf' | 'doc' | 'none' | null;
  is_ai: boolean;
  edited?: boolean;
  edited_at?: string;
  pinned?: boolean;
  reactions?: Reaction[];
  mentions?: string[]; // user IDs mentioned
  reply_to?: string | null; // ID of message being replied to
  users: {
    id: string;
    displayName: string;
    profilePic: string | null;
    subscription_tier: string;
  } | null;
}

export function useClassServer() {
  const { user } = useUserContext();
  const { toast } = useToast();
  
  // State for servers, topics, and messages
  const [servers, setServers] = useState<ClassServer[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [categories, setCategories] = useState<ServerCategory[]>([]);
  
  // Active selections
  const [activeServer, setActiveServer] = useState<ClassServer | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServerCategory | null>(null);
  
  // UI states
  const [showMembersList, setShowMembersList] = useState(true);
  const [isTyping, setIsTyping] = useState<{[userId: string]: boolean}>({});
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fetch all servers the user has access to
  const fetchServers = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, you would fetch from Supabase
      // For now, we'll use mock data
      const mockServers: ClassServer[] = [
        {
          id: '1',
          class_name: 'Physics 101',
          description: 'Introduction to Physics and its applications',
          icon_url: 'https://ui-avatars.com/api/?name=Physics&background=5865F2&color=fff',
          banner_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa',
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-1',
          member_count: 156,
        },
        {
          id: '2',
          class_name: 'Chemistry 101',
          description: 'Introduction to Chemistry and lab experiments',
          icon_url: 'https://ui-avatars.com/api/?name=Chemistry&background=57F287&color=fff',
          banner_url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6',
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-2',
          member_count: 124,
        },
        {
          id: '3',
          class_name: 'Mathematics',
          description: 'Advanced Mathematics for competitive exams',
          icon_url: 'https://ui-avatars.com/api/?name=Math&background=FEE75C&color=000',
          banner_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-3',
          member_count: 210,
        },
        {
          id: '4',
          class_name: 'Biology',
          description: 'Introduction to Biology and life sciences',
          icon_url: 'https://ui-avatars.com/api/?name=Bio&background=EB459E&color=fff',
          banner_url: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe',
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-4',
          member_count: 98,
        },
        {
          id: '5',
          class_name: 'Computer Science',
          description: 'Programming, Algorithms and Data Structures',
          icon_url: 'https://ui-avatars.com/api/?name=CS&background=ED4245&color=fff',
          banner_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-5',
          member_count: 178,
        },
        {
          id: '6',
          class_name: 'Study Group',
          description: 'General study group for all subjects',
          icon_url: 'https://ui-avatars.com/api/?name=SG&background=9B59B6&color=fff',
          banner_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
          created_at: new Date().toISOString(),
          teacher_id: null,
          member_count: 342,
        },
      ];
      
      setServers(mockServers);
      
      // If there are servers, select the first one by default
      if (mockServers.length > 0 && !activeServer) {
        setActiveServer(mockServers[0]);
        fetchTopics(mockServers[0].id);
        fetchMembers(mockServers[0].id);
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load class servers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeServer, toast]);

  // Fetch topics for a server
  const fetchTopics = useCallback(async (serverId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, you would fetch from Supabase
      // For now, we'll use mock data
      const mockCategories: ServerCategory[] = [
        {
          id: 'cat-1',
          name: 'INFORMATION',
          topics: [
            {
              id: '1',
              name: 'announcements',
              description: 'Important announcements from teachers',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-1',
              type: 'announcement',
              unread_count: 2,
            },
            {
              id: '2',
              name: 'rules',
              description: 'Server rules and guidelines',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-1',
              type: 'text',
            },
          ],
        },
        {
          id: 'cat-2',
          name: 'TEXT CHANNELS',
          topics: [
            {
              id: '3',
              name: 'general',
              description: 'General discussion',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-2',
              type: 'text',
              unread_count: 5,
            },
            {
              id: '4',
              name: 'homework-help',
              description: 'Get help with homework',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-2',
              type: 'text',
            },
            {
              id: '5',
              name: 'study-resources',
              description: 'Share study resources',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-2',
              type: 'text',
            },
          ],
        },
        {
          id: 'cat-3',
          name: 'VOICE CHANNELS',
          topics: [
            {
              id: '6',
              name: 'study-hall',
              description: 'Voice channel for group study',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-3',
              type: 'voice',
            },
            {
              id: '7',
              name: 'teacher-office',
              description: 'Office hours with teachers',
              server_id: serverId,
              is_premium: false,
              created_at: new Date().toISOString(),
              category_id: 'cat-3',
              type: 'voice',
            },
          ],
        },
        {
          id: 'cat-4',
          name: 'PREMIUM CHANNELS',
          topics: [
            {
              id: '8',
              name: 'topper-club',
              description: 'Exclusive channel for top students',
              server_id: serverId,
              is_premium: true,
              created_at: new Date().toISOString(),
              category_id: 'cat-4',
              type: 'text',
            },
            {
              id: '9',
              name: 'ai-god-mode',
              description: 'Advanced AI assistance',
              server_id: serverId,
              is_premium: true,
              created_at: new Date().toISOString(),
              category_id: 'cat-4',
              type: 'text',
            },
            {
              id: '10',
              name: 'exam-prep',
              description: 'Prepare for exams',
              server_id: serverId,
              is_premium: true,
              created_at: new Date().toISOString(),
              category_id: 'cat-4',
              type: 'text',
            },
          ],
        },
      ];
      
      // Flatten topics for backward compatibility
      const allTopics = mockCategories.flatMap(category => category.topics);
      
      setCategories(mockCategories);
      setTopics(allTopics);
      
      // If there are topics, select the first one by default
      if (allTopics.length > 0 && !activeTopic) {
        const defaultTopic = allTopics.find(t => t.name === 'general') || allTopics[0];
        setActiveTopic(defaultTopic);
        setActiveCategory(mockCategories.find(c => c.id === defaultTopic.category_id) || null);
        fetchMessages(defaultTopic.id);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load topics.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTopic, toast]);

  // Fetch messages for a topic
  const fetchMessages = useCallback(async (topicId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMessages(true);
      
      // In a real implementation, you would fetch from Supabase
      // For now, we'll use mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Welcome to the class server! This is a place to discuss topics related to the class.',
          user_id: 'teacher-1',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          media_url: null,
          media_type: null,
          is_ai: false,
          pinned: true,
          reactions: [
            { emoji: '👍', count: 15, users: ['student-1', 'student-2', 'student-3'] },
            { emoji: '🎉', count: 8, users: ['student-4', 'student-5'] },
          ],
          users: {
            id: 'teacher-1',
            displayName: 'Prof. Johnson',
            profilePic: 'https://ui-avatars.com/api/?name=Prof+Johnson&background=5865F2&color=fff',
            subscription_tier: 'goat',
          },
        },
        {
          id: '2',
          text: 'Hi everyone! I\'m excited to learn with you all.',
          user_id: 'student-1',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          media_url: null,
          media_type: null,
          is_ai: false,
          reactions: [
            { emoji: '👋', count: 12, users: ['teacher-1', 'student-2', 'student-3'] },
          ],
          users: {
            id: 'student-1',
            displayName: 'Arjun K.',
            profilePic: 'https://ui-avatars.com/api/?name=Arjun+K&background=57F287&color=fff',
            subscription_tier: 'goat',
          },
        },
        {
          id: '3',
          text: 'Does anyone have the notes from yesterday\'s lecture?',
          user_id: 'student-2',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          media_url: null,
          media_type: null,
          is_ai: false,
          users: {
            id: 'student-2',
            displayName: 'Priya M.',
            profilePic: 'https://ui-avatars.com/api/?name=Priya+M&background=FEE75C&color=000',
            subscription_tier: 'free',
          },
        },
        {
          id: '4',
          text: 'I\'ll share my notes with everyone. Here they are!',
          user_id: 'student-3',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
          media_url: 'https://example.com/notes.pdf',
          media_type: 'pdf',
          is_ai: false,
          reactions: [
            { emoji: '🙏', count: 8, users: ['student-2', 'student-4', 'student-5'] },
            { emoji: '⭐', count: 5, users: ['teacher-1', 'student-1'] },
          ],
          users: {
            id: 'student-3',
            displayName: 'Rahul S.',
            profilePic: 'https://ui-avatars.com/api/?name=Rahul+S&background=EB459E&color=fff',
            subscription_tier: 'pro',
          },
        },
        {
          id: '5',
          text: 'Thank you for sharing! This will be very helpful for the upcoming exam.',
          user_id: 'student-4',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
          media_url: null,
          media_type: null,
          is_ai: false,
          reply_to: '4',
          users: {
            id: 'student-4',
            displayName: 'Neha P.',
            profilePic: 'https://ui-avatars.com/api/?name=Neha+P&background=ED4245&color=fff',
            subscription_tier: 'free',
          },
        },
        {
          id: '6',
          text: 'Remember everyone, the exam will cover chapters 1-5. Make sure to review all the material.',
          user_id: 'teacher-1',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          media_url: null,
          media_type: null,
          is_ai: false,
          pinned: true,
          reactions: [
            { emoji: '👍', count: 10, users: ['student-1', 'student-2', 'student-3'] },
            { emoji: '📝', count: 7, users: ['student-4', 'student-5'] },
          ],
          users: {
            id: 'teacher-1',
            displayName: 'Prof. Johnson',
            profilePic: 'https://ui-avatars.com/api/?name=Prof+Johnson&background=5865F2&color=fff',
            subscription_tier: 'goat',
          },
        },
        {
          id: '7',
          text: 'I\'m having trouble understanding the concept of quantum entanglement. Can someone explain it?',
          user_id: 'student-5',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          media_url: null,
          media_type: null,
          is_ai: false,
          mentions: ['teacher-1'],
          users: {
            id: 'student-5',
            displayName: 'Vikram S.',
            profilePic: 'https://ui-avatars.com/api/?name=Vikram+S&background=9B59B6&color=fff',
            subscription_tier: 'free',
          },
        },
        {
          id: '8',
          text: '/askai What is quantum entanglement and how does it work?',
          user_id: user?.id || 'current-user',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          media_url: null,
          media_type: null,
          is_ai: false,
          reply_to: '7',
          users: {
            id: user?.id || 'current-user',
            displayName: user?.displayName || 'You',
            profilePic: user?.profilePic || 'https://ui-avatars.com/api/?name=You&background=5865F2&color=fff',
            subscription_tier: user?.subscription_tier || 'free',
          },
        },
        {
          id: '9',
          text: 'Quantum entanglement is a phenomenon in quantum physics where two or more particles become correlated in such a way that the quantum state of each particle cannot be described independently of the others, regardless of the distance separating them. When particles are entangled, whatever happens to one particle can instantly affect the other, even if they are separated by vast distances. This phenomenon was famously described by Einstein as "spooky action at a distance." It\'s a fundamental concept in quantum computing and quantum information theory, as it allows for potentially instantaneous communication and secure encryption methods.',
          user_id: 'ai-assistant',
          topic_id: topicId,
          timestamp: new Date(Date.now() - 890000).toISOString(), // 14 minutes 50 seconds ago
          media_url: null,
          media_type: null,
          is_ai: true,
          reactions: [
            { emoji: '🤖', count: 3, users: ['student-1', 'student-5'] },
            { emoji: '🧠', count: 2, users: ['teacher-1'] },
          ],
          users: {
            id: 'ai-assistant',
            displayName: 'Nova AI',
            profilePic: 'https://ui-avatars.com/api/?name=AI&background=5865F2&color=fff',
            subscription_tier: 'goat',
          },
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, toast]);

  // Fetch members for a server
  const fetchMembers = useCallback(async (serverId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMembers(true);
      
      // In a real implementation, you would fetch from Supabase
      // For now, we'll use mock data
      const mockMembers: ServerMember[] = [
        {
          id: 'member-1',
          user_id: 'teacher-1',
          server_id: serverId,
          role: 'owner',
          joined_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
          status: 'online',
          user: {
            id: 'teacher-1',
            displayName: 'Prof. Johnson',
            profilePic: 'https://ui-avatars.com/api/?name=Prof+Johnson&background=5865F2&color=fff',
            subscription_tier: 'goat',
          },
        },
        {
          id: 'member-2',
          user_id: 'student-1',
          server_id: serverId,
          role: 'moderator',
          joined_at: new Date(Date.now() - 86400000 * 25).toISOString(), // 25 days ago
          status: 'online',
          user: {
            id: 'student-1',
            displayName: 'Arjun K.',
            profilePic: 'https://ui-avatars.com/api/?name=Arjun+K&background=57F287&color=fff',
            subscription_tier: 'goat',
          },
        },
        {
          id: 'member-3',
          user_id: 'student-2',
          server_id: serverId,
          role: 'member',
          joined_at: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago
          status: 'idle',
          user: {
            id: 'student-2',
            displayName: 'Priya M.',
            profilePic: 'https://ui-avatars.com/api/?name=Priya+M&background=FEE75C&color=000',
            subscription_tier: 'free',
          },
        },
        {
          id: 'member-4',
          user_id: 'student-3',
          server_id: serverId,
          role: 'member',
          joined_at: new Date(Date.now() - 86400000 * 18).toISOString(), // 18 days ago
          status: 'online',
          user: {
            id: 'student-3',
            displayName: 'Rahul S.',
            profilePic: 'https://ui-avatars.com/api/?name=Rahul+S&background=EB459E&color=fff',
            subscription_tier: 'pro',
          },
        },
        {
          id: 'member-5',
          user_id: 'student-4',
          server_id: serverId,
          role: 'member',
          joined_at: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
          status: 'offline',
          user: {
            id: 'student-4',
            displayName: 'Neha P.',
            profilePic: 'https://ui-avatars.com/api/?name=Neha+P&background=ED4245&color=fff',
            subscription_tier: 'free',
          },
        },
        {
          id: 'member-6',
          user_id: 'student-5',
          server_id: serverId,
          role: 'member',
          joined_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
          status: 'dnd',
          user: {
            id: 'student-5',
            displayName: 'Vikram S.',
            profilePic: 'https://ui-avatars.com/api/?name=Vikram+S&background=9B59B6&color=fff',
            subscription_tier: 'free',
          },
        },
        {
          id: 'member-7',
          user_id: user?.id || 'current-user',
          server_id: serverId,
          role: 'member',
          joined_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          status: 'online',
          user: {
            id: user?.id || 'current-user',
            displayName: user?.displayName || 'You',
            profilePic: user?.profilePic || 'https://ui-avatars.com/api/?name=You&background=5865F2&color=fff',
            subscription_tier: user?.subscription_tier || 'free',
          },
        },
      ];
      
      setMembers(mockMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load server members.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMembers(false);
    }
  }, [user, toast]);

  // Select a server
  const selectServer = useCallback((server: ClassServer) => {
    setActiveServer(server);
    setActiveTopic(null);
    setActiveCategory(null);
    fetchTopics(server.id);
    fetchMembers(server.id);
  }, [fetchTopics, fetchMembers]);

  // Select a topic
  const selectTopic = useCallback((topic: Topic) => {
    setActiveTopic(topic);
    setActiveCategory(categories.find(c => c.id === topic.category_id) || null);
    fetchMessages(topic.id);
  }, [fetchMessages, categories]);

  // Send a message
  const sendMessage = useCallback(async (
    text: string,
    mediaUrl: string | null = null,
    mediaType: 'image' | 'pdf' | 'doc' | 'none' | null = null
  ) => {
    if (!user?.id || !activeTopic) return;
    
    try {
      setIsSendingMessage(true);
      
      // Extract mentions from text (format: @username)
      const mentionRegex = /@(\w+)/g;
      const mentionMatches = [...text.matchAll(mentionRegex)];
      const mentions = mentionMatches.map(match => {
        const username = match[1];
        const member = members.find(m => 
          m.user.displayName.toLowerCase().replace(/\s+/g, '') === username.toLowerCase()
        );
        return member?.user_id || null;
      }).filter(Boolean) as string[];
      
      // In a real implementation, you would send to Supabase
      // For now, we'll just add to the local state
      const newMessage: Message = {
        id: `new-${Date.now()}`,
        text,
        user_id: user.id,
        topic_id: activeTopic.id,
        timestamp: new Date().toISOString(),
        media_url: mediaUrl,
        media_type: mediaType,
        is_ai: false,
        mentions: mentions.length > 0 ? mentions : undefined,
        reply_to: replyingTo ? replyingTo.id : undefined,
        users: {
          id: user.id,
          displayName: user.displayName,
          profilePic: user.profilePic || 'https://ui-avatars.com/api/?name=You&background=5865F2&color=fff',
          subscription_tier: user.subscription_tier || 'free',
        },
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Reset reply state
      if (replyingTo) {
        setReplyingTo(null);
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingMessage(false);
    }
  }, [user, activeTopic, members, replyingTo, toast]);

  // Add reaction to a message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!user?.id) return;
    
    setMessages(prev => {
      return prev.map(message => {
        if (message.id === messageId) {
          // If message already has reactions
          if (message.reactions) {
            // Check if this emoji already exists
            const existingReaction = message.reactions.find(r => r.emoji === emoji);
            
            if (existingReaction) {
              // Check if user already reacted
              if (existingReaction.users.includes(user.id)) {
                // Remove user's reaction
                return {
                  ...message,
                  reactions: message.reactions.map(r => 
                    r.emoji === emoji 
                      ? { 
                          ...r, 
                          count: r.count - 1,
                          users: r.users.filter(id => id !== user.id)
                        }
                      : r
                  ).filter(r => r.count > 0) // Remove reactions with 0 count
                };
              } else {
                // Add user's reaction to existing emoji
                return {
                  ...message,
                  reactions: message.reactions.map(r => 
                    r.emoji === emoji 
                      ? { 
                          ...r, 
                          count: r.count + 1,
                          users: [...r.users, user.id]
                        }
                      : r
                  )
                };
              }
            } else {
              // Add new emoji reaction
              return {
                ...message,
                reactions: [
                  ...message.reactions,
                  { emoji, count: 1, users: [user.id] }
                ]
              };
            }
          } else {
            // First reaction for this message
            return {
              ...message,
              reactions: [{ emoji, count: 1, users: [user.id] }]
            };
          }
        }
        return message;
      });
    });
  }, [user]);

  // Set typing indicator
  const setTypingIndicator = useCallback((isTyping: boolean) => {
    if (!user?.id || !activeTopic) return;
    
    // In a real implementation, you would use a real-time database
    // For now, we'll just update the local state
    setIsTyping(prev => ({
      ...prev,
      [user.id]: isTyping
    }));
    
    // Auto-clear typing indicator after 5 seconds
    if (isTyping) {
      setTimeout(() => {
        setIsTyping(prev => ({
          ...prev,
          [user.id]: false
        }));
      }, 5000);
    }
  }, [user, activeTopic]);

  // Set reply to message
  const setReply = useCallback((message: Message | null) => {
    setReplyingTo(message);
  }, []);

  // Toggle members list visibility
  const toggleMembersList = useCallback(() => {
    setShowMembersList(prev => !prev);
  }, []);

  // Initial data loading
  useEffect(() => {
    if (user?.id) {
      fetchServers();
    }
  }, [user, fetchServers]);

  return {
    servers,
    topics,
    messages,
    members,
    categories,
    activeServer,
    activeTopic,
    activeCategory,
    isLoading,
    isLoadingMessages,
    isLoadingMembers,
    isSendingMessage,
    isTyping,
    showMembersList,
    replyingTo,
    selectServer,
    selectTopic,
    sendMessage,
    addReaction,
    setTypingIndicator,
    setReply,
    toggleMembersList,
  };
}