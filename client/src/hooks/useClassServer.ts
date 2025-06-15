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
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  server_id: string;
  is_premium: boolean;
  created_at: string;
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
  
  // Active selections
  const [activeServer, setActiveServer] = useState<ClassServer | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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
          description: 'Introduction to Physics',
          icon_url: null,
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-1',
        },
        {
          id: '2',
          class_name: 'Chemistry 101',
          description: 'Introduction to Chemistry',
          icon_url: null,
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-2',
        },
        {
          id: '3',
          class_name: 'Mathematics',
          description: 'Advanced Mathematics',
          icon_url: null,
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-3',
        },
        {
          id: '4',
          class_name: 'Biology',
          description: 'Introduction to Biology',
          icon_url: null,
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-4',
        },
        {
          id: '5',
          class_name: 'Computer Science',
          description: 'Programming and Algorithms',
          icon_url: null,
          created_at: new Date().toISOString(),
          teacher_id: 'teacher-5',
        },
      ];
      
      setServers(mockServers);
      
      // If there are servers, select the first one by default
      if (mockServers.length > 0 && !activeServer) {
        setActiveServer(mockServers[0]);
        fetchTopics(mockServers[0].id);
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
      const mockTopics: Topic[] = [
        {
          id: '1',
          name: 'general',
          description: 'General discussion',
          server_id: serverId,
          is_premium: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'homework-help',
          description: 'Get help with homework',
          server_id: serverId,
          is_premium: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'study-resources',
          description: 'Share study resources',
          server_id: serverId,
          is_premium: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'exam-prep',
          description: 'Prepare for exams',
          server_id: serverId,
          is_premium: true,
          created_at: new Date().toISOString(),
        },
      ];
      
      setTopics(mockTopics);
      
      // If there are topics, select the first one by default
      if (mockTopics.length > 0 && !activeTopic) {
        setActiveTopic(mockTopics[0]);
        fetchMessages(mockTopics[0].id);
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
          users: {
            id: 'teacher-1',
            displayName: 'Prof. Johnson',
            profilePic: null,
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
          users: {
            id: 'student-1',
            displayName: 'Arjun K.',
            profilePic: null,
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
            profilePic: null,
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
          users: {
            id: 'student-3',
            displayName: 'Rahul S.',
            profilePic: null,
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
          users: {
            id: 'student-4',
            displayName: 'Neha P.',
            profilePic: null,
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
          users: {
            id: 'teacher-1',
            displayName: 'Prof. Johnson',
            profilePic: null,
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
          users: {
            id: 'student-5',
            displayName: 'Vikram S.',
            profilePic: null,
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
          users: {
            id: user?.id || 'current-user',
            displayName: user?.displayName || 'You',
            profilePic: user?.profilePic || null,
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
          users: {
            id: 'ai-assistant',
            displayName: 'Nova AI',
            profilePic: null,
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

  // Select a server
  const selectServer = useCallback((server: ClassServer) => {
    setActiveServer(server);
    setActiveTopic(null);
    fetchTopics(server.id);
  }, [fetchTopics]);

  // Select a topic
  const selectTopic = useCallback((topic: Topic) => {
    setActiveTopic(topic);
    fetchMessages(topic.id);
  }, [fetchMessages]);

  // Send a message
  const sendMessage = useCallback(async (
    text: string,
    mediaUrl: string | null = null,
    mediaType: 'image' | 'pdf' | 'doc' | 'none' | null = null
  ) => {
    if (!user?.id || !activeTopic) return;
    
    try {
      setIsSendingMessage(true);
      
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
        users: {
          id: user.id,
          displayName: user.displayName,
          profilePic: user.profilePic || null,
          subscription_tier: user.subscription_tier || 'free',
        },
      };
      
      setMessages(prev => [...prev, newMessage]);
      
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
  }, [user, activeTopic, toast]);

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
    activeServer,
    activeTopic,
    isLoading,
    isLoadingMessages,
    isSendingMessage,
    selectServer,
    selectTopic,
    sendMessage,
  };
}