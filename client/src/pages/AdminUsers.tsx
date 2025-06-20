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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  UserIcon, 
  Users, 
  Crown, 
  Star, 
  MoreHorizontal, 
  Trash, 
  Shield, 
  Edit, 
  Ban, 
  Check, 
  UserCog 
} from 'lucide-react';

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
  isBlocked?: boolean;
  isMockData?: boolean; // Flag to identify mock data
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
  
  // State for user management
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Form state
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editPlan, setEditPlan] = useState<'free' | 'pro' | 'goat'>('free');
  const [editPlanStatus, setEditPlanStatus] = useState<'active' | 'trial' | 'expired' | 'canceled'>('active');
  
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
        ...(subscriptionFilter && subscriptionFilter !== 'all' && { subscriptionPlan: subscriptionFilter }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter })
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
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV || config.enableMockFallback) {
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
        setUsingMockData(true); // Set the flag that we're using mock data
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
  
  // Handle editing user credentials
  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditDisplayName(userToEdit.displayName || '');
    setEditEmail(userToEdit.email || '');
    setIsEditDialogOpen(true);
  };
  
  // Handle changing user role
  const handleChangeRole = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditRole(userToEdit.role || 'user');
    setIsRoleDialogOpen(true);
  };
  
  // Handle changing user subscription plan
  const handleChangePlan = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditPlan(userToEdit.subscriptionPlan || 'free');
    setEditPlanStatus(userToEdit.subscriptionStatus || 'active');
    setIsPlanDialogOpen(true);
  };
  
  // Handle saving user credentials
  const handleSaveCredentials = async () => {
    if (!selectedUser) return;
    
    setIsActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      // Check if this is mock data
      if (selectedUser.isMockData || usingMockData) {
        console.log('Updating credentials for mock user:', selectedUser.id);
        
        // Just update the local state without API call
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, displayName: editDisplayName, email: editEmail } 
            : u
        ));
        
        setActionSuccess('Mock user credentials updated successfully');
        
        // Close the dialog after a short delay
        setTimeout(() => {
          setIsEditDialogOpen(false);
        }, 1500);
        
        setIsActionLoading(false);
        return;
      }
      
      // Real API call for non-mock users
      const response = await fetch(`${config.apiUrl}/admin-users?action=update-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-User-ID': user?.id || '',
          'X-User-Email': user?.email || ''
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          displayName: editDisplayName,
          email: editEmail
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user credentials');
      }
      
      const result = await response.json();
      setActionSuccess(result.message || 'User credentials updated successfully');
      
      // Update the user in the local state
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, displayName: editDisplayName, email: editEmail } 
          : u
      ));
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setIsEditDialogOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating user credentials:', error);
      setActionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Handle saving user role
  const handleSaveRole = async () => {
    if (!selectedUser) return;
    
    setIsActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      // Check if this is mock data
      if (selectedUser.isMockData || usingMockData) {
        console.log('Updating role for mock user:', selectedUser.id, 'to', editRole);
        
        // Just update the local state without API call
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, role: editRole } 
            : u
        ));
        
        setActionSuccess('Mock user role updated successfully');
        
        // Close the dialog after a short delay
        setTimeout(() => {
          setIsRoleDialogOpen(false);
        }, 1500);
        
        setIsActionLoading(false);
        return;
      }
      
      // Real API call for non-mock users
      const response = await fetch(`${config.apiUrl}/admin-users?action=update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-User-ID': user?.id || '',
          'X-User-Email': user?.email || ''
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
      
      const result = await response.json();
      setActionSuccess(result.message || 'User role updated successfully');
      
      // Update the user in the local state
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, role: editRole } 
          : u
      ));
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setIsRoleDialogOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating user role:', error);
      setActionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Handle saving user subscription plan
  const handleSavePlan = async () => {
    if (!selectedUser) return;
    
    setIsActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      // Create a subscription expiry date based on plan and status
      let expiryDate = new Date();
      if (editPlanStatus === 'trial') {
        expiryDate.setDate(expiryDate.getDate() + 7); // 7 day trial
      } else if (editPlanStatus === 'active') {
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription
      } else {
        expiryDate.setDate(expiryDate.getDate() - 1); // Already expired
      }
      
      // Check if this is mock data
      if (selectedUser.isMockData || usingMockData) {
        console.log('Updating subscription for mock user:', selectedUser.id, 'to', editPlan, editPlanStatus);
        
        // Just update the local state without API call
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { 
                ...u, 
                subscriptionPlan: editPlan, 
                subscriptionStatus: editPlanStatus,
                subscriptionExpiry: expiryDate.toISOString(),
                isPro: editPlan !== 'free'
              } 
            : u
        ));
        
        // Update user stats if available
        if (userStats) {
          const oldPlan = selectedUser.subscriptionPlan || 'free';
          const newPlan = editPlan;
          
          if (oldPlan !== newPlan) {
            const statsUpdate = { ...userStats };
            
            // Decrement old plan count
            if (oldPlan === 'pro') statsUpdate.proUsers--;
            else if (oldPlan === 'goat') statsUpdate.goatUsers--;
            else statsUpdate.freeUsers--;
            
            // Increment new plan count
            if (newPlan === 'pro') statsUpdate.proUsers++;
            else if (newPlan === 'goat') statsUpdate.goatUsers++;
            else statsUpdate.freeUsers++;
            
            // Update conversion rate
            statsUpdate.conversionRate = ((statsUpdate.proUsers + statsUpdate.goatUsers) / statsUpdate.totalUsers * 100).toFixed(2);
            
            setUserStats(statsUpdate);
          }
        }
        
        setActionSuccess('Mock user subscription updated successfully');
        
        // Close the dialog after a short delay
        setTimeout(() => {
          setIsPlanDialogOpen(false);
        }, 1500);
        
        setIsActionLoading(false);
        return;
      }
      
      const response = await fetch(`${config.apiUrl}/admin-users?action=update-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-User-ID': user?.id || '',
          'X-User-Email': user?.email || ''
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          subscriptionPlan: editPlan,
          subscriptionStatus: editPlanStatus,
          subscriptionExpiry: expiryDate.toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user subscription');
      }
      
      const result = await response.json();
      setActionSuccess(result.message || 'User subscription updated successfully');
      
      // Update the user in the local state
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              subscriptionPlan: editPlan, 
              subscriptionStatus: editPlanStatus,
              subscriptionExpiry: expiryDate.toISOString(),
              isPro: editPlan !== 'free'
            } 
          : u
      ));
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setIsPlanDialogOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating user subscription:', error);
      setActionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Handle deleting a user
  const handleDeleteUser = async (userToDelete: User) => {
    setIsActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      // Check if this is mock data
      if (userToDelete.isMockData || usingMockData) {
        console.log('Deleting mock user:', userToDelete.id);
        
        // Just remove from local state without API call
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        
        // Update user stats if available
        if (userStats) {
          setUserStats({
            ...userStats,
            totalUsers: userStats.totalUsers - 1,
            proUsers: userToDelete.subscriptionPlan === 'pro' ? userStats.proUsers - 1 : userStats.proUsers,
            goatUsers: userToDelete.subscriptionPlan === 'goat' ? userStats.goatUsers - 1 : userStats.goatUsers,
            freeUsers: userToDelete.subscriptionPlan === 'free' ? userStats.freeUsers - 1 : userStats.freeUsers
          });
        }
        
        setActionSuccess('Mock user deleted successfully');
        setIsActionLoading(false);
        return;
      }
      
      // Real API call for non-mock users
      const response = await fetch(`${config.apiUrl}/admin-users?action=delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-User-ID': user?.id || '',
          'X-User-Email': user?.email || ''
        },
        body: JSON.stringify({
          userId: userToDelete.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      const result = await response.json();
      setActionSuccess(result.message || 'User deleted successfully');
      
      // Remove the user from the local state
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      // Update user stats if available
      if (userStats) {
        setUserStats({
          ...userStats,
          totalUsers: userStats.totalUsers - 1,
          proUsers: userToDelete.subscriptionPlan === 'pro' ? userStats.proUsers - 1 : userStats.proUsers,
          goatUsers: userToDelete.subscriptionPlan === 'goat' ? userStats.goatUsers - 1 : userStats.goatUsers,
          freeUsers: userToDelete.subscriptionPlan === 'free' ? userStats.freeUsers - 1 : userStats.freeUsers
        });
      }
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setActionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Handle blocking/unblocking a user
  const handleToggleBlock = async (userToToggle: User, blockStatus: boolean) => {
    setIsActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    
    try {
      // Check if this is mock data
      if (userToToggle.isMockData || usingMockData) {
        console.log(`${blockStatus ? 'Blocking' : 'Unblocking'} mock user:`, userToToggle.id);
        
        // Just update the local state without API call
        setUsers(prev => prev.map(u => 
          u.id === userToToggle.id 
            ? { ...u, isBlocked: blockStatus } 
            : u
        ));
        
        setActionSuccess(`Mock user ${blockStatus ? 'blocked' : 'unblocked'} successfully`);
        setIsActionLoading(false);
        return;
      }
      
      // Real API call for non-mock users
      const response = await fetch(`${config.apiUrl}/admin-users?action=toggle-block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-User-ID': user?.id || '',
          'X-User-Email': user?.email || ''
        },
        body: JSON.stringify({
          userId: userToToggle.id,
          blocked: blockStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${blockStatus ? 'block' : 'unblock'} user`);
      }
      
      const result = await response.json();
      setActionSuccess(result.message || `User ${blockStatus ? 'blocked' : 'unblocked'} successfully`);
      
      // Update the user in the local state
      setUsers(prev => prev.map(u => 
        u.id === userToToggle.id 
          ? { ...u, isBlocked: blockStatus } 
          : u
      ));
      
    } catch (error) {
      console.error(`Error ${blockStatus ? 'blocking' : 'unblocking'} user:`, error);
      setActionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Track if we're using mock data
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Generate mock users for fallback
  const generateMockUsers = (count: number): User[] => {
    // Set the flag that we're using mock data
    setUsingMockData(true);
    
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
        lastLogin: lastLoginDate.toISOString(),
        isBlocked: Math.random() > 0.9, // 10% chance of being blocked
        isMockData: true // Flag to identify mock data
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
        {usingMockData && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-bold">Mock Data Mode</p>
            </div>
            <p className="text-sm mt-1">
              You are viewing mock data. All operations will only affect the local state and won't make real API calls.
              This is typically shown when the backend API is unavailable.
            </p>
          </div>
        )}
        
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
                          <SelectItem value="all">All Plans</SelectItem>
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
                          <SelectItem value="all">All Roles</SelectItem>
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
                      {(typeof import.meta !== 'undefined' && import.meta.env?.DEV || config.enableMockFallback) && (
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className={user.isBlocked ? 'opacity-60' : ''}>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center">
                                  {user.displayName}
                                  {user.isBlocked && (
                                    <Badge variant="destructive" className="ml-2">Blocked</Badge>
                                  )}
                                </div>
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
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading}>
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                                      <UserCog className="h-4 w-4 mr-2" />
                                      Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangePlan(user)}>
                                      <Star className="h-4 w-4 mr-2" />
                                      Change Plan
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    {user.isBlocked ? (
                                      <DropdownMenuItem onClick={() => handleToggleBlock(user, false)}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Unblock User
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleToggleBlock(user, true)}>
                                        <Ban className="h-4 w-4 mr-2" />
                                        Block User
                                      </DropdownMenuItem>
                                    )}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Trash className="h-4 w-4 mr-2" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this user? This action cannot be undone.
                                            <div className="mt-2 p-2 border rounded bg-slate-50 dark:bg-slate-900">
                                              <div><strong>{user.displayName}</strong></div>
                                              <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteUser(user)}
                                            className="bg-red-500 hover:bg-red-600">
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      {/* User Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user profile information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right font-medium">
                Name
              </label>
              <Input
                id="name"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          {actionSuccess && (
            <div className="bg-green-100 text-green-800 p-2 rounded text-sm">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="bg-red-100 text-red-800 p-2 rounded text-sm">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCredentials} disabled={isActionLoading}>
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right font-medium">
                Role
              </label>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value as 'user' | 'admin')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {actionSuccess && (
            <div className="bg-green-100 text-green-800 p-2 rounded text-sm">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="bg-red-100 text-red-800 p-2 rounded text-sm">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={isActionLoading}>
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Plan Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the user's subscription plan and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="plan" className="text-right font-medium">
                Plan
              </label>
              <Select
                value={editPlan}
                onValueChange={(value) => setEditPlan(value as 'free' | 'pro' | 'goat')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="goat">Goat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right font-medium">
                Status
              </label>
              <Select
                value={editPlanStatus}
                onValueChange={(value) => setEditPlanStatus(value as 'active' | 'trial' | 'expired' | 'canceled')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {actionSuccess && (
            <div className="bg-green-100 text-green-800 p-2 rounded text-sm">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="bg-red-100 text-red-800 p-2 rounded text-sm">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={isActionLoading}>
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;