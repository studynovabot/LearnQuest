import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from '@/components/ui/premium-card';
import { GradientButton, GlassButton } from '@/components/ui/premium-button';
import { motion, AnimatePresence } from 'framer-motion';
import { themeIntegrationTester } from '@/utils/theme-testing';
import { browserCompatibilityTester } from '@/utils/browser-compatibility';
import { mobileResponsivenessAuditor } from '@/utils/mobile-audit';
import { productionDeploymentChecker } from '@/utils/production-deployment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TestTubeIcon, 
  MonitorIcon, 
  SmartphoneIcon, 
  RocketIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  PlayIcon,
  DownloadIcon
} from '@/components/ui/icons';

interface TestResult {
  name: string;
  status: 'running' | 'passed' | 'failed' | 'warning';
  score?: number;
  details?: string;
  duration?: number;
}

const Phase4Testing = () => {
  const { selectedTheme, availableThemes, changeTheme, performanceMetrics } = useAdvancedTheme();
  const [activeTab, setActiveTab] = useState('integration');
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<Record<string, string>>({});

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setTestResults(prev => ({ ...prev, integration: [] }));

    try {
      const results = await themeIntegrationTester.runFullTestSuite();
      const testResults: TestResult[] = [];

      for (const [themeId, suite] of results) {
        testResults.push({
          name: `Theme: ${themeId}`,
          status: suite.overallScore >= 80 ? 'passed' : suite.overallScore >= 60 ? 'warning' : 'failed',
          score: suite.overallScore,
          details: `${suite.results.filter(r => r.passed).length}/${suite.results.length} components passed`
        });
      }

      setTestResults(prev => ({ ...prev, integration: testResults }));
      setReports(prev => ({ ...prev, integration: themeIntegrationTester.generateReport() }));
    } catch (error) {
      console.error('Integration tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runBrowserCompatibilityTests = async () => {
    setIsRunning(true);
    
    try {
      const report = browserCompatibilityTester.testCompatibility();
      const testResult: TestResult = {
        name: `${report.browser} ${report.version}`,
        status: report.overallCompatibility >= 80 ? 'passed' : report.overallCompatibility >= 60 ? 'warning' : 'failed',
        score: report.overallCompatibility,
        details: `${report.features.filter(f => f.supported).length}/${report.features.length} features supported`
      };

      setTestResults(prev => ({ ...prev, browser: [testResult] }));
      setReports(prev => ({ ...prev, browser: browserCompatibilityTester.generateReport() }));
    } catch (error) {
      console.error('Browser compatibility tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runMobileAuditTests = async () => {
    setIsRunning(true);
    
    try {
      const report = await mobileResponsivenessAuditor.runMobileAudit();
      const testResults: TestResult[] = report.results.map(result => ({
        name: result.test,
        status: result.passed ? 'passed' : result.score >= 60 ? 'warning' : 'failed',
        score: result.score,
        details: result.issues.length > 0 ? result.issues.join(', ') : 'All checks passed'
      }));

      setTestResults(prev => ({ ...prev, mobile: testResults }));
      
      const reportString = await mobileResponsivenessAuditor.generateReport();
      setReports(prev => ({ ...prev, mobile: reportString }));
    } catch (error) {
      console.error('Mobile audit tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runDeploymentChecks = async () => {
    setIsRunning(true);
    
    try {
      const report = await productionDeploymentChecker.runDeploymentChecks();
      const testResults: TestResult[] = report.checks.map(check => ({
        name: check.name,
        status: check.status === 'pass' ? 'passed' : check.status === 'warning' ? 'warning' : 'failed',
        details: check.message
      }));

      setTestResults(prev => ({ ...prev, deployment: testResults }));
      
      const reportString = await productionDeploymentChecker.generateReport();
      setReports(prev => ({ ...prev, deployment: reportString }));
    } catch (error) {
      console.error('Deployment checks failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangleIcon size={16} className="text-yellow-500" />;
      case 'failed':
        return <XCircleIcon size={16} className="text-red-500" />;
      default:
        return <PlayIcon size={16} className="text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string, score?: number) => {
    const variant = status === 'passed' ? 'default' : status === 'warning' ? 'secondary' : 'destructive';
    const text = score ? `${status.toUpperCase()} (${score}%)` : status.toUpperCase();
    
    return (
      <Badge variant={variant} className="ml-2">
        {text}
      </Badge>
    );
  };

  const downloadReport = (reportType: string) => {
    const report = reports[reportType];
    if (!report) return;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnquest-${reportType}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Phase 4 Testing - LearnQuest</title>
        <meta name="description" content="Comprehensive testing suite for LearnQuest theme system" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 gradient-primary rounded-2xl shadow-glow">
              <TestTubeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Phase 4 Testing Suite
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Comprehensive testing and validation for production deployment
              </p>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <PremiumCard variant="glass" glow={true}>
          <PremiumCardHeader>
            <PremiumCardTitle>Current Performance Metrics</PremiumCardTitle>
            <PremiumCardDescription>
              Real-time theme system performance data
            </PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {performanceMetrics.averageTime.toFixed(2)}ms
                </div>
                <div className="text-sm text-muted-foreground">Average Transition Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {performanceMetrics.totalTransitions}
                </div>
                <div className="text-sm text-muted-foreground">Total Transitions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {performanceMetrics.lastTransition.toFixed(2)}ms
                </div>
                <div className="text-sm text-muted-foreground">Last Transition</div>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>

        {/* Testing Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <TestTubeIcon size={16} />
              Integration
            </TabsTrigger>
            <TabsTrigger value="browser" className="flex items-center gap-2">
              <MonitorIcon size={16} />
              Browser
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <SmartphoneIcon size={16} />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <RocketIcon size={16} />
              Deployment
            </TabsTrigger>
          </TabsList>

          {/* Integration Testing */}
          <TabsContent value="integration">
            <PremiumCard variant="glass">
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <PremiumCardTitle>Theme Integration Testing</PremiumCardTitle>
                    <PremiumCardDescription>
                      Test all 6 themes across all major components
                    </PremiumCardDescription>
                  </div>
                  <div className="flex gap-2">
                    <GradientButton
                      gradient="primary"
                      onClick={runIntegrationTests}
                      disabled={isRunning}
                    >
                      <PlayIcon size={16} className="mr-2" />
                      Run Tests
                    </GradientButton>
                    {reports.integration && (
                      <GlassButton onClick={() => downloadReport('integration')}>
                        <DownloadIcon size={16} className="mr-2" />
                        Download Report
                      </GlassButton>
                    )}
                  </div>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  {testResults.integration?.map((result, index) => (
                    <motion.div
                      key={result.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 glass-card rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                      </div>
                      {getStatusBadge(result.status, result.score)}
                    </motion.div>
                  ))}
                  {testResults.integration?.length === 0 && !isRunning && (
                    <div className="text-center py-8 text-muted-foreground">
                      Click "Run Tests" to start theme integration testing
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>

          {/* Browser Compatibility */}
          <TabsContent value="browser">
            <PremiumCard variant="glass">
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <PremiumCardTitle>Browser Compatibility</PremiumCardTitle>
                    <PremiumCardDescription>
                      Test cross-browser compatibility and feature support
                    </PremiumCardDescription>
                  </div>
                  <div className="flex gap-2">
                    <GradientButton
                      gradient="blue"
                      onClick={runBrowserCompatibilityTests}
                      disabled={isRunning}
                    >
                      <PlayIcon size={16} className="mr-2" />
                      Run Tests
                    </GradientButton>
                    {reports.browser && (
                      <GlassButton onClick={() => downloadReport('browser')}>
                        <DownloadIcon size={16} className="mr-2" />
                        Download Report
                      </GlassButton>
                    )}
                  </div>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  {testResults.browser?.map((result, index) => (
                    <motion.div
                      key={result.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 glass-card rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                      </div>
                      {getStatusBadge(result.status, result.score)}
                    </motion.div>
                  ))}
                  {testResults.browser?.length === 0 && !isRunning && (
                    <div className="text-center py-8 text-muted-foreground">
                      Click "Run Tests" to start browser compatibility testing
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>

          {/* Mobile Responsiveness */}
          <TabsContent value="mobile">
            <PremiumCard variant="glass">
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <PremiumCardTitle>Mobile Responsiveness Audit</PremiumCardTitle>
                    <PremiumCardDescription>
                      Comprehensive mobile optimization and touch interaction testing
                    </PremiumCardDescription>
                  </div>
                  <div className="flex gap-2">
                    <GradientButton
                      gradient="green"
                      onClick={runMobileAuditTests}
                      disabled={isRunning}
                    >
                      <PlayIcon size={16} className="mr-2" />
                      Run Audit
                    </GradientButton>
                    {reports.mobile && (
                      <GlassButton onClick={() => downloadReport('mobile')}>
                        <DownloadIcon size={16} className="mr-2" />
                        Download Report
                      </GlassButton>
                    )}
                  </div>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  {testResults.mobile?.map((result, index) => (
                    <motion.div
                      key={result.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 glass-card rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                      </div>
                      {getStatusBadge(result.status, result.score)}
                    </motion.div>
                  ))}
                  {testResults.mobile?.length === 0 && !isRunning && (
                    <div className="text-center py-8 text-muted-foreground">
                      Click "Run Audit" to start mobile responsiveness testing
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>

          {/* Production Deployment */}
          <TabsContent value="deployment">
            <PremiumCard variant="glass">
              <PremiumCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <PremiumCardTitle>Production Deployment Checks</PremiumCardTitle>
                    <PremiumCardDescription>
                      Validate readiness for production deployment
                    </PremiumCardDescription>
                  </div>
                  <div className="flex gap-2">
                    <GradientButton
                      gradient="orange"
                      onClick={runDeploymentChecks}
                      disabled={isRunning}
                    >
                      <PlayIcon size={16} className="mr-2" />
                      Run Checks
                    </GradientButton>
                    {reports.deployment && (
                      <GlassButton onClick={() => downloadReport('deployment')}>
                        <DownloadIcon size={16} className="mr-2" />
                        Download Report
                      </GlassButton>
                    )}
                  </div>
                </div>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  {testResults.deployment?.map((result, index) => (
                    <motion.div
                      key={result.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 glass-card rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </motion.div>
                  ))}
                  {testResults.deployment?.length === 0 && !isRunning && (
                    <div className="text-center py-8 text-muted-foreground">
                      Click "Run Checks" to start deployment validation
                    </div>
                  )}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Phase4Testing;
