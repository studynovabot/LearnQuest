import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  User, 
  Shield, 
  Lock,
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Mail,
  GraduationCap,
  BookOpen,
  Settings as SettingsIcon,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'wouter';

interface UserProfile {
  displayName: string;
  email: string;
  className: string;
  board: string;
  role: string;
  isPro: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    className: '',
    board: '',
    role: 'user',
    isPro: false
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    dataMinimization: true,
    analyticsOptOut: false,
    marketingEmails: false,
    securityNotifications: true
  });

  // Load user data on component mount or when user changes
  useEffect(() => {
    if (user) {
      console.log('Updating profile state from user data:', user);
      setProfile({
        displayName: user.displayName || '',
        email: user.email || '',
        className: user.className || '',
        board: user.board || '',
        role: user.role || 'user',
        isPro: user.isPro || false,
        createdAt: user.createdAt?.toString(),
        lastLogin: user.lastLogin?.toString()
      });
    }
  }, [user]); // This will re-run whenever the user object changes

  // Educational boards and classes
  const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'];
  const classes = ['6', '7', '8', '9', '10', '11', '12', 'Graduate', 'Post-Graduate'];

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      console.log('Updating profile with data:', {
        displayName: profile.displayName,
        className: profile.className,
        board: profile.board
      });
      
      // Use the apiRequest function instead of fetch
      let response = await apiRequest('PUT', '/api/user-profile', {
        displayName: profile.displayName,
        className: profile.className,
        board: profile.board
      });

      // Check if we got a 404 (user not found) error
      if (response.status === 404) {
        console.log('User not found, retrying after a short delay...');
        
        // Wait a moment for the user to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the request
        response = await apiRequest('PUT', '/api/user-profile', {
          displayName: profile.displayName,
          className: profile.className,
          board: profile.board
        });
      }

      // Check if response is OK
      await throwIfResNotOk(response);
      
      // Parse the response
      const result = await response.json();
      console.log('Profile update successful:', result);
      
      // Update the user in localStorage directly
      if (user && result.user) {
        try {
          // Get the current user from localStorage
          const storedUserStr = localStorage.getItem('user');
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            
            // Update the user with the new profile data
            const updatedUser = {
              ...storedUser,
              displayName: result.user.displayName || storedUser.displayName,
              className: result.user.className || storedUser.className,
              board: result.user.board || storedUser.board,
              updatedAt: new Date()
            };
            
            // Save the updated user back to localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('Updated user in localStorage:', updatedUser);
          }
        } catch (error) {
          console.error('Error updating user in localStorage:', error);
        }
      }
      
      // Refresh user data from the server
      await refreshUser();
      
      // Update the local profile state with the new data
      if (user) {
        setProfile({
          ...profile,
          displayName: result.user.displayName || profile.displayName,
          className: result.user.className || profile.className,
          board: result.user.board || profile.board
        });
      }
      
      // Show success message
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Helper function to throw an error if the response is not OK
  async function throwIfResNotOk(res: Response) {
    if (!res.ok) {
      let errorMessage = `Error ${res.status}: Failed to update profile`;
      try {
        const text = await res.text();
        console.error("Response error details:", {
          status: res.status,
          statusText: res.statusText,
          body: text,
        });
        
        if (text && text.length > 0) {
          try {
            // Try to parse as JSON
            const errorData = JSON.parse(text);
            
            // Handle the new error format
            if (errorData.error && typeof errorData.error === 'object') {
              errorMessage = errorData.error.message || errorMessage;
              
              // Include details if available
              if (errorData.error.details) {
                errorMessage += `: ${errorData.error.details}`;
                
                // Special handling for specific errors
                if (errorData.error.details && errorData.error.details.includes("Missing or insufficient permissions")) {
                  errorMessage = "Profile update failed: You don't have permission to update your profile. This may be due to Firebase security rules when testing locally.";
                }
                
                // Handle user not found error
                if (errorData.error.code === "404" && errorData.error.message === "User not found") {
                  errorMessage = "Your profile is being created. Please wait a moment and try again.";
                }
              }
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // If not JSON, use the text as is
            errorMessage = text;
          }
        }
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      
      throw new Error(errorMessage);
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast({
        title: 'Weak Password',
        description: 'Password must contain uppercase, lowercase, and numbers.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Changing password...');
      
      // Use the apiRequest function instead of fetch
      const response = await apiRequest('POST', '/api/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Check if response is OK
      await throwIfResNotOk(response);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: 'Password Change Failed',
        description: error instanceof Error ? error.message : 'Failed to change password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Deleting account...');
      
      // Use the apiRequest function instead of fetch
      const response = await apiRequest('DELETE', '/api/delete-account');

      // Check if response is OK
      await throwIfResNotOk(response);
      
      // Show success message
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Deletion Failed',
        description: error instanceof Error ? error.message : 'Failed to delete your account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to access settings.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-4xl p-6 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy & Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and academic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="pl-10 bg-muted"
                        placeholder="Email cannot be changed"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="className">Class/Grade</Label>
                    <Select value={profile.className} onValueChange={(value) => setProfile({ ...profile, className: value })}>
                      <SelectTrigger>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select your class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="board">Educational Board</Label>
                    <Select value={profile.board} onValueChange={(value) => setProfile({ ...profile, board: value })}>
                      <SelectTrigger>
                        <BookOpen className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select your board" />
                      </SelectTrigger>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Account Status</span>
                      <Badge variant={profile.isPro ? "default" : "secondary"}>
                        {profile.isPro ? "Pro" : "Free"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.isPro ? "You have access to all premium features" : "Upgrade to Pro for unlimited access"}
                    </p>
                    {!profile.isPro && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/subscription">Upgrade to Pro</Link>
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Member Since</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Last Login</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter your current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter your new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must contain uppercase, lowercase, and numbers (minimum 6 characters)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm your new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Account Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Minimization</Label>
                      <p className="text-sm text-muted-foreground">
                        Only collect essential data for app functionality
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.dataMinimization}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, dataMinimization: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics Opt-out</Label>
                      <p className="text-sm text-muted-foreground">
                        Disable anonymous usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.analyticsOptOut}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, analyticsOptOut: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and updates
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, marketingEmails: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about security-related events
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.securityNotifications}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, securityNotifications: checked })}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={loading}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers including:
                          <br />� All your chat history
                          <br />� Flash notes and saved content
                          <br />� Account preferences and settings
                          <br />� Subscription information
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAccountDeletion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {loading ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
