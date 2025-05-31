/**
 * Comprehensive theme testing utilities for LearnQuest
 * Tests all 6 themes across all major components
 */

import { themes } from "@/config/themes";

export interface ComponentTestResult {
  component: string;
  theme: string;
  passed: boolean;
  issues: string[];
  performance: number;
}

export interface ThemeTestSuite {
  theme: string;
  results: ComponentTestResult[];
  overallScore: number;
  criticalIssues: string[];
}

// Test components that should work with all themes
const TESTABLE_COMPONENTS = [
  'chat-interface',
  'progress-bars',
  'form-components',
  'image-tools',
  'content-manager',
  'theme-selector',
  'navigation',
  'settings-page'
] as const;

export class ThemeIntegrationTester {
  private results: Map<string, ThemeTestSuite> = new Map();
  
  async runFullTestSuite(): Promise<Map<string, ThemeTestSuite>> {
    console.log('🧪 Starting comprehensive theme integration testing...');
    
    for (const theme of themes) {
      console.log(`Testing theme: ${theme.name} (${theme.id})`);
      const themeResults = await this.testTheme(theme.id);
      this.results.set(theme.id, themeResults);
    }
    
    return this.results;
  }
  
  private async testTheme(themeId: string): Promise<ThemeTestSuite> {
    const results: ComponentTestResult[] = [];
    const criticalIssues: string[] = [];
    
    // Apply theme for testing
    await this.applyThemeForTesting(themeId);
    
    // Test each component
    for (const component of TESTABLE_COMPONENTS) {
      const result = await this.testComponent(component, themeId);
      results.push(result);
      
      if (!result.passed) {
        criticalIssues.push(`${component}: ${result.issues.join(', ')}`);
      }
    }
    
    const overallScore = this.calculateOverallScore(results);
    
    return {
      theme: themeId,
      results,
      overallScore,
      criticalIssues
    };
  }
  
  private async applyThemeForTesting(themeId: string): Promise<void> {
    // Simulate theme application
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .concat(` theme-${themeId}`);
    
    // Wait for theme transition
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  private async testComponent(component: string, themeId: string): Promise<ComponentTestResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    let passed = true;
    
    try {
      switch (component) {
        case 'chat-interface':
          await this.testChatInterface(themeId, issues);
          break;
        case 'progress-bars':
          await this.testProgressBars(themeId, issues);
          break;
        case 'form-components':
          await this.testFormComponents(themeId, issues);
          break;
        case 'image-tools':
          await this.testImageTools(themeId, issues);
          break;
        case 'content-manager':
          await this.testContentManager(themeId, issues);
          break;
        case 'theme-selector':
          await this.testThemeSelector(themeId, issues);
          break;
        case 'navigation':
          await this.testNavigation(themeId, issues);
          break;
        case 'settings-page':
          await this.testSettingsPage(themeId, issues);
          break;
      }
    } catch (error) {
      issues.push(`Component test failed: ${error}`);
      passed = false;
    }
    
    const performance = performance.now() - startTime;
    passed = passed && issues.length === 0;
    
    return {
      component,
      theme: themeId,
      passed,
      issues,
      performance
    };
  }
  
  private async testChatInterface(themeId: string, issues: string[]): Promise<void> {
    // Test chat bubble styling
    const testBubble = document.createElement('div');
    testBubble.className = `glass-card-strong theme-transition`;
    document.body.appendChild(testBubble);
    
    const computedStyle = getComputedStyle(testBubble);
    
    // Check glassmorphism effects
    if (!computedStyle.backdropFilter && !computedStyle.webkitBackdropFilter) {
      issues.push('Glassmorphism effects not applied');
    }
    
    // Check theme-specific colors
    const backgroundColor = computedStyle.backgroundColor;
    if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
      issues.push('Theme background not applied');
    }
    
    document.body.removeChild(testBubble);
  }
  
  private async testProgressBars(themeId: string, issues: string[]): Promise<void> {
    // Test progress bar gradient application
    const testProgress = document.createElement('div');
    testProgress.className = `h-4 rounded-full bg-gradient-to-r theme-transition`;
    document.body.appendChild(testProgress);
    
    const computedStyle = getComputedStyle(testProgress);
    
    // Check if gradient is applied
    if (!computedStyle.backgroundImage || computedStyle.backgroundImage === 'none') {
      issues.push('Progress bar gradient not applied');
    }
    
    document.body.removeChild(testProgress);
  }
  
  private async testFormComponents(themeId: string, issues: string[]): Promise<void> {
    // Test form input styling
    const testInput = document.createElement('input');
    testInput.className = `glass-card border-glass-border-strong theme-transition`;
    document.body.appendChild(testInput);
    
    const computedStyle = getComputedStyle(testInput);
    
    // Check border and background
    if (!computedStyle.borderColor || computedStyle.borderColor === 'rgba(0, 0, 0, 0)') {
      issues.push('Form border styling not applied');
    }
    
    document.body.removeChild(testInput);
  }
  
  private async testImageTools(themeId: string, issues: string[]): Promise<void> {
    // Test image container styling
    const testContainer = document.createElement('div');
    testContainer.className = `glass-card shadow-premium theme-transition`;
    document.body.appendChild(testContainer);
    
    const computedStyle = getComputedStyle(testContainer);
    
    // Check shadow effects
    if (!computedStyle.boxShadow || computedStyle.boxShadow === 'none') {
      issues.push('Image container shadows not applied');
    }
    
    document.body.removeChild(testContainer);
  }
  
  private async testContentManager(themeId: string, issues: string[]): Promise<void> {
    // Test upload area styling
    const testUpload = document.createElement('div');
    testUpload.className = `border-2 border-dashed glass-card theme-transition`;
    document.body.appendChild(testUpload);
    
    const computedStyle = getComputedStyle(testUpload);
    
    // Check border styling
    if (!computedStyle.borderStyle || computedStyle.borderStyle !== 'dashed') {
      issues.push('Upload area border styling not applied');
    }
    
    document.body.removeChild(testUpload);
  }
  
  private async testThemeSelector(themeId: string, issues: string[]): Promise<void> {
    // Test theme preview cards
    const testCard = document.createElement('div');
    testCard.className = `glass-card hover:shadow-glow theme-transition`;
    document.body.appendChild(testCard);
    
    // Simulate hover
    testCard.dispatchEvent(new MouseEvent('mouseenter'));
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const computedStyle = getComputedStyle(testCard);
    
    // Check hover effects
    if (!computedStyle.transition || !computedStyle.transition.includes('all')) {
      issues.push('Theme selector transitions not working');
    }
    
    document.body.removeChild(testCard);
  }
  
  private async testNavigation(themeId: string, issues: string[]): Promise<void> {
    // Test navigation styling
    const testNav = document.createElement('nav');
    testNav.className = `glass-card theme-transition`;
    document.body.appendChild(testNav);
    
    const computedStyle = getComputedStyle(testNav);
    
    // Check glassmorphism
    if (!computedStyle.backdropFilter && !computedStyle.webkitBackdropFilter) {
      issues.push('Navigation glassmorphism not applied');
    }
    
    document.body.removeChild(testNav);
  }
  
  private async testSettingsPage(themeId: string, issues: string[]): Promise<void> {
    // Test settings form styling
    const testForm = document.createElement('form');
    testForm.className = `glass-card-strong theme-transition`;
    document.body.appendChild(testForm);
    
    const computedStyle = getComputedStyle(testForm);
    
    // Check strong glassmorphism
    if (!computedStyle.backdropFilter && !computedStyle.webkitBackdropFilter) {
      issues.push('Settings form glassmorphism not applied');
    }
    
    document.body.removeChild(testForm);
  }
  
  private calculateOverallScore(results: ComponentTestResult[]): number {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    return Math.round((passedTests / totalTests) * 100);
  }
  
  generateReport(): string {
    let report = '# LearnQuest Theme Integration Test Report\n\n';
    
    for (const [themeId, suite] of this.results) {
      report += `## Theme: ${themeId}\n`;
      report += `**Overall Score: ${suite.overallScore}%**\n\n`;
      
      if (suite.criticalIssues.length > 0) {
        report += '### Critical Issues:\n';
        suite.criticalIssues.forEach(issue => {
          report += `- ${issue}\n`;
        });
        report += '\n';
      }
      
      report += '### Component Results:\n';
      suite.results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        report += `${status} ${result.component} (${result.performance.toFixed(2)}ms)\n`;
        if (result.issues.length > 0) {
          result.issues.forEach(issue => {
            report += `  - ${issue}\n`;
          });
        }
      });
      report += '\n';
    }
    
    return report;
  }
}

// Export singleton instance
export const themeIntegrationTester = new ThemeIntegrationTester();
