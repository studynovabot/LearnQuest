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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Textbook Connector
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connect" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>Connect Textbooks</span>
            </TabsTrigger>
            <TabsTrigger value="my-books" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>My Textbooks</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your textbooks to get AI-powered summaries, study guides, and practice questions.
              </p>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg p-6 bg-muted/50">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Or drag and drop PDF textbooks here</span>
              </div>
              
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Searching for textbooks...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Search Results</h3>
                  
                  <div className="space-y-3">
                    {searchResults.map((book) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card"
                      >
                        {book.thumbnail && (
                          <img 
                            src={book.thumbnail} 
                            alt={book.title} 
                            className="w-12 h-16 object-cover rounded-md"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{book.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {book.author} • {book.subject} • {book.chapters} chapters
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleConnect(book)}
                          disabled={isConnecting}
                          className="flex-shrink-0"
                        >
                          {isConnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
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
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your connected textbooks are available for AI-powered learning.
              </p>
              
              {connectedBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg">
                  <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No textbooks connected yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("connect")}
                  >
                    Connect Your First Textbook
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card"
                    >
                      {book.thumbnail && (
                        <img 
                          src={book.thumbnail} 
                          alt={book.title} 
                          className="w-16 h-20 object-cover rounded-md"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{book.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {book.author} • {book.subject}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {book.chapters} chapters available
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="w-full text-muted-foreground hover:text-destructive"
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
    </Card>
  );
};

export default TextbookConnector;