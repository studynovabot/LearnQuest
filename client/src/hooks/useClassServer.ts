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

  // Function declarations to avoid circular dependencies
  const fetchMessages = useCallback(async (topicId: string) => {}, []);
  const fetchMembers = useCallback(async (serverId: string) => {}, []);
  const fetchTopics = useCallback(async (serverId: string) => {}, []);
  
  // Set up real implementations after declarations to avoid circular dependencies
  useEffect(() => {
    // Set up fetchTopics implementation
    Object.assign(fetchTopics, fetchTopicsImpl);
    
    // Set up fetchMessages implementation
    Object.assign(fetchMessages, fetchMessagesImpl);
    
    // Set up fetchMembers implementation
    Object.assign(fetchMembers, fetchMembersImpl);
  }, []);

  // Fetch all servers the user has access to
  const fetchServers = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch servers from Supabase
      const { data: userServers, error: userServersError } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', user.id);
      
      if (userServersError) throw userServersError;
      
      if (userServers && userServers.length > 0) {
        const serverIds = userServers.map(us => us.server_id);
        
        const { data: serversData, error: serversError } = await supabase
          .from('class_servers')
          .select('*, server_members(count)')
          .in('id', serverIds);
        
        if (serversError) throw serversError;
        
        if (serversData && serversData.length > 0) {
          const formattedServers: ClassServer[] = serversData.map(server => ({
            id: server.id,
            class_name: server.class_name,
            description: server.description,
            icon_url: server.icon_url,
            banner_url: server.banner_url,
            created_at: server.created_at,
            teacher_id: server.teacher_id,
            member_count: server.server_members ? server.server_members.length : 0
          }));
          
          setServers(formattedServers);
          
          // If there are servers, select the first one by default
          if (formattedServers.length > 0 && !activeServer) {
            setActiveServer(formattedServers[0]);
            fetchTopics(formattedServers[0].id);
            fetchMembers(formattedServers[0].id);
          }
        } else {
          setServers([]);
        }
      } else {
        setServers([]);
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
  }, [user, activeServer, toast, fetchTopics, fetchMembers]);

  // Fetch topics for a server
  const fetchTopicsImpl = useCallback(async (serverId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch categories from Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('server_categories')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      if (categoriesData && categoriesData.length > 0) {
        // Fetch topics for each category
        const categoriesWithTopics: ServerCategory[] = [];
        
        for (const category of categoriesData) {
          const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select('*')
            .eq('category_id', category.id)
            .eq('server_id', serverId)
            .not('type', 'eq', 'voice') // Exclude voice channels
            .order('position', { ascending: true });
          
          if (topicsError) throw topicsError;
          
          if (topicsData && topicsData.length > 0) {
            categoriesWithTopics.push({
              id: category.id,
              name: category.name,
              topics: topicsData.map(topic => ({
                id: topic.id,
                name: topic.name,
                description: topic.description,
                server_id: topic.server_id,
                is_premium: topic.is_premium,
                created_at: topic.created_at,
                category_id: topic.category_id,
                type: topic.type === 'voice' ? 'text' : topic.type, // Convert any voice channels to text
                unread_count: topic.unread_count || 0
              }))
            });
          } else {
            // Include empty categories too
            categoriesWithTopics.push({
              id: category.id,
              name: category.name,
              topics: []
            });
          }
        }
        
        // Flatten topics for backward compatibility
        const allTopics = categoriesWithTopics.flatMap(category => category.topics);
        
        setCategories(categoriesWithTopics);
        setTopics(allTopics);
        
        // If there are topics, select the first one by default
        if (allTopics.length > 0 && !activeTopic) {
          const defaultTopic = allTopics.find(t => t.name === 'general') || allTopics[0];
          setActiveTopic(defaultTopic);
          setActiveCategory(categoriesWithTopics.find(c => c.id === defaultTopic.category_id) || null);
          fetchMessages(defaultTopic.id);
        }
      } else {
        // No categories found, create default ones
        const { data: newCategory, error: newCategoryError } = await supabase
          .from('server_categories')
          .insert([
            { 
              name: 'TEXT CHANNELS', 
              server_id: serverId,
              position: 0
            }
          ])
          .select()
          .single();
        
        if (newCategoryError) throw newCategoryError;
        
        if (newCategory) {
          // Create a default general channel
          const { data: newTopic, error: newTopicError } = await supabase
            .from('topics')
            .insert([
              {
                name: 'general',
                description: 'General discussion',
                server_id: serverId,
                is_premium: false,
                category_id: newCategory.id,
                type: 'text',
                position: 0
              }
            ])
            .select()
            .single();
          
          if (newTopicError) throw newTopicError;
          
          if (newTopic) {
            const category: ServerCategory = {
              id: newCategory.id,
              name: newCategory.name,
              topics: [{
                id: newTopic.id,
                name: newTopic.name,
                description: newTopic.description,
                server_id: newTopic.server_id,
                is_premium: newTopic.is_premium,
                created_at: newTopic.created_at,
                category_id: newTopic.category_id,
                type: newTopic.type,
                unread_count: 0
              }]
            };
            
            setCategories([category]);
            setTopics(category.topics);
            setActiveTopic(category.topics[0]);
            setActiveCategory(category);
            fetchMessages(category.topics[0].id);
          }
        }
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


  // Fetch messages for a topic implementation
  const fetchMessagesImpl = useCallback(async (topicId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMessages(true);
      
      // Fetch messages from Supabase with user data
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          users:user_id (
            id,
            display_name,
            profile_pic,
            subscription_tier
          ),
          reactions (
            emoji,
            user_id
          )
        `)
        .eq('topic_id', topicId)
        .order('timestamp', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      if (messagesData && messagesData.length > 0) {
        // Format messages with proper structure
        const formattedMessages: Message[] = messagesData.map(message => {
          // Process reactions to get counts and user lists
          const reactionGroups: {[key: string]: {emoji: string, count: number, users: string[]}} = {};
          
          if (message.reactions && message.reactions.length > 0) {
            message.reactions.forEach((reaction: {emoji: string, user_id: string}) => {
              if (!reactionGroups[reaction.emoji]) {
                reactionGroups[reaction.emoji] = {
                  emoji: reaction.emoji,
                  count: 0,
                  users: []
                };
              }
              
              reactionGroups[reaction.emoji].count += 1;
              reactionGroups[reaction.emoji].users.push(reaction.user_id);
            });
          }
          
          return {
            id: message.id,
            text: message.text,
            user_id: message.user_id,
            topic_id: message.topic_id,
            timestamp: message.timestamp,
            media_url: message.media_url,
            media_type: message.media_type,
            is_ai: message.is_ai || false,
            edited: message.edited || false,
            edited_at: message.edited_at,
            pinned: message.pinned || false,
            reactions: Object.values(reactionGroups),
            mentions: message.mentions,
            reply_to: message.reply_to,
            users: message.users ? {
              id: message.users.id,
              displayName: message.users.display_name,
              profilePic: message.users.profile_pic,
              subscription_tier: message.users.subscription_tier || 'free'
            } : null
          };
        });
        
        setMessages(formattedMessages);
      } else {
        // If no messages, check if this is a new topic and add a welcome message
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('created_at')
          .eq('id', topicId)
          .single();
        
        if (topicError) throw topicError;
        
        if (topicData) {
          const createdAt = new Date(topicData.created_at);
          const now = new Date();
          const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
          
          // If topic was created less than 5 minutes ago, add a welcome message
          if (diffInMinutes < 5) {
            const welcomeMessage = {
              text: 'Welcome to this channel! This is the beginning of the conversation.',
              user_id: user.id,
              topic_id: topicId,
              is_ai: false
            };
            
            const { data: newMessage, error: newMessageError } = await supabase
              .from('messages')
              .insert([welcomeMessage])
              .select(`
                *,
                users:user_id (
                  id,
                  display_name,
                  profile_pic,
                  subscription_tier
                )
              `)
              .single();
            
            if (newMessageError) throw newMessageError;
            
            if (newMessage) {
              setMessages([{
                id: newMessage.id,
                text: newMessage.text,
                user_id: newMessage.user_id,
                topic_id: newMessage.topic_id,
                timestamp: newMessage.timestamp,
                media_url: newMessage.media_url,
                media_type: newMessage.media_type,
                is_ai: newMessage.is_ai || false,
                users: newMessage.users ? {
                  id: newMessage.users.id,
                  displayName: newMessage.users.display_name,
                  profilePic: newMessage.users.profile_pic,
                  subscription_tier: newMessage.users.subscription_tier || 'free'
                } : null
              }]);
            } else {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      }
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
  const fetchMembersImpl = useCallback(async (serverId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMembers(true);
      
      // Fetch members from Supabase with user data
      const { data: membersData, error: membersError } = await supabase
        .from('server_members')
        .select(`
          *,
          users:user_id (
            id,
            display_name,
            profile_pic,
            subscription_tier,
            last_seen
          )
        `)
        .eq('server_id', serverId)
        .order('role', { ascending: true });
      
      if (membersError) throw membersError;
      
      if (membersData && membersData.length > 0) {
        // Format members with proper structure
        const formattedMembers: ServerMember[] = membersData.map(member => {
          // Determine online status based on last_seen
          let status: 'online' | 'idle' | 'dnd' | 'offline' = 'offline';
          
          if (member.users && member.users.last_seen) {
            const lastSeen = new Date(member.users.last_seen);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
            
            if (diffInMinutes < 5) {
              status = 'online';
            } else if (diffInMinutes < 30) {
              status = 'idle';
            }
          }
          
          // If this is the current user, always show as online
          if (member.user_id === user.id) {
            status = 'online';
          }
          
          return {
            id: member.id,
            user_id: member.user_id,
            server_id: member.server_id,
            role: member.role as 'owner' | 'admin' | 'moderator' | 'member',
            joined_at: member.joined_at,
            nickname: member.nickname,
            status,
            user: member.users ? {
              id: member.users.id,
              displayName: member.users.display_name,
              profilePic: member.users.profile_pic,
              subscription_tier: member.users.subscription_tier || 'free'
            } : {
              id: member.user_id,
              displayName: 'Unknown User',
              profilePic: null,
              subscription_tier: 'free'
            }
          };
        });
        
        setMembers(formattedMembers);
      } else {
        // If no members found, this is unusual but handle it gracefully
        // At minimum, the current user should be a member
        const { data: newMember, error: newMemberError } = await supabase
          .from('server_members')
          .insert([
            {
              user_id: user.id,
              server_id: serverId,
              role: 'owner',
              joined_at: new Date().toISOString()
            }
          ])
          .select(`
            *,
            users:user_id (
              id,
              display_name,
              profile_pic,
              subscription_tier
            )
          `)
          .single();
        
        if (newMemberError) throw newMemberError;
        
        if (newMember) {
          setMembers([{
            id: newMember.id,
            user_id: newMember.user_id,
            server_id: newMember.server_id,
            role: newMember.role as 'owner' | 'admin' | 'moderator' | 'member',
            joined_at: newMember.joined_at,
            nickname: newMember.nickname,
            status: 'online',
            user: newMember.users ? {
              id: newMember.users.id,
              displayName: newMember.users.display_name,
              profilePic: newMember.users.profile_pic,
              subscription_tier: newMember.users.subscription_tier || 'free'
            } : {
              id: user.id,
              displayName: user.displayName,
              profilePic: user.profilePic,
              subscription_tier: user.subscription_tier || 'free'
            }
          }]);
        } else {
          setMembers([]);
        }
      }
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
  }, []);

  // Select a topic
  const selectTopic = useCallback((topic: Topic) => {
    setActiveTopic(topic);
    setActiveCategory(categories.find(c => c.id === topic.category_id) || null);
    fetchMessages(topic.id);
  }, [categories]);

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
      let match;
      const mentionMatches = [];
      while ((match = mentionRegex.exec(text)) !== null) {
        mentionMatches.push(match);
      }
      
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

  // Create a new server
  const createServer = useCallback(async (serverName: string, description: string) => {
    if (!user?.id) return null;
    
    try {
      // Create the server
      const { data: newServer, error: serverError } = await supabase
        .from('class_servers')
        .insert([
          {
            class_name: serverName,
            description: description,
            teacher_id: user.id,
            icon_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(serverName)}&background=5865F2&color=fff`,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (serverError) throw serverError;
      
      if (newServer) {
        // Add the current user as a member and owner
        const { data: newMember, error: memberError } = await supabase
          .from('server_members')
          .insert([
            {
              user_id: user.id,
              server_id: newServer.id,
              role: 'owner',
              joined_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
        
        if (memberError) throw memberError;
        
        // Create default category
        const { data: newCategory, error: categoryError } = await supabase
          .from('server_categories')
          .insert([
            {
              name: 'TEXT CHANNELS',
              server_id: newServer.id,
              position: 0
            }
          ])
          .select()
          .single();
        
        if (categoryError) throw categoryError;
        
        if (newCategory) {
          // Create default general channel
          const { data: newTopic, error: topicError } = await supabase
            .from('topics')
            .insert([
              {
                name: 'general',
                description: 'General discussion',
                server_id: newServer.id,
                is_premium: false,
                category_id: newCategory.id,
                type: 'text',
                position: 0
              }
            ])
            .select()
            .single();
          
          if (topicError) throw topicError;
        }
        
        // Refresh the server list
        await fetchServers();
        
        // Return the new server
        return {
          id: newServer.id,
          class_name: newServer.class_name,
          description: newServer.description,
          icon_url: newServer.icon_url,
          created_at: newServer.created_at,
          teacher_id: newServer.teacher_id,
          member_count: 1
        } as ClassServer;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating server:', error);
      toast({
        title: 'Error',
        description: 'Failed to create server.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, fetchServers, toast]);

  // Create a new topic/channel
  const createTopic = useCallback(async (
    name: string, 
    description: string, 
    categoryId: string, 
    isPremium: boolean = false
  ) => {
    if (!user?.id || !activeServer) return null;
    
    try {
      // Create the topic
      const { data: newTopic, error: topicError } = await supabase
        .from('topics')
        .insert([
          {
            name: name.toLowerCase().replace(/\s+/g, '-'),
            description,
            server_id: activeServer.id,
            is_premium: isPremium,
            category_id: categoryId,
            type: 'text',
            position: topics.filter(t => t.category_id === categoryId).length
          }
        ])
        .select()
        .single();
      
      if (topicError) throw topicError;
      
      if (newTopic) {
        // Refresh topics
        await fetchTopics(activeServer.id);
        
        // Return the new topic
        return {
          id: newTopic.id,
          name: newTopic.name,
          description: newTopic.description,
          server_id: newTopic.server_id,
          is_premium: newTopic.is_premium,
          created_at: newTopic.created_at,
          category_id: newTopic.category_id,
          type: newTopic.type,
          unread_count: 0
        } as Topic;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to create channel.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, activeServer, topics, toast]);

  // Create a new category
  const createCategory = useCallback(async (name: string) => {
    if (!user?.id || !activeServer) return null;
    
    try {
      // Create the category
      const { data: newCategory, error: categoryError } = await supabase
        .from('server_categories')
        .insert([
          {
            name: name.toUpperCase(),
            server_id: activeServer.id,
            position: categories.length
          }
        ])
        .select()
        .single();
      
      if (categoryError) throw categoryError;
      
      if (newCategory) {
        // Refresh topics and categories
        await fetchTopics(activeServer.id);
        
        // Return the new category
        return {
          id: newCategory.id,
          name: newCategory.name,
          topics: []
        } as ServerCategory;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create category.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, activeServer, categories, toast]);

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
    createServer,
    createTopic,
    createCategory
  };
}