import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useClassServer, ServerCategory, Topic, Message, ServerMember, Reaction } from '@/hooks/useClassServer';
import { useGoatNitro } from '@/hooks/useGoatNitro';
import { useAiChat } from '@/hooks/useAiChat';
import { useUserContext } from '@/context/UserContext';
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from '@/components/ui/premium-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  SendIcon,
  MessageSquareIcon,
  HashIcon,
  LockIcon,
  ImageIcon,
  FileIcon,
  SmileIcon,
  PlusIcon,
  BellIcon,
  UserIcon,
  CrownIcon,
  ZapIcon,
  BookIcon,
  RocketIcon,
  TrophyIcon,
  SparklesIcon,
  BotIcon,
  XIcon,
  InfoIcon,
  HomeIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
  PinIcon,
  TrashIcon,
  EditIcon,
  GiftIcon,
  EmojiIcon,
  GifIcon,
  LinkIcon,
  CircleIcon,
  MoonIcon,
  SunIcon,
  // Add missing icons
  MicIcon,
  HeadphonesIcon
} from '@/components/ui/icons';

const ClassServer = () => {
  const { user } = useUserContext();
  const {
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
  } = useClassServer();
  
  const { studyPoints, streak, isGoatUser, isProUser, getUserRank, getBadgeStyle, isFeatureAvailable } = useGoatNitro();
  const { processAiCommand, isGenerating } = useAiChat();
  
  // UI state
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showServerInfo, setShowServerInfo] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [showProfilePopup, setShowProfilePopup] = useState<string | null>(null);
  const [showNitroAnimation, setShowNitroAnimation] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  
  // Server creation state
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerDescription, setNewServerDescription] = useState('');
  
  // Channel creation state
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState('');
  
  // Category creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Animation controls
  const avatarControls = useAnimation();
  const nameControls = useAnimation();
  const badgeControls = useAnimation();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Trigger Nitro animation
  const triggerNitroAnimation = () => {
    if (!isGoatUser) return;
    
    setShowNitroAnimation(true);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5865F2', '#EB459E', '#FEE75C', '#57F287']
    });
    
    // Animate avatar
    avatarControls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 15, -15, 0],
      borderRadius: ["50%", "30%", "50%"],
      boxShadow: [
        "0 0 0 0px rgba(88, 101, 242, 0.4)",
        "0 0 0 10px rgba(88, 101, 242, 0.2)",
        "0 0 0 0px rgba(88, 101, 242, 0)"
      ],
      transition: { duration: 1.5 }
    });
    
    // Animate username
    nameControls.start({
      y: [0, -10, 0],
      color: [
        "rgba(255, 255, 255, 1)",
        "rgba(88, 101, 242, 1)",
        "rgba(235, 69, 158, 1)",
        "rgba(255, 255, 255, 1)"
      ],
      transition: { duration: 2 }
    });
    
    // Animate badge
    badgeControls.start({
      rotate: [0, 360],
      scale: [1, 1.5, 1],
      transition: { duration: 1.5 }
    });
    
    // Hide animation after a delay
    setTimeout(() => {
      setShowNitroAnimation(false);
    }, 3000);
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingMessage) return;

    // Check if it's an AI command
    if (inputMessage.startsWith('/askai')) {
      const aiResponse = await processAiCommand(inputMessage);
      if (aiResponse) {
        // First send the user's command
        await sendMessage(inputMessage);
        
        // Then send the AI response
        await sendMessage(aiResponse, null, 'none');
        setInputMessage('');
        return;
      }
    }
    
    // Check for Nitro boost command
    if (inputMessage === '/boost' && isGoatUser) {
      triggerNitroAnimation();
      await sendMessage("💜 **Boosted the server with Goat Nitro!** 💜");
      setInputMessage('');
      return;
    }
    
    // Check for special Nitro commands
    if (inputMessage.startsWith('/banner') && isGoatUser) {
      const bannerUrl = inputMessage.split(' ')[1];
      if (bannerUrl) {
        setSelectedBanner(bannerUrl);
        await sendMessage("I've updated my profile banner!");
      }
      setInputMessage('');
      return;
    }
    
    // Check for custom status command
    if (inputMessage.startsWith('/status') && isGoatUser) {
      const newStatus = inputMessage.substring(8);
      if (newStatus) {
        setCustomStatus(newStatus);
        await sendMessage(`Status updated to: ${newStatus}`);
      }
      setInputMessage('');
      return;
    }

    // Regular message
    await sendMessage(inputMessage);
    setInputMessage('');
    
    // Focus back on input after sending
    messageInputRef.current?.focus();
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Set typing indicator if there's content
    if (value.trim().length > 0) {
      setTypingIndicator(true);
    } else {
      setTypingIndicator(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user has access to media upload
    if (!isFeatureAvailable('media_upload')) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsUploading(true);
      
      // In a real implementation, you would upload the file to Supabase Storage
      // and get the URL. For now, we'll just simulate it.
      
      // Determine media type
      let mediaType: 'image' | 'pdf' | 'doc' | 'none' = 'none';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type === 'application/pdf') {
        mediaType = 'pdf';
      } else if (file.type.includes('document') || file.type.includes('msword')) {
        mediaType = 'doc';
      }
      
      // Mock URL for demo purposes
      const mockUrl = `https://example.com/files/${file.name}`;
      
      // Send message with media
      await sendMessage(`Shared a file: ${file.name}`, mockUrl, mediaType);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Show a user-friendly error message
      await sendMessage("Failed to upload file. Please try again later.", null, 'none');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };
  
  // Handle message reaction
  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };
  
  // Handle server creation
  const handleCreateServer = async () => {
    if (!newServerName.trim()) return;
    
    const newServer = await createServer(newServerName.trim(), newServerDescription.trim());
    if (newServer) {
      setNewServerName('');
      setNewServerDescription('');
      setIsCreatingServer(false);
      selectServer(newServer);
    }
  };
  
  // Handle channel creation
  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !newChannelCategory) return;
    
    const newChannel = await createTopic(
      newChannelName.trim(),
      newChannelDescription.trim(),
      newChannelCategory,
      false
    );
    
    if (newChannel) {
      setNewChannelName('');
      setNewChannelDescription('');
      setNewChannelCategory('');
      setIsCreatingChannel(false);
      selectTopic(newChannel);
    }
  };
  
  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = await createCategory(newCategoryName.trim());
    if (newCategory) {
      setNewCategoryName('');
      setIsCreatingCategory(false);
      
      // Expand the new category
      setExpandedCategories(prev => ({
        ...prev,
        [newCategory.id]: true
      }));
    }
  };

  // Render server list
  const renderServerList = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-12 w-12 rounded-full" />
      ));
    }

    return (
      <>
        <div className="mb-2 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full bg-emerald-500 p-0 text-white hover:bg-emerald-600 hover:text-white"
              >
                <MessageSquareIcon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Direct Messages</TooltipContent>
          </Tooltip>
        </div>
        
        <Separator className="my-2 bg-zinc-700" />
        
        {servers.length > 0 ? (
          servers.map((server) => (
            <Tooltip key={server.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeServer?.id === server.id ? 'default' : 'ghost'}
                  className={cn(
                    'relative h-12 w-12 rounded-full p-0 transition-all duration-200',
                    activeServer?.id === server.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:rounded-2xl'
                  )}
                  onClick={() => selectServer(server)}
                >
                  {server.icon_url ? (
                    <img
                      src={server.icon_url}
                      alt={server.class_name}
                      className="h-full w-full rounded-inherit object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-inherit bg-muted">
                      {server.class_name.substring(0, 2)}
                    </div>
                  )}
                  
                  {/* Server selection indicator */}
                  {activeServer?.id === server.id && (
                    <div className="absolute -left-2 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-col">
                  <span className="font-semibold">{server.class_name}</span>
                  <span className="text-xs text-muted-foreground">{server.member_count} members</span>
                </div>
              </TooltipContent>
            </Tooltip>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-2 py-4 text-center">
            <div className="mb-2 text-sm text-zinc-400">No servers yet</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setIsCreatingServer(true)}
            >
              Create Your First Server
            </Button>
          </div>
        )}
        
        <Separator className="my-2 bg-zinc-700" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 w-12 rounded-full bg-emerald-600 p-0 text-white hover:rounded-2xl hover:bg-emerald-700"
              onClick={() => setIsCreatingServer(true)}
            >
              <PlusIcon className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Create a Server</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 w-12 rounded-full bg-indigo-600 p-0 text-white hover:rounded-2xl hover:bg-indigo-700"
            >
              <SettingsIcon className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </>
    );
  };

  // Initialize all categories as expanded by default
  useEffect(() => {
    if (categories.length > 0 && Object.keys(expandedCategories).length === 0) {
      const initialState = categories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
      }, {} as {[key: string]: boolean});
      
      setExpandedCategories(initialState);
    }
  }, [categories, expandedCategories]);
  
  // Render topic list with categories
  const renderTopicList = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ));
    }

    return categories.map((category) => {
      const isExpanded = expandedCategories[category.id] !== false;
      const isPremiumCategory = category.name === 'PREMIUM CHANNELS';
      const shouldShowCategory = isGoatUser || !isPremiumCategory || (isPremiumCategory && !isGoatUser);
      
      if (!shouldShowCategory) return null;
      
      return (
        <div key={category.id} className="mb-2">
          <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="group flex w-full justify-between px-1 py-1 text-xs hover:bg-transparent"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDownIcon className="mr-1 h-3 w-3 text-zinc-400 group-hover:text-zinc-200" />
                  ) : (
                    <ChevronRightIcon className="mr-1 h-3 w-3 text-zinc-400 group-hover:text-zinc-200" />
                  )}
                  <span className="font-semibold text-zinc-400 group-hover:text-zinc-200">
                    {category.name}
                  </span>
                </div>
                {isPremiumCategory && !isGoatUser && (
                  <CrownIcon className="h-3 w-3 text-yellow-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-0.5">
              {category.topics.map((topic) => {
                const isActive = activeTopic?.id === topic.id;
                const isLocked = topic.is_premium && !isGoatUser;
                const topicIcon = topic.type === 'announcement' 
                  ? <BellIcon className="mr-2 h-4 w-4" /> 
                  : <HashIcon className="mr-2 h-4 w-4" />;
                
                return (
                  <Button
                    key={topic.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'group relative w-full justify-start px-2 py-1.5',
                      isActive && 'bg-zinc-700/50',
                      isLocked && 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradeModal(true);
                      } else {
                        selectTopic(topic);
                      }
                    }}
                  >
                    <div className="flex w-full items-center">
                      {isLocked ? (
                        <LockIcon className="mr-2 h-4 w-4" />
                      ) : (
                        topicIcon
                      )}
                      
                      <span className="flex-1 truncate">{topic.name}</span>
                      
                      {topic.is_premium && (
                        <CrownIcon className="ml-1 h-3.5 w-3.5 text-yellow-400" />
                      )}
                      
                      {topic.unread_count && topic.unread_count > 0 && (
                        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                          {topic.unread_count}
                        </span>
                      )}
                    </div>
                    
                    {/* Hover actions */}
                    <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center space-x-1 group-hover:flex">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <SettingsIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Button>
                );
              })}
              
              {/* Add channel button at the end of each category */}
              {(isGoatUser || !isPremiumCategory) && (
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  <span>Add Channel</span>
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    });
  };

  // Render messages
  const renderMessages = () => {
    if (isLoadingMessages) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-start space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
      ));
    }

    if (messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No messages yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to send a message in this channel!
            </p>
          </div>
        </div>
      );
    }

    // Group messages by date
    const groupedMessages: { [date: string]: Message[] } = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    // Render grouped messages
    return Object.entries(groupedMessages).map(([date, dateMessages]) => {
      return (
        <div key={date} className="message-group">
          <div className="sticky top-0 z-10 my-2 flex items-center justify-center">
            <div className="relative flex items-center">
              <Separator className="absolute w-full" />
              <span className="relative bg-background px-2 text-xs text-muted-foreground">
                {date === new Date().toLocaleDateString() ? 'Today' : date}
              </span>
            </div>
          </div>

          {dateMessages.map((message, index) => {
            const isCurrentUser = message.user_id === user?.id;
            const isAiMessage = message.is_ai;
            const userName = message.users?.displayName || 'Unknown User';
            const userTier = message.users?.subscription_tier || 'free';
            const isGoatMessage = userTier === 'goat';
            const isProMessage = userTier === 'pro';
            
            // Check if this message should show the full header
            // (first message or different user from previous message)
            const prevMessage = index > 0 ? dateMessages[index - 1] : null;
            const showFullHeader = !prevMessage || 
              prevMessage.user_id !== message.user_id || 
              // If messages are more than 5 minutes apart, show full header
              (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000);
            
            // Find the message being replied to
            const replyToMessage = message.reply_to 
              ? messages.find(m => m.id === message.reply_to) 
              : null;
            
            return (
              <div
                key={message.id}
                className={cn(
                  'group relative flex items-start px-4 py-0.5 hover:bg-zinc-800/50',
                  showFullHeader ? 'mt-4 pt-2' : 'mt-0.5',
                  message.pinned && 'bg-amber-950/10',
                  isGoatMessage && 'hover:bg-indigo-950/20'
                )}
              >
                {showFullHeader ? (
                  <Avatar className="mr-4 mt-0.5 h-10 w-10">
                    {message.users?.profilePic ? (
                      <AvatarImage src={message.users.profilePic} alt={userName} />
                    ) : (
                      <AvatarFallback>
                        {isAiMessage ? (
                          <BotIcon className="h-5 w-5" />
                        ) : (
                          userName.substring(0, 2)
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ) : (
                  <div className="mr-4 w-10" />
                )}
                
                <div className="flex-1 overflow-hidden">
                  {showFullHeader && (
                    <div className="flex items-center">
                      <span
                        className={cn(
                          'font-medium hover:underline',
                          isGoatMessage && 'text-indigo-400',
                          isProMessage && 'text-emerald-400',
                          isAiMessage && 'text-blue-400'
                        )}
                      >
                        {userName}
                      </span>
                      
                      {isGoatMessage && (
                        <Badge variant="outline" className="ml-2 bg-indigo-500/10 text-indigo-400">
                          <CrownIcon className="mr-1 h-3 w-3" /> GOAT
                        </Badge>
                      )}
                      
                      {isProMessage && (
                        <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-400">
                          <SparklesIcon className="mr-1 h-3 w-3" /> PRO
                        </Badge>
                      )}
                      
                      {isAiMessage && (
                        <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400">
                          <BotIcon className="mr-1 h-3 w-3" /> AI
                        </Badge>
                      )}
                      
                      <span className="ml-2 text-xs text-zinc-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {message.edited && (
                        <span className="ml-1 text-xs text-zinc-500">(edited)</span>
                      )}
                      
                      {message.pinned && (
                        <PinIcon className="ml-2 h-3 w-3 text-amber-400" />
                      )}
                    </div>
                  )}
                  
                  {/* Reply reference */}
                  {replyToMessage && (
                    <div className="mb-1 flex items-center text-xs text-zinc-400">
                      <PlayIcon className="mr-1 h-3 w-3" />
                      <span>Replying to </span>
                      <span className="ml-1 font-medium text-zinc-300">
                        {replyToMessage.users?.displayName || 'Unknown'}
                      </span>
                      <span className="ml-1 line-clamp-1 opacity-75">
                        {replyToMessage.text.length > 40 
                          ? `${replyToMessage.text.substring(0, 40)}...` 
                          : replyToMessage.text}
                      </span>
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className={cn("break-words", !showFullHeader && "text-zinc-300")}>
                    {/* Highlight mentions */}
                    {message.mentions && message.mentions.length > 0 ? (
                      <div>
                        {message.text.split(/(@\w+)/).map((part, i) => {
                          if (part.startsWith('@')) {
                            const username = part.substring(1);
                            const member = members.find(m => 
                              m.user.displayName.toLowerCase().replace(/\s+/g, '') === username.toLowerCase()
                            );
                            
                            return member ? (
                              <span key={i} className="rounded bg-indigo-500/20 px-1 text-indigo-300">
                                @{member.user.displayName}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            );
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  
                  {/* Media attachments */}
                  {message.media_url && (
                    <div className="mt-2 max-w-md">
                      {message.media_type === 'image' ? (
                        <img
                          src={message.media_url}
                          alt="Shared image"
                          className="max-h-80 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex items-center rounded-md bg-zinc-800 p-2">
                          {message.media_type === 'pdf' ? (
                            <FileIcon className="mr-2 h-5 w-5 text-red-400" />
                          ) : (
                            <FileIcon className="mr-2 h-5 w-5 text-blue-400" />
                          )}
                          <span className="text-sm">
                            {message.media_url.split('/').pop()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {message.reactions.map((reaction, i) => {
                        const hasReacted = reaction.users.includes(user?.id || '');
                        return (
                          <Button
                            key={`${message.id}-${reaction.emoji}-${i}`}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "flex h-7 items-center space-x-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs",
                              hasReacted && "border-indigo-500/50 bg-indigo-500/10"
                            )}
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </Button>
                        );
                      })}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-60 p-2">
                          <div className="grid grid-cols-8 gap-2">
                            {["😀", "😂", "❤️", "👍", "👎", "😠", "🎉", "🔥", "👋", "🤔", "🙏", "💯", "🌟", "🎮", "📚", "💻"].map(emoji => (
                              <Button 
                                key={emoji}
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleReaction(message.id, emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
                
                {/* Message actions */}
                <div className="absolute right-2 top-0 hidden space-x-1 rounded-md bg-zinc-800 p-1 shadow-md group-hover:flex">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100"
                    onClick={() => handleReaction(message.id, '👍')}
                  >
                    <SmileIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100"
                    onClick={() => setReply(message)}
                  >
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                  {isCurrentUser && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {(isCurrentUser || isGoatUser) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-zinc-400 hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  // Render members list
  const renderMembersList = () => {
    if (isLoadingMembers) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center space-x-2 px-2 py-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ));
    }

    // Group members by role
    const roleGroups = {
      owner: members.filter(m => m.role === 'owner'),
      admin: members.filter(m => m.role === 'admin'),
      moderator: members.filter(m => m.role === 'moderator'),
      member: members.filter(m => m.role === 'member'),
    };

    // Status groups for sorting
    const onlineMembers = members.filter(m => m.status === 'online' || m.status === 'idle' || m.status === 'dnd');
    const offlineMembers = members.filter(m => m.status === 'offline');

    return (
      <div className="px-2 py-2">
        {/* Online members count */}
        <div className="mb-2 px-2 text-xs font-semibold uppercase text-zinc-400">
          Online — {onlineMembers.length}
        </div>

        {/* Render online members by role */}
        {Object.entries(roleGroups).map(([role, roleMembers]) => {
          const onlineRoleMembers = roleMembers.filter(m => m.status !== 'offline');
          if (onlineRoleMembers.length === 0) return null;

          return (
            <div key={role} className="mb-2">
              {onlineRoleMembers.map(member => {
                const isCurrentUser = member.user_id === user?.id;
                const statusColor = member.status === 'online' 
                  ? 'bg-green-500' 
                  : member.status === 'idle' 
                    ? 'bg-yellow-500' 
                    : member.status === 'dnd' 
                      ? 'bg-red-500' 
                      : 'bg-zinc-500';
                
                return (
                  <div 
                    key={member.id} 
                    className={cn(
                      "group flex items-center space-x-2 rounded px-2 py-1 hover:bg-zinc-800",
                      isCurrentUser && "bg-zinc-800/50"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        {member.user.profilePic ? (
                          <AvatarImage src={member.user.profilePic} alt={member.user.displayName} />
                        ) : (
                          <AvatarFallback>{member.user.displayName.substring(0, 2)}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900",
                        statusColor
                      )} />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <div className={cn(
                          "text-sm font-medium",
                          member.user.subscription_tier === 'goat' && "text-indigo-400",
                          member.user.subscription_tier === 'pro' && "text-emerald-400",
                          isCurrentUser && "text-white"
                        )}>
                          {member.nickname || member.user.displayName}
                          {isCurrentUser && " (you)"}
                        </div>
                        {role !== 'member' && (
                          <div className="text-xs text-zinc-400 capitalize">
                            {role}
                          </div>
                        )}
                      </div>
                      
                      {/* Member badges */}
                      <div className="flex items-center space-x-1">
                        {member.user.subscription_tier === 'goat' && (
                          <CrownIcon className="h-3.5 w-3.5 text-yellow-400" />
                        )}
                        {member.user.subscription_tier === 'pro' && (
                          <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Offline members */}
        {offlineMembers.length > 0 && (
          <>
            <Collapsible defaultOpen={false} className="mt-4">
              <CollapsibleTrigger className="flex w-full items-center px-2 py-1 text-xs font-semibold uppercase text-zinc-400">
                <ChevronRightIcon className="mr-1 h-3 w-3" />
                Offline — {offlineMembers.length}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {offlineMembers.map(member => (
                  <div 
                    key={member.id} 
                    className="group flex items-center space-x-2 rounded px-2 py-1 opacity-70 hover:bg-zinc-800"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 opacity-70">
                        {member.user.profilePic ? (
                          <AvatarImage src={member.user.profilePic} alt={member.user.displayName} />
                        ) : (
                          <AvatarFallback>{member.user.displayName.substring(0, 2)}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 bg-zinc-500" />
                    </div>
                    <div className="text-sm text-zinc-400">
                      {member.nickname || member.user.displayName}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          {activeTopic ? `#${activeTopic.name}` : 'Class Servers'} | Study Nova
        </title>
        <meta
          name="description"
          content="Join class-specific servers, chat in topic-based channels, and earn XP & ranks in Study Nova's real-time discussion system."
        />
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-zinc-900 text-zinc-100">
        {/* Server sidebar */}
        <div className="flex w-16 flex-col items-center space-y-2 bg-zinc-950 p-2">
          <TooltipProvider>
            {renderServerList()}
          </TooltipProvider>
        </div>

        {/* Channel sidebar */}
        <div className="w-60 flex-shrink-0 bg-zinc-900">
          {/* Server header */}
          <div className="flex h-12 items-center border-b border-zinc-800 px-4 shadow-sm">
            <h2 className="font-semibold">
              {activeServer?.class_name || 'Select a server'}
            </h2>
            <ChevronDownIcon className="ml-auto h-5 w-5 text-zinc-400" />
          </div>
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="px-2 py-4">
              {renderTopicList()}
            </div>
          </ScrollArea>
          
          {/* User area */}
          <div className="absolute bottom-0 flex h-14 w-60 items-center justify-between border-t border-zinc-800 bg-zinc-900 px-2">
            <div className="flex items-center">
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div onClick={() => isGoatUser && triggerNitroAnimation()}>
                      <motion.div
                        animate={avatarControls}
                        className={cn(
                          "relative",
                          isGoatUser && "cursor-pointer hover:scale-105 transition-transform"
                        )}
                      >
                        <Avatar className={cn(
                          "h-8 w-8",
                          isGoatUser && "ring-2 ring-indigo-500 ring-offset-1 ring-offset-zinc-900"
                        )}>
                          {user?.profilePic ? (
                            <AvatarImage src={user.profilePic} alt={user.displayName} />
                          ) : (
                            <AvatarFallback>{user?.displayName.substring(0, 2)}</AvatarFallback>
                          )}
                        </Avatar>
                        
                        {/* Animated avatar ring for Nitro users */}
                        {isGoatUser && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow -z-10" 
                            style={{ padding: '2px' }} />
                        )}
                        
                        <span className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900",
                          customStatus ? "bg-yellow-500" : "bg-green-500"
                        )}></span>
                      </motion.div>
                    </div>
                  </TooltipTrigger>
                  {isGoatUser && (
                    <TooltipContent side="top" className="w-60 p-0 overflow-hidden">
                      <div className="relative">
                        {/* Profile banner */}
                        <div className="h-20 w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                          {selectedBanner && (
                            <img 
                              src={selectedBanner} 
                              alt="Profile Banner" 
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        
                        {/* Profile avatar */}
                        <div className="absolute -bottom-6 left-3">
                          <Avatar className="h-12 w-12 ring-4 ring-zinc-900">
                            {user?.profilePic ? (
                              <AvatarImage src={user.profilePic} alt={user.displayName} />
                            ) : (
                              <AvatarFallback>{user?.displayName.substring(0, 2)}</AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </div>
                      
                      <div className="p-3 pt-8">
                        <div className="flex items-center">
                          <motion.div animate={nameControls} className="font-bold">
                            {user?.displayName}
                          </motion.div>
                          <motion.div animate={badgeControls} className="ml-1">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                              <CrownIcon className="mr-1 h-3 w-3" /> NITRO
                            </Badge>
                          </motion.div>
                        </div>
                        
                        {customStatus && (
                          <div className="mt-1 text-sm text-zinc-400">
                            {customStatus}
                          </div>
                        )}
                        
                        <Separator className="my-2" />
                        
                        <div className="text-xs text-zinc-400">
                          <div className="flex items-center justify-between">
                            <span>Nitro Since</span>
                            <span>May 2023</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span>Server Boosts</span>
                            <span>2 Servers</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              <div className="ml-2">
                <motion.div animate={nameControls} className="text-sm font-medium">
                  {user?.displayName}
                </motion.div>
                <div className="flex items-center text-xs text-zinc-400">
                  {customStatus ? (
                    <span className="line-clamp-1">{customStatus}</span>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="ml-1">{getUserRank()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100",
                  isGoatUser && "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                )}
              >
                <MicIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100",
                  isGoatUser && "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                )}
              >
                <HeadphonesIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100",
                  isGoatUser && "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                )}
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-zinc-800">
          {/* Channel header */}
          <div className="flex h-12 items-center justify-between border-b border-zinc-700 px-4 shadow-sm">
            <div className="flex items-center">
              <HashIcon className="mr-2 h-5 w-5 text-zinc-400" />
              <h3 className="font-semibold">
                {activeTopic?.name || 'Select a channel'}
              </h3>
              {activeTopic?.description && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-5" />
                  <div className="text-sm text-zinc-400">
                    {activeTopic.description}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100"
                    onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                  >
                    <PinIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pinned Messages</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100"
                  >
                    <BellIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notification Settings</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-100"
                    onClick={toggleMembersList}
                  >
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Member List</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="min-h-[calc(100vh-8rem)]">
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Members sidebar */}
            {showMembersList && (
              <div className="w-60 flex-shrink-0 border-l border-zinc-700 bg-zinc-800">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  {renderMembersList()}
                </ScrollArea>
              </div>
            )}
          </div>
          
          {/* Reply indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between border-t border-zinc-700 bg-zinc-850 px-4 py-2">
              <div className="flex items-center text-sm text-zinc-400">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  <span>Replying to </span>
                  <span className="ml-1 font-medium text-zinc-300">
                    {replyingTo.users?.displayName}
                  </span>
                </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-md text-zinc-400 hover:text-zinc-100"
                onClick={() => setReply(null)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Message input */}
          <div className="border-t border-zinc-700 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 rounded-full text-zinc-400 hover:text-zinc-100"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-60 p-2">
                  <div className="grid gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex w-full justify-start"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      <span>Upload File</span>
                    </Button>
                    
                    {isGoatUser && (
                      <>
                        <Button 
                          variant="ghost" 
                          className="flex w-full justify-start"
                          onClick={() => triggerNitroAnimation()}
                        >
                          <CrownIcon className="mr-2 h-4 w-4 text-indigo-400" />
                          <span>Boost Server</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          className="flex w-full justify-start"
                        >
                          <GiftIcon className="mr-2 h-4 w-4 text-pink-400" />
                          <span>Send Gift</span>
                        </Button>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="text-xs text-zinc-400">
                      {isGoatUser ? (
                        <div className="flex items-center">
                          <CrownIcon className="mr-1 h-3 w-3 text-yellow-400" />
                          <span>Nitro perks active</span>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto w-full justify-start p-0 text-xs text-indigo-400"
                          onClick={() => setShowUpgradeModal(true)}
                        >
                          <span>Upgrade to Goat Nitro</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              
              <div className="relative flex-1">
                <Input
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder={`Message #${activeTopic?.name || 'channel'}`}
                  className={cn(
                    "border-0 bg-zinc-700 px-4 py-6 text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0",
                    isGoatUser && "pr-32"
                  )}
                  disabled={!activeTopic}
                  ref={messageInputRef}
                />
                
                {/* Nitro commands hint */}
                {isGoatUser && inputMessage.startsWith('/') && (
                  <div className="absolute left-0 top-0 mt-12 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 shadow-lg">
                    <div className="text-xs font-semibold text-zinc-300">NITRO COMMANDS</div>
                    <div className="mt-1 grid gap-1">
                      <div className="flex items-center rounded px-2 py-1 hover:bg-zinc-700">
                        <div className="flex-1">
                          <div className="text-sm font-medium">/boost</div>
                          <div className="text-xs text-zinc-400">Boost this server with Nitro</div>
                        </div>
                      </div>
                      <div className="flex items-center rounded px-2 py-1 hover:bg-zinc-700">
                        <div className="flex-1">
                          <div className="text-sm font-medium">/banner [url]</div>
                          <div className="text-xs text-zinc-400">Set a custom profile banner</div>
                        </div>
                      </div>
                      <div className="flex items-center rounded px-2 py-1 hover:bg-zinc-700">
                        <div className="flex-1">
                          <div className="text-sm font-medium">/status [text]</div>
                          <div className="text-xs text-zinc-400">Set a custom status message</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center space-x-1">
                  {isGoatUser && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100"
                      >
                        <GiftIcon className="h-5 w-5 text-pink-400" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100"
                      >
                        <GifIcon className="h-5 w-5 text-green-400" />
                      </Button>
                    </>
                  )}
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-100"
                        aria-label="Open emoji picker"
                      >
                        <SmileIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="w-60 p-2">
                      <div className="grid grid-cols-8 gap-2">
                        {["😀", "😂", "❤️", "👍", "👎", "😠", "🎉", "🔥", "👋", "🤔", "🙏", "💯", "🌟", "🎮", "📚", "💻"].map(emoji => (
                          <Button 
                            key={emoji}
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEmojiSelect(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </form>
            
            {/* Typing indicator */}
            {Object.values(isTyping).some(Boolean) && (
              <div className="mt-1 text-xs text-zinc-400">
                Someone is typing...
              </div>
            )}
            
            {/* Nitro commands help */}
            {isGoatUser && (
              <div className="mt-1 text-xs text-zinc-500">
                Try /boost, /banner, or /status commands with your Nitro subscription
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="border-zinc-700 bg-zinc-900 p-0 text-zinc-100 sm:max-w-md">
          {/* Nitro header with animated gradient */}
          <div className="relative overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-80"></div>
            <div className="relative p-6 text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CrownIcon className="mx-auto mb-2 h-12 w-12 text-white" />
                <h2 className="text-2xl font-bold text-white">Goat Nitro</h2>
                <p className="mt-1 text-white/80">Upgrade your learning experience</p>
              </motion.div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Subscription tiers */}
            <div className="mb-6">
              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly
                    <Badge className="ml-2 bg-green-500 text-white">Save 16%</Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="mt-4">
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">Goat Nitro</h3>
                        <p className="text-sm text-zinc-400">Billed monthly</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">$9.99</div>
                        <p className="text-xs text-zinc-400">per month</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="yearly" className="mt-4">
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">Goat Nitro</h3>
                        <p className="text-sm text-zinc-400">Billed yearly</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">$99.99</div>
                        <p className="text-xs text-zinc-400">$8.33 per month</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Features list */}
            <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
              <h3 className="font-semibold text-white">Unlock all these perks:</h3>
              
              <motion.div 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20">
                  <ImageIcon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Custom Profile</h4>
                  <p className="text-sm text-zinc-400">Animated avatars, banners, and custom status</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                  <LockIcon className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Premium Channels</h4>
                  <p className="text-sm text-zinc-400">Access exclusive content and discussions</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                  <BotIcon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">AI Assistant</h4>
                  <p className="text-sm text-zinc-400">Get homework help and study with our advanced AI</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/20">
                  <GiftIcon className="h-4 w-4 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Server Boosts</h4>
                  <p className="text-sm text-zinc-400">Boost your favorite servers for perks and recognition</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <ZapIcon className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">XP Boosts</h4>
                  <p className="text-sm text-zinc-400">Earn XP faster and unlock rewards quicker</p>
                </div>
              </motion.div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-6 flex flex-col space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-6 text-base font-bold text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                onClick={() => {
                  setShowUpgradeModal(false);
                  window.location.href = '/subscription';
                }}
              >
                <CrownIcon className="mr-2 h-5 w-5" />
                Subscribe to Goat Nitro
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-zinc-400 hover:text-zinc-100"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Server info modal */}
      <Dialog open={showServerInfo} onOpenChange={setShowServerInfo}>
        <DialogContent className="border-zinc-700 bg-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Create a Server</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="text-center">
              <p className="mb-4 text-zinc-300">
                Your server is where you and your classmates hang out. Make yours and start talking.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button className="flex flex-col items-center justify-center space-y-2 border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 hover:bg-zinc-700">
                  <BookIcon className="h-8 w-8 text-indigo-400" />
                  <span>Create My Own</span>
                </Button>
                
                <Button className="flex flex-col items-center justify-center space-y-2 border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 hover:bg-zinc-700">
                  <RocketIcon className="h-8 w-8 text-green-400" />
                  <span>Join a Server</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Pinned messages modal */}
      <Dialog open={showPinnedMessages} onOpenChange={setShowPinnedMessages}>
        <DialogContent className="border-zinc-700 bg-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-zinc-100">
              <PinIcon className="mr-2 h-5 w-5 text-zinc-400" />
              Pinned Messages
            </DialogTitle>
          </DialogHeader>
          <div>
            {messages.filter(m => m.pinned).length === 0 ? (
              <div className="py-8 text-center text-zinc-400">
                <PinIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No pinned messages yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 p-2">
                  {messages.filter(m => m.pinned).map(message => (
                    <div key={message.id} className="rounded-md border border-zinc-700 bg-zinc-900 p-3">
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-6 w-6">
                          {message.users?.profilePic ? (
                            <AvatarImage src={message.users.profilePic} alt={message.users?.displayName || ''} />
                          ) : (
                            <AvatarFallback>{(message.users?.displayName || '').substring(0, 2)}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium text-zinc-300">{message.users?.displayName}</span>
                        <span className="ml-2 text-xs text-zinc-500">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 text-zinc-300">{message.text}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Emoji picker popover */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverContent 
          className="w-auto border-zinc-700 bg-zinc-800 p-2" 
          side="top" 
          align="end"
          sideOffset={5}
        >
          <div className="grid grid-cols-8 gap-1">
            {['😀', '😂', '😍', '🤔', '😎', '👍', '❤️', '🔥', '🎉', '🙏', '👀', '💯', '🤖', '📚', '🧠', '⭐'].map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
          
          {!isGoatUser && (
            <div className="mt-1 border-t border-zinc-700 pt-1 text-center text-xs text-zinc-400">
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs text-indigo-400"
                onClick={() => {
                  setShowEmojiPicker(false);
                  setShowUpgradeModal(true);
                }}
              >
                Get Nitro for more emojis
              </Button>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 w-full justify-center text-xs text-zinc-400"
            onClick={() => setShowEmojiPicker(false)}
          >
            Close
          </Button>
        </PopoverContent>
      </Popover>
      
      {/* Nitro boost animation overlay */}
      <AnimatePresence>
        {showNitroAnimation && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <motion.div
                className="mb-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: 1 }}
              >
                <div className="rounded-full bg-zinc-900 p-4">
                  <CrownIcon className="h-16 w-16 text-yellow-400" />
                </div>
              </motion.div>
              
              <motion.h2 
                className="mb-2 text-2xl font-bold text-white"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1, repeat: 2 }}
              >
                Server Boosted!
              </motion.h2>
              
              <motion.p 
                className="text-center text-lg text-zinc-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You've boosted this server with Goat Nitro!
              </motion.p>
              
              <motion.div
                className="mt-8 flex items-center space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                <div className="h-1 w-16 rounded-full bg-zinc-700" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
              </motion.div>
              
              <motion.div
                className="mt-4 text-center text-sm text-zinc-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Server is now at Level 1 with 1/2 boosts
              </motion.div>
              
              <motion.button
                className="mt-8 rounded-full bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700"
                onClick={() => setShowNitroAnimation(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        @keyframes rainbow-text {
          0% { color: #5865F2; }
          25% { color: #EB459E; }
          50% { color: #FEE75C; }
          75% { color: #57F287; }
          100% { color: #5865F2; }
        }
        .animate-rainbow-text {
          animation: rainbow-text 3s linear infinite;
        }
      `}} />
    </>
  );
};

export default ClassServer;