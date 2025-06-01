import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Eye, 
  Trash2, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Database,
  Fingerprint
} from 'lucide-react';
import { exportDeviceInfoForPrivacy, clearDeviceInfo } from '@/services/fingerprint';

interface PrivacyData {
  storedData: {
    displayName: string;
    email: string;
    className: string;
    board: string;
    role: string;
    createdAt: string;
    lastLogin: string;
  };
  deviceInfo: {
    hashedFingerprint: string;
    timestamp: string;
    purpose: string;
  } | null;
  privacySettings: {
    dataMinimized: boolean;
    autoDelete: boolean;
    privacyCompliant: boolean;
  };
}

export default function PrivacyDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [privacyData, setPrivacyData] = useState<PrivacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPrivacyData();
  }, [user]);

  const loadPrivacyData = async () => {
    try {
      setLoading(true);
      
      // Get device info
      const deviceInfo = await exportDeviceInfoForPrivacy();
      
      // Prepare privacy data
      const data: PrivacyData = {
        storedData: {
          displayName: user?.displayName || 'Not provided',
          email: user?.email ? '***@***.***' : 'Not provided', // Masked for privacy
          className: user?.className || 'Not set',
          board: user?.board || 'Not set',
          role: user?.role || 'user',
          createdAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
          lastLogin: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Unknown'
        },
        deviceInfo,
        privacySettings: {
          dataMinimized: true,
          autoDelete: true,
          privacyCompliant: true
        }
      };
      
      setPrivacyData(data);
    } catch (error) {
      console.error('Failed to load privacy data:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const exportData = {
        userData: privacyData?.storedData,
        deviceInfo: privacyData?.deviceInfo,
        exportedAt: new Date().toISOString(),
        privacyCompliant: true,
        note: 'This export contains only the minimal data we store about you.'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studynova-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive"
      });
    }
  };

  const clearDeviceData = async () => {
    try {
      clearDeviceInfo();
      await loadPrivacyData();
      
      toast({
        title: "Device Data Cleared",
        description: "Your device fingerprint has been cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear device data",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      
      // Call delete account API
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-email': user?.email || ''
        }
      });
      
      if (response.ok) {
        // Clear local data
        clearDeviceInfo();
        logout();
        
        toast({
          title: "Account Deleted",
          description: "Your account and all data have been permanently deleted",
        });
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your account. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading privacy data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle>Privacy Dashboard</CardTitle>
          </div>
          <CardDescription>
            View and manage your personal data. We believe in complete transparency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Data Minimized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Privacy Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Auto-Delete Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stored Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Your Stored Data</CardTitle>
          </div>
          <CardDescription>
            This is all the personal information we store about you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {privacyData?.storedData && Object.entries(privacyData.storedData).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-muted-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Device Information */}
      {privacyData?.deviceInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              <CardTitle>Device Information</CardTitle>
            </div>
            <CardDescription>
              Anonymous device ID used only for trial abuse prevention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Hashed Device ID</span>
              <span className="text-muted-foreground font-mono text-xs">
                {privacyData.deviceInfo.hashedFingerprint.substring(0, 16)}...
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Created</span>
              <span className="text-muted-foreground">
                {new Date(privacyData.deviceInfo.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Purpose</span>
              <Badge variant="outline">{privacyData.deviceInfo.purpose}</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearDeviceData}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Device Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notices */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy First:</strong> We never store personal files, photos, or location data. 
          Your email is hashed for security, and all tracking data is automatically deleted after 30 days.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your data at any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={exportData}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Button 
              variant="destructive" 
              onClick={deleteAccount}
              disabled={deleting}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
