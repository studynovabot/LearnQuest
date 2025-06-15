import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useClassServer } from '@/hooks/useClassServer';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  InfoIcon
} from '@/components/ui/icons';

const ClassServer = () => {
  const { user } = useUserContext();
  const {
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
  } = useClassServer();
  
  const { xp, streak, isGoatUser, getUserRank, getBadgeStyle, isFeatureAvailable } = useGoatNitro();
  const { processAiCommand, isGenerating } = useAiChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Regular message
    await sendMessage(inputMessage);
    setInputMessage('');
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
    } finally {
      setIsUploading(false);
    }
  };

  // Render server list
  const renderServerList = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-12 w-12 rounded-full" />
      ));
    }

    return servers.map((server) => (
      <Tooltip key={server.id}>
        <TooltipTrigger asChild>
          <Button
            variant={activeServer?.id === server.id ? 'default' : 'ghost'}
            className={cn(
              'h-12 w-12 rounded-full p-0',
              activeServer?.id === server.id && 'bg-primary text-primary-foreground'
            )}
            onClick={() => selectServer(server)}
          >
            {server.icon_url ? (
              <img
                src={server.icon_url}
                alt={server.class_name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {server.class_name.substring(0, 2)}
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{server.class_name}</TooltipContent>
      </Tooltip>
    ));
  };

  // Render topic list
  const renderTopicList = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ));
    }

    return topics.map((topic) => (
      <Button
        key={topic.id}
        variant={activeTopic?.id === topic.id ? 'default' : 'ghost'}
        className={cn(
          'justify-start',
          activeTopic?.id === topic.id && 'bg-primary/10'
        )}
        onClick={() => selectTopic(topic)}
      >
        <HashIcon className="mr-2 h-4 w-4" />
        <span>{topic.name}</span>
        {topic.is_premium && (
          <CrownIcon className="ml-2 h-4 w-4 text-yellow-400" />
        )}
      </Button>
    ));
  };

  // Render premium-locked topics
  const renderPremiumTopics = () => {
    if (isGoatUser) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center">
          <LockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Premium Channels</span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start opacity-50"
          disabled
          onClick={() => setShowUpgradeModal(true)}
        >
          <HashIcon className="mr-2 h-4 w-4" />
          <span>topper-club</span>
          <CrownIcon className="ml-2 h-4 w-4 text-yellow-400" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start opacity-50"
          disabled
          onClick={() => setShowUpgradeModal(true)}
        >
          <HashIcon className="mr-2 h-4 w-4" />
          <span>ai-god-mode</span>
          <CrownIcon className="ml-2 h-4 w-4 text-yellow-400" />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start opacity-50"
          disabled
          onClick={() => setShowUpgradeModal(true)}
        >
          <HashIcon className="mr-2 h-4 w-4" />
          <span>exam-leaks</span>
          <CrownIcon className="ml-2 h-4 w-4 text-yellow-400" />
        </Button>
      </div>
    );
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

    return messages.map((message) => {
      const isCurrentUser = message.user_id === user?.id;
      const isAiMessage = message.is_ai;
      const userName = message.users?.displayName || 'Unknown User';
      const userTier = message.users?.subscription_tier || 'free';
      const isGoatMessage = userTier === 'goat';
      
      return (
        <div
          key={message.id}
          className={cn(
            'group relative flex items-start space-x-4 p-4 hover:bg-muted/50',
            isGoatMessage && 'bg-gradient-to-r from-primary/5 to-transparent'
          )}
        >
          <Avatar>
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
          
          <div className="flex-1">
            <div className="flex items-center">
              <span
                className={cn(
                  'font-medium',
                  isGoatMessage && 'text-primary'
                )}
              >
                {userName}
              </span>
              
              {isGoatMessage && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                  <CrownIcon className="mr-1 h-3 w-3" /> GOAT
                </Badge>
              )}
              
              {isAiMessage && (
                <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-500">
                  <BotIcon className="mr-1 h-3 w-3" /> AI
                </Badge>
              )}
              
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="mt-1">
              {message.text}
            </div>
            
            {message.media_url && (
              <div className="mt-2">
                {message.media_type === 'image' ? (
                  <img
                    src={message.media_url}
                    alt="Shared image"
                    className="max-h-60 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex items-center rounded-md bg-muted p-2">
                    {message.media_type === 'pdf' ? (
                      <FileIcon className="mr-2 h-5 w-5 text-red-500" />
                    ) : (
                      <FileIcon className="mr-2 h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm">
                      {message.media_url.split('/').pop()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
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

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Server sidebar */}
        <div className="flex w-16 flex-col items-center space-y-4 border-r bg-muted/30 p-2">
          <TooltipProvider>
            {renderServerList()}
          </TooltipProvider>
          
          <div className="mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Add Server</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Channel sidebar */}
        <div className="w-60 flex-shrink-0 border-r">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="font-semibold">
              {activeServer?.class_name || 'Select a server'}
            </h2>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                TEXT CHANNELS
              </h3>
              <div className="space-y-1">
                {renderTopicList()}
              </div>
              
              {renderPremiumTopics()}
            </div>
          </div>
          
          {/* User info */}
          <div className="mt-auto border-t p-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                {user?.profilePic ? (
                  <AvatarImage src={user.profilePic} alt={user.displayName} />
                ) : (
                  <AvatarFallback>{user?.displayName.substring(0, 2) || 'U'}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{user?.displayName || 'Guest'}</p>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-1">
                    <ZapIcon className="mr-1 h-3 w-3" /> {xp} XP
                  </Badge>
                  {streak > 0 && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                      <SparklesIcon className="mr-1 h-3 w-3" /> {streak}d
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Channel header */}
          <div className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <HashIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">{activeTopic?.name || 'Select a channel'}</h2>
              {activeTopic?.is_premium && (
                <Badge className="ml-2 bg-yellow-500/10 text-yellow-500">
                  <CrownIcon className="mr-1 h-3 w-3" /> Premium
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <BellIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Members</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1">
            {activeTopic ? (
              renderMessages()
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <HashIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">Select a channel</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a channel from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Message input */}
          {activeTopic && (
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message #${activeTopic.name}${isGoatUser ? ' or use /askai to ask AI' : ''}`}
                  className="flex-1"
                  disabled={isSendingMessage || isGenerating}
                />
                
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isSendingMessage || isGenerating}
                >
                  {isSendingMessage || isGenerating ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <SendIcon className="h-5 w-5" />
                  )}
                </Button>
              </form>
              
              {isGoatUser && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Pro tip:</span> Use{' '}
                  <code className="rounded bg-muted px-1">/askai your question</code> to get AI help
                </div>
              )}
            </div>
          )}
        </div>

        {/* XP and Rank sidebar */}
        <div className="hidden w-64 flex-shrink-0 border-l lg:block">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="font-semibold">Stats & Leaderboard</h2>
          </div>
          
          <div className="p-4">
            {/* User stats */}
            <div className="mb-6 rounded-lg bg-muted/30 p-4">
              <h3 className="mb-2 text-sm font-medium">Your Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">XP</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    <ZapIcon className="mr-1 h-3 w-3" /> {xp}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rank</span>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                    <TrophyIcon className="mr-1 h-3 w-3" /> {getUserRank()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                    <SparklesIcon className="mr-1 h-3 w-3" /> {streak} days
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      isGoatUser
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : user?.subscription_tier === 'pro'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-gray-500/10 text-gray-500'
                    )}
                  >
                    {isGoatUser ? (
                      <>
                        <CrownIcon className="mr-1 h-3 w-3" /> GOAT
                      </>
                    ) : user?.subscription_tier === 'pro' ? (
                      <>
                        <RocketIcon className="mr-1 h-3 w-3" /> PRO
                      </>
                    ) : (
                      <>
                        <BookIcon className="mr-1 h-3 w-3" /> FREE
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              
              {!isGoatUser && (
                <Button
                  variant="default"
                  className="mt-4 w-full"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <CrownIcon className="mr-2 h-4 w-4" /> Upgrade to GOAT
                </Button>
              )}
            </div>
            
            {/* Leaderboard */}
            <div>
              <h3 className="mb-2 text-sm font-medium">Class Leaderboard</h3>
              
              <div className="space-y-2">
                {/* This would be populated with real data in production */}
                <div className="flex items-center rounded-md bg-yellow-500/10 p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white">
                    1
                  </div>
                  <div className="ml-2 flex-1">
                    <p className="font-medium">Arjun K.</p>
                    <p className="text-xs text-muted-foreground">5,240 XP</p>
                  </div>
                  <CrownIcon className="h-4 w-4 text-yellow-500" />
                </div>
                
                <div className="flex items-center rounded-md bg-gray-500/10 p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 text-white">
                    2
                  </div>
                  <div className="ml-2 flex-1">
                    <p className="font-medium">Priya M.</p>
                    <p className="text-xs text-muted-foreground">4,120 XP</p>
                  </div>
                </div>
                
                <div className="flex items-center rounded-md bg-amber-500/10 p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                    3
                  </div>
                  <div className="ml-2 flex-1">
                    <p className="font-medium">Rahul S.</p>
                    <p className="text-xs text-muted-foreground">3,890 XP</p>
                  </div>
                </div>
                
                {/* Current user position */}
                <div className="flex items-center rounded-md bg-muted p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    ?
                  </div>
                  <div className="ml-2 flex-1">
                    <p className="font-medium">You</p>
                    <p className="text-xs text-muted-foreground">{xp} XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CrownIcon className="mr-2 h-5 w-5 text-yellow-500" />
              Upgrade to Goat Nitro
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <PremiumCard className="overflow-hidden">
              <PremiumCardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                <PremiumCardTitle className="flex items-center">
                  <CrownIcon className="mr-2 h-6 w-6" />
                  Goat Nitro Benefits
                </PremiumCardTitle>
              </PremiumCardHeader>
              
              <PremiumCardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <SparklesIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Custom Profile Badges</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stand out with unique frames, colors, and animations on your messages
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <LockIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Private Rooms</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access exclusive channels like #Topper-Club, #AI-God-Mode, and #Exam-Leaks
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <BotIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    <span className="font-medium">AI Chat Bot</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get instant help with /askai for math, science, and more
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <ZapIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    <span className="font-medium">XP Drops & Rewards</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly XP bonuses and special rewards for engagement
                  </p>
                </div>
              </PremiumCardContent>
            </PremiumCard>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </Button>
              <Button
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                onClick={() => {
                  setShowUpgradeModal(false);
                  window.location.href = '/subscription';
                }}
              >
                <CrownIcon className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassServer;