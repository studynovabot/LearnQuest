import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from '@/components/ui/premium-card';
import { PremiumInput, PremiumSelect } from '@/components/ui/premium-form';
import { GradientButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrivacyDashboard from '@/components/privacy/PrivacyDashboard';
import { UserIcon, SettingsIcon, ShieldIcon, CrownIcon, PaletteIcon } from '@/components/ui/icons';
import { Save, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { ThemePreviewGrid, CurrentThemeDisplay } from '@/components/ui/theme-preview';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    className: user?.className || '',
    board: user?.board || 'CBSE'
  });

  // Handle URL parameters for tab switching
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'privacy', 'themes'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.id
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await refreshUser();
        toast({
          title: 'Settings saved',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings | Nova AI - Your AI Study Buddy</title>
        <meta name="description" content="Manage your profile settings and preferences on Nova AI." />
      </Helmet>

      <motion.div
        className="max-w-4xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-3 gradient-primary rounded-2xl shadow-glow">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground text-lg">Manage your profile, privacy, and preferences</p>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <PaletteIcon className="h-4 w-4" />
              Themes
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Premium Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
          <PremiumCard variant="glass" glow={true}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-500" />
                </div>
                Profile Information
              </PremiumCardTitle>
              <PremiumCardDescription className="text-base">
                Update your display name and personal information
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent className="space-y-6">
              <PremiumInput
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter your display name"
                variant="glass"
                icon={<UserIcon size={18} />}
              />
              <p className="text-sm text-muted-foreground ml-1">
                This name will be shown on the leaderboard and in chat
              </p>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Premium Academic Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard variant="glass" glow={true}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-green-500" />
                </div>
                Academic Information
              </PremiumCardTitle>
              <PremiumCardDescription className="text-base">
                Set your class and educational board for personalized content
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent className="space-y-6">
              <PremiumInput
                label="Class"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g., 10th Grade, Class XII"
                variant="glass"
                icon={<GraduationCap size={18} />}
              />

              <PremiumSelect
                label="Educational Board"
                value={formData.board}
                onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                options={[
                  { value: "CBSE", label: "CBSE" },
                  { value: "ICSE", label: "ICSE" },
                  { value: "State Board", label: "State Board" },
                  { value: "IB", label: "International Baccalaureate (IB)" },
                  { value: "Other", label: "Other" }
                ]}
                variant="glass"
              />
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Premium Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard variant="glass" glow={true}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ShieldIcon className="h-6 w-6 text-purple-500" />
                </div>
                Account Information
              </PremiumCardTitle>
              <PremiumCardDescription className="text-base">
                Your account details and statistics
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  className="glass-card p-4 rounded-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                    <Label className="text-sm font-semibold">Username</Label>
                  </div>
                  <p className="text-foreground font-medium">{user?.email}</p>
                </motion.div>

                <motion.div
                  className="glass-card p-4 rounded-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CrownIcon className="h-5 w-5 text-yellow-500" />
                    <Label className="text-sm font-semibold">Account Type</Label>
                  </div>
                  <p className={cn(
                    "font-medium",
                    user?.isPro ? "text-yellow-500" : "text-muted-foreground"
                  )}>
                    {user?.isPro ? 'Pro' : 'Free'}
                  </p>
                </motion.div>

                <motion.div
                  className="glass-card p-4 rounded-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldIcon className="h-5 w-5 text-green-500" />
                    <Label className="text-sm font-semibold">Role</Label>
                  </div>
                  <p className="text-foreground font-medium capitalize">{user?.role || 'user'}</p>
                </motion.div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

            {/* Premium Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end pt-4"
            >
              <GradientButton
                gradient="primary"
                size="lg"
                onClick={handleSave}
                disabled={isLoading}
                className="min-w-[160px] shadow-glow"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Save Changes
                  </div>
                )}
              </GradientButton>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <PrivacyDashboard />
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            {/* Themes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard variant="glass" glow={true}>
            <PremiumCardHeader>
              <PremiumCardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                  <PaletteIcon className="h-6 w-6 text-purple-500" />
                </div>
                Themes & Appearance
              </PremiumCardTitle>
              <PremiumCardDescription className="text-base">
                Customize your LearnQuest visual experience
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent className="space-y-6">
              {/* Current Theme Display */}
              <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                    <PaletteIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Current Theme</h3>
                    <CurrentThemeDisplay className="mt-1" />
                  </div>
                </div>
                <Link href="/themes">
                  <GradientButton
                    gradient="primary"
                    size="default"
                    className="shadow-glow"
                  >
                    Customize Themes
                  </GradientButton>
                </Link>
              </div>

              {/* Quick Theme Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Quick Preview</h4>
                <ThemePreviewGrid
                  columns={6}
                  size="sm"
                  showNames={false}
                  showDescriptions={false}
                  interactive={true}
                />
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default Settings;
