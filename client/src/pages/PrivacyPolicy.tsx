import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Lock, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Globe,
  Users
} from 'lucide-react';
import { PrivacyTrustBadge } from '@/components/privacy/PrivacyBanner';

export default function PrivacyPolicy() {
  const lastUpdated = "January 2024";

  return (
    <>
      <Helmet>
        <title>Privacy Policy | Study Nova - Student Privacy First</title>
        <meta name="description" content="Study Nova's privacy-first policy. Learn how we protect student data with minimal collection, encryption, and automatic deletion." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <PrivacyTrustBadge size="md" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At Study Nova, student privacy isn't just a policy—it's our foundation. 
              We believe learning should be safe, secure, and completely private.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {lastUpdated}
            </p>
          </motion.div>

          {/* Quick Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Quick Summary:</strong> We collect only your email for verification, 
                use anonymous device IDs to prevent abuse, and automatically delete all data after 30 days. 
                No personal files, browsing history, or location data is ever accessed.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* What We Collect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <CardTitle>What We Collect</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-700 dark:text-green-400">✅ What We DO Collect</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Email address (hashed for security)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Display name you provide
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Anonymous device ID (for abuse prevention)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Learning progress (XP, unlocked features)
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-700 dark:text-red-400">❌ What We DON'T Collect</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                          Personal files or photos
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                          Location or GPS data
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                          Browsing history outside our app
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                          Camera or microphone access
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* How We Protect Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    <CardTitle>How We Protect Your Data</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Encryption</h4>
                      <p className="text-sm text-muted-foreground">
                        All data is encrypted using SHA256 hashing and secure protocols
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Auto-Delete</h4>
                      <p className="text-sm text-muted-foreground">
                        All tracking data automatically deleted after 30 days
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Minimal Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        We collect only what's absolutely necessary for the service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trial Abuse Prevention */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <CardTitle>Fair Trial System</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    To ensure fair access for all students, we use privacy-safe methods to prevent trial abuse:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">1</Badge>
                      <div>
                        <h4 className="font-medium">Email Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          Each email can start one free trial. Emails are hashed and cannot be reversed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">2</Badge>
                      <div>
                        <h4 className="font-medium">Anonymous Device ID</h4>
                        <p className="text-sm text-muted-foreground">
                          We generate a privacy-safe device identifier that doesn't contain personal information.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">3</Badge>
                      <div>
                        <h4 className="font-medium">Network Protection</h4>
                        <p className="text-sm text-muted-foreground">
                          We track anonymized network ranges (not full IPs) to prevent mass abuse.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle>Your Privacy Rights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Export Your Data</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Download all data we have about you in a readable format.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Delete Everything</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-center">
                    <Button asChild variant="outline">
                      <Link href="/settings?tab=privacy">
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Privacy Settings
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Residency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <CardTitle>Data Storage & Compliance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Data Location</h4>
                      <p className="text-sm text-muted-foreground">
                        Your data is stored securely on Google Firebase servers with global distribution 
                        for optimal performance and reliability.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Compliance</h4>
                      <p className="text-sm text-muted-foreground">
                        We follow GDPR-inspired privacy principles and industry best practices 
                        for student data protection.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Questions About Privacy?</h3>
                  <p className="text-muted-foreground mb-4">
                    We're committed to transparency. Contact us anytime about your privacy.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" asChild>
                      <a href="mailto:privacy@studynova.com">
                        Contact Privacy Team
                      </a>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to App
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
