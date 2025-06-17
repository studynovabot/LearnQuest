import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Check, 
  ExternalLink, 
  FileText, 
  Link as LinkIcon, 
  Loader2, 
  Plus, 
  Search, 
  Upload 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumCard } from "@/components/premium/PremiumCard";

interface ConnectedTextbook {
  id: string;
  title: string;
  author: string;
  subject: string;
  chapters: number;
  connected: boolean;
  thumbnail?: string;
}

const TextbookConnector = () => {
  const [activeTab, setActiveTab] = useState("connect");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchResults, setSearchResults] = useState<ConnectedTextbook[]>([]);
  const [connectedBooks, setConnectedBooks] = useState<ConnectedTextbook[]>([]);
  const { toast } = useToast();

  // Mock data for connected textbooks
  const mockConnectedBooks: ConnectedTextbook[] = [
    {
      id: "1",
      title: "Advanced Mathematics for High School",
      author: "Dr. Sarah Johnson",
      subject: "Mathematics",
      chapters: 12,
      connected: true,
      thumbnail: "https://via.placeholder.com/100x150/3b82f6/FFFFFF?text=Math"
    },
    {
      id: "2",
      title: "Principles of Physics",
      author: "Prof. Robert Chen",
      subject: "Physics",
      chapters: 15,
      connected: true,
      thumbnail: "https://via.placeholder.com/100x150/10b981/FFFFFF?text=Physics"
    }
  ];

  // Mock search results
  const mockSearchResults: ConnectedTextbook[] = [
    {
      id: "3",
      title: "Organic Chemistry Fundamentals",
      author: "Dr. Emily Rodriguez",
      subject: "Chemistry",
      chapters: 14,
      connected: false,
      thumbnail: "https://via.placeholder.com/100x150/ef4444/FFFFFF?text=Chemistry"
    },
    {
      id: "4",
      title: "World History: Modern Era",
      author: "Prof. James Wilson",
      subject: "History",
      chapters: 18,
      connected: false,
      thumbnail: "https://via.placeholder.com/100x150/f59e0b/FFFFFF?text=History"
    },
    {
      id: "5",
      title: "Introduction to Computer Science",
      author: "Dr. Lisa Park",
      subject: "Computer Science",
      chapters: 10,
      connected: false,
      thumbnail: "https://via.placeholder.com/100x150/8b5cf6/FFFFFF?text=CS"
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a textbook title, author, or ISBN to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleConnect = (book: ConnectedTextbook) => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      const updatedBook = { ...book, connected: true };
      setConnectedBooks([...connectedBooks, updatedBook]);
      
      // Remove from search results
      setSearchResults(searchResults.filter(b => b.id !== book.id));
      
      toast({
        title: "Textbook connected",
        description: `"${book.title}" has been connected to your account.`,
      });
      
      setIsConnecting(false);
    }, 1500);
  };

  const handleDisconnect = (bookId: string) => {
    setConnectedBooks(connectedBooks.filter(book => book.id !== bookId));
    
    toast({
      title: "Textbook disconnected",
      description: "The textbook has been removed from your account.",
    });
  };

  // Initialize connected books on first render
  useState(() => {
    setConnectedBooks(mockConnectedBooks);
  });

  return (
    <PremiumCard className="h-full">
      <CardHeader className="px-8 pt-8 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <BookOpen className="h-6 w-6 text-primary" />
          Textbook Connector
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <Tabs defaultValue="connect" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8 p-1">
            <TabsTrigger value="connect" className="flex items-center gap-2 py-3">
              <LinkIcon className="h-4 w-4" />
              <span>Connect Textbooks</span>
            </TabsTrigger>
            <TabsTrigger value="my-books" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span>My Textbooks</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect">
            <div className="space-y-6">
              <p className="text-base text-muted-foreground">
                Connect your textbooks to get AI-powered summaries, study guides, and practice questions.
              </p>
              
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 text-base rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                  className="py-6 px-6 rounded-xl"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-3 border border-dashed border-border/50 rounded-xl p-10 bg-muted/30">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-base text-muted-foreground">Or drag and drop PDF textbooks here</span>
              </div>
              
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
                  <p className="text-base text-muted-foreground">Searching for textbooks...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Search Results</h3>
                  
                  <div className="space-y-4">
                    {searchResults.map((book) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6 p-5 border border-border/50 rounded-xl bg-card/50"
                      >
                        {book.thumbnail && (
                          <img 
                            src={book.thumbnail} 
                            alt={book.title} 
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-lg truncate">{book.title}</h4>
                          <p className="text-base text-muted-foreground truncate">
                            {book.author} • {book.subject} • {book.chapters} chapters
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleConnect(book)}
                          disabled={isConnecting}
                          className="flex-shrink-0 py-5 px-5 rounded-xl"
                        >
                          {isConnecting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-5 w-5 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>
          
          <TabsContent value="my-books">
            <div className="space-y-6">
              <p className="text-base text-muted-foreground">
                Your connected textbooks are available for AI-powered learning.
              </p>
              
              {connectedBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/50 rounded-xl bg-muted/30">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
                  <p className="text-lg text-muted-foreground mb-6">No textbooks connected yet</p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setActiveTab("connect")}
                    className="py-6 px-8 rounded-xl"
                  >
                    Connect Your First Textbook
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {connectedBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-6 p-6 border border-border/50 rounded-xl bg-card/50"
                    >
                      {book.thumbnail && (
                        <img 
                          src={book.thumbnail} 
                          alt={book.title} 
                          className="w-20 h-28 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xl truncate">{book.title}</h4>
                        <p className="text-base text-muted-foreground truncate">
                          {book.author} • {book.subject}
                        </p>
                        <div className="flex items-center mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                            <Check className="h-4 w-4 mr-2" />
                            Connected
                          </span>
                          <span className="text-sm text-muted-foreground ml-3">
                            {book.chapters} chapters available
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <Button variant="outline" className="w-full py-5 px-5 rounded-xl">
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Open
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full py-5 px-5 rounded-xl text-muted-foreground hover:text-destructive"
                          onClick={() => handleDisconnect(book.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </PremiumCard>
  );
};

export default TextbookConnector;