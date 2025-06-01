import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pdfProcessor } from '@/lib/pdfProcessor';
import { SimpleSearchResult } from '@/lib/simpleVectorDB';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sources?: SimpleSearchResult[];
}

interface EnhancedAITutorProps {
  userId: string;
  subject: string;
  tutorName: string;
}

const EnhancedAITutor: React.FC<EnhancedAITutorProps> = ({ userId, subject, tutorName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: `Hi! I'm ${tutorName}, your AI tutor for ${subject}. I can now access your uploaded documents to provide personalized answers! 📚\n\nTry asking me questions about topics you've uploaded, like:\n• "Explain photosynthesis from my notes"\n• "What is the quadratic formula?"\n• "Summarize chapter 5 from my textbook"`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [tutorName, subject]);

  const searchUserDocuments = async (query: string): Promise<SimpleSearchResult[]> => {
    try {
      const results = await pdfProcessor.searchDocuments(query, {
        subject: subject,
        userId: userId
      });
      return results.slice(0, 3); // Top 3 most relevant results
    } catch (error) {
      console.error('Error searching user documents:', error);
      return [];
    }
  };

  const generateAIResponse = async (userQuery: string, sources: SimpleSearchResult[]): Promise<string> => {
    try {
      // Prepare context from user's documents
      let context = '';
      if (sources.length > 0) {
        context = '\n\nRelevant information from your uploaded documents:\n';
        sources.forEach((source, index) => {
          context += `\n${index + 1}. From "${source.document.metadata.title}":\n${source.relevantChunk}\n`;
        });
      }

      // Use Groq API for response generation
      const response = await fetch('/api/chat/groq-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userQuery,
          context: context,
          subject: subject,
          tutorName: tutorName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response || 'I apologize, but I encountered an error processing your question.';
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response using sources
      if (sources.length > 0) {
        let fallbackResponse = `Based on your uploaded documents, here's what I found:\n\n`;
        sources.forEach((source, index) => {
          fallbackResponse += `**From ${source.document.metadata.title}:**\n${source.relevantChunk}\n\n`;
        });
        fallbackResponse += `This information has a ${(sources[0].score * 100).toFixed(1)}% relevance to your question.`;
        return fallbackResponse;
      }
      
      return `I'd be happy to help with ${subject}! However, I couldn't find specific information in your uploaded documents. Try uploading relevant study materials first, or ask me a general question about ${subject}.`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Search user's documents for relevant information
      const sources = await searchUserDocuments(inputMessage);
      
      // Generate AI response with context from user's documents
      const aiResponse = await generateAIResponse(inputMessage, sources);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again or upload some study materials for me to reference.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">{tutorName}</h3>
            <p className="text-sm text-blue-100">{subject} • Document-Enhanced AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm">Accessing your documents</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {message.sender === 'ai' ? (
                  <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                ) : (
                  <User className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Show sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Search className="w-3 h-3" />
                        Sources from your documents:
                      </div>
                      {message.sources.map((source, index) => (
                        <div key={index} className="bg-white/50 p-2 rounded border-l-2 border-blue-400">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{source.document.metadata.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {(source.score * 100).toFixed(1)}% match
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {source.relevantChunk.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Searching your documents...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${tutorName} about your uploaded ${subject} materials...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick suggestions */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <Lightbulb className="w-3 h-3" />
          <span>Try: "Explain [topic] from my notes" or "Summarize chapter [X]"</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAITutor;
