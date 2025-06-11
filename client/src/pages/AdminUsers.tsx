import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useUserContext } from '@/context/UserContext';
import { useLocation } from 'wouter';
import { config } from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, RefreshCw, UserIcon, Users, Crown, Star } from 'lucide-react';

interface User {
  id: string;
  email: string;
  displayName: string;
  isPro: boolean;
  subscriptionPlan?: 'free' | 'pro' | 'goat';
  subscriptionStatus?: 'active' | 'trial' | 'expired' | 'canceled';
  subscriptionExpiry?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  proUsers: number;
  goatUsers: number;
  newUsers: number;
  freeUsers: number;
  conversionRate: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const AdminUsers: React.FC = () => {
  const { user } = useUserContext();
  const [, setLocation] = useLocation();
  
  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  });
  
  // State for filters
  const [search, setSearch] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('lastLogin');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for user stats
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || 
                 user?.email === 'thakurranveersingh505@gmail.com' || 
                 user?.email === 'tradingproffical@gmail.com';
  
  // Fetch users data
  const fetchUsers = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(subscriptionFilter && { subscriptionPlan: subscriptionFilter }),
        ...(roleFilter && { role: roleFilter })
      });
      
      console.log(`Fetching users from: ${config.apiUrl}/admin-users?${queryParams}`);
      const response = await fetch(`${config.apiUrl}/admin-users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
          'X-User-ID': user.id,
          'X-User-Email': user.email
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}`;
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
          if (errorJson.error) {
            errorMessage += ` - ${errorJson.error}`;
          }
        } catch (e) {
          // If not JSON, use the text as is if it exists
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
        setPagination(data.pagination || { total: data.users.length, page: 1, limit: 50, pages: 1 });
        
        if (data.fallback) {
          setError(`Using limited data due to error: ${data.originalError}`);
        }
      } else {
        console.error('Invalid API response format:', data);
        throw new Error('Invalid API response format: users array not found');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      
      // Create mock data as fallback if in development or if explicitly enabled
      if (import.meta.env.DEV || config.enableMockFallback) {
        console.log('Using mock data as fallback');
        const mockUsers = generateMockUsers(10);
        setUsers(mockUsers);
        setPagination({
          total: mockUsers.length,
          page: 1,
          limit: 50,
          pages: 1
        });
        setError('Using mock data (API request failed)');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    setStatsLoading(true);
    
    try {
      const response = await fetch(`${config.apiUrl}/admin-users?action=stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
          'X-User-ID': user.id,
          'X-User-Email': user.email
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (isAdmin) {
      console.log('Admin user detected, fetching data...');
      fetchUsers();
      fetchUserStats();
    } else {
      console.log('Non-admin user detected, redirecting...');
      // Redirect non-admin users
      setLocation('/app');
    }
  }, [isAdmin, user?.id]);
  
  // Log when component mounts
  useEffect(() => {
    console.log('AdminUsers component mounted');
    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);
  }, []);
  
  // Fetch when filters or pagination changes
  useEffect(() => {
    if (isAdmin && user?.id) {
      fetchUsers();
    }
  }, [pagination.page, sortBy, sortOrder, subscriptionFilter, roleFilter]);
  
  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchUsers();
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Generate mock users for fallback
  const generateMockUsers = (count: number): User[] => {
    const subscriptionPlans: Array<'free' | 'pro' | 'goat'> = ['free', 'pro', 'goat'];
    const subscriptionStatuses: Array<'active' | 'trial' | 'expired' | 'canceled'> = ['active', 'trial', 'expired', 'canceled'];
    const roles: Array<'user' | 'admin'> = ['user', 'admin'];
    
    return Array.from({ length: count }).map((_, index) => {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365)); // Random date within the last year
      
      const lastLoginDate = new Date(createdDate);
      lastLoginDate.setDate(lastLoginDate.getDate() + Math.floor(Math.random() * (new Date().getDate() - createdDate.getDate())));
      
      const subscriptionPlan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
      const isPro = subscriptionPlan !== 'free';
      
      return {
        id: `mock-user-${index + 1}`,
        email: `user${index + 1}@example.com`,
        displayName: `Test User ${index + 1}`,
        isPro,
        subscriptionPlan,
        subscriptionStatus: subscriptionStatuses[Math.floor(Math.random() * subscriptionStatuses.length)],
        subscriptionExpiry: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(), // Random date in the next 90 days
        role: index === 0 ? 'admin' : roles[Math.floor(Math.random() * roles.length)],
        createdAt: createdDate.toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: lastLoginDate.toISOString()
      };
    });
  };
  
  // Get subscription badge
  const getSubscriptionBadge = (user: User) => {
    const plan = user.subscriptionPlan || (user.isPro ? 'pro' : 'free');
    const status = user.subscriptionStatus || 'active';
    
    if (plan === 'goat') {
      return (
        <Badge className="bg-purple-600">
          <Crown className="w-3 h-3 mr-1" />
          Goat
        </Badge>
      );
    } else if (plan === 'pro') {
      return (
        <Badge className="bg-blue-600">
          <Star className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-slate-500 border-slate-300">
          Free
        </Badge>
      );
    }
  };
  
  // Get role badge
  const getRoleBadge = (user: User) => {
    if (user.role === 'admin') {
      return (
        <Badge className="bg-orange-500">
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-slate-500 border-slate-300">
        User
      </Badge>
    );
  };
  
  // Render pagination controls
  const renderPagination = () => {
    const { page, pages } = pagination;
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            let pageNum;
            
            if (pages <= 5) {
              // Show all pages if 5 or fewer
              pageNum = i + 1;
            } else if (page <= 3) {
              // Near the start
              if (i < 4) {
                pageNum = i + 1;
              } else {
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
            } else if (page >= pages - 2) {
              // Near the end
              if (i === 0) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              } else {
                pageNum = pages - (4 - i);
              }
            } else {
              // In the middle
              if (i === 0) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              } else if (i === 4) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              } else {
                pageNum = page + (i - 2);
              }
            }
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={page === pageNum}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < pages && handlePageChange(page + 1)}
              className={page >= pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  // If not admin, don't render the page
  if (!isAdmin) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Admin - User Management | Study Nova</title>
      </Helmet>
      
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all registered users
            </p>
          </div>
          
          <Button 
            onClick={() => {
              fetchUsers();
              fetchUserStats();
            }}
            variant="outline"
            className="self-start"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User List
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Crown className="w-4 h-4 mr-2" />
              User Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter and search users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by name or email..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Select
                        value={subscriptionFilter}
                        onValueChange={setSubscriptionFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Subscription" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Plans</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="goat">Goat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={roleFilter}
                        onValueChange={setRoleFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Roles</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={sortBy}
                        onValueChange={setSortBy}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lastLogin">Last Login</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                          <SelectItem value="displayName">Name</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Select
                        value={sortOrder}
                        onValueChange={setSortOrder}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Newest First</SelectItem>
                          <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={handleSearch}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Users Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  {pagination.total} total users • Page {pagination.page} of {pagination.pages}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error Loading Users</h3>
                      <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={fetchUsers}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                      {(import.meta.env.DEV || config.enableMockFallback) && (
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            const mockUsers = generateMockUsers(10);
                            setUsers(mockUsers);
                            setPagination({
                              total: mockUsers.length,
                              page: 1,
                              limit: 50,
                              pages: 1
                            });
                            setError('Using mock data');
                          }}
                        >
                          Use Mock Data
                        </Button>
                      )}
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Login</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.displayName}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {getSubscriptionBadge(user)}
                                {user.subscriptionExpiry && (
                                  <div className="text-xs text-muted-foreground">
                                    Expires: {formatDate(user.subscriptionExpiry)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(user)}
                            </TableCell>
                            <TableCell>
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell>
                              {formatDate(user.lastLogin)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {/* Pagination */}
                {!loading && !error && users.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    {renderPagination()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">
                      {userStats?.totalUsers || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Users (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="text-3xl font-bold">
                        {userStats?.activeUsers || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userStats && userStats.totalUsers > 0 
                          ? `${((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% of total`
                          : '0% of total'
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">New Users (7d)</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">
                      {userStats?.newUsers || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="text-3xl font-bold">
                        {userStats?.conversionRate || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userStats?.proUsers || 0} Pro + {userStats?.goatUsers || 0} Goat users
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Subscription Distribution */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>
                  Breakdown of users by subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Free Users */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">Free</Badge>
                          <span>{userStats?.freeUsers || 0} users</span>
                        </div>
                        <span className="text-muted-foreground">
                          {userStats && userStats.totalUsers > 0 
                            ? `${((userStats.freeUsers / userStats.totalUsers) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                        <div 
                          className="bg-slate-400 h-2.5 rounded-full" 
                          style={{ 
                            width: userStats && userStats.totalUsers > 0 
                              ? `${(userStats.freeUsers / userStats.totalUsers) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Pro Users */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-blue-600 mr-2">Pro</Badge>
                          <span>{userStats?.proUsers || 0} users</span>
                        </div>
                        <span className="text-muted-foreground">
                          {userStats && userStats.totalUsers > 0 
                            ? `${((userStats.proUsers / userStats.totalUsers) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ 
                            width: userStats && userStats.totalUsers > 0 
                              ? `${(userStats.proUsers / userStats.totalUsers) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Goat Users */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Badge className="bg-purple-600 mr-2">Goat</Badge>
                          <span>{userStats?.goatUsers || 0} users</span>
                        </div>
                        <span className="text-muted-foreground">
                          {userStats && userStats.totalUsers > 0 
                            ? `${((userStats.goatUsers / userStats.totalUsers) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ 
                            width: userStats && userStats.totalUsers > 0 
                              ? `${(userStats.goatUsers / userStats.totalUsers) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminUsers;