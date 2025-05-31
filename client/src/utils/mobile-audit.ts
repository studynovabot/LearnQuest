/**
 * Mobile responsiveness audit for LearnQuest theme system
 * Tests touch interactions, viewport handling, and mobile-specific optimizations
 */

export interface MobileTestResult {
  test: string;
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface MobileAuditReport {
  deviceType: string;
  screenSize: string;
  touchSupport: boolean;
  results: MobileTestResult[];
  overallScore: number;
  criticalIssues: string[];
}

export class MobileResponsivenessAuditor {
  private isMobile: boolean;
  private isTablet: boolean;
  private screenWidth: number;
  private screenHeight: number;
  private devicePixelRatio: number;
  private touchSupport: boolean;
  
  constructor() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.isMobile = this.screenWidth <= 768;
    this.isTablet = this.screenWidth > 768 && this.screenWidth <= 1024;
  }
  
  async runMobileAudit(): Promise<MobileAuditReport> {
    console.log('📱 Starting mobile responsiveness audit...');
    
    const results: MobileTestResult[] = [
      await this.testViewportConfiguration(),
      await this.testTouchTargetSizes(),
      await this.testGlassmorphismPerformance(),
      await this.testAnimationPerformance(),
      await this.testScrollBehavior(),
      await this.testTextReadability(),
      await this.testImageOptimization(),
      await this.testFormUsability(),
      await this.testNavigationAccessibility(),
      await this.testThemeTransitionPerformance()
    ];
    
    const overallScore = this.calculateOverallScore(results);
    const criticalIssues = this.extractCriticalIssues(results);
    
    return {
      deviceType: this.getDeviceType(),
      screenSize: `${this.screenWidth}x${this.screenHeight}`,
      touchSupport: this.touchSupport,
      results,
      overallScore,
      criticalIssues
    };
  }
  
  private getDeviceType(): string {
    if (this.isMobile) return 'Mobile';
    if (this.isTablet) return 'Tablet';
    return 'Desktop';
  }
  
  private async testViewportConfiguration(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      issues.push('Missing viewport meta tag');
      score -= 30;
      recommendations.push('Add viewport meta tag for proper mobile scaling');
    } else {
      const content = viewportMeta.getAttribute('content') || '';
      if (!content.includes('width=device-width')) {
        issues.push('Viewport not set to device width');
        score -= 20;
      }
      if (!content.includes('initial-scale=1')) {
        issues.push('Initial scale not set to 1');
        score -= 10;
      }
    }
    
    // Check for horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) {
      issues.push('Horizontal scrolling detected');
      score -= 25;
      recommendations.push('Ensure content fits within viewport width');
    }
    
    return {
      test: 'Viewport Configuration',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testTouchTargetSizes(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    if (!this.touchSupport) {
      return {
        test: 'Touch Target Sizes',
        passed: true,
        score: 100,
        issues: ['Not applicable - no touch support'],
        recommendations: []
      };
    }
    
    // Test button sizes
    const buttons = document.querySelectorAll('button, .cursor-pointer, [role="button"]');
    let smallTargets = 0;
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      const minSize = 44; // WCAG recommended minimum
      
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets++;
      }
    });
    
    if (smallTargets > 0) {
      const percentage = (smallTargets / buttons.length) * 100;
      issues.push(`${smallTargets} touch targets smaller than 44px`);
      score -= Math.min(percentage, 50);
      recommendations.push('Increase touch target sizes to at least 44x44px');
    }
    
    return {
      test: 'Touch Target Sizes',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testGlassmorphismPerformance(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Test backdrop-filter performance
    const glassElements = document.querySelectorAll('.glass-card, .glass-card-strong');
    
    if (glassElements.length > 0) {
      const startTime = performance.now();
      
      // Simulate glassmorphism stress test
      glassElements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        const backdropFilter = computedStyle.backdropFilter || computedStyle.webkitBackdropFilter;
        
        if (backdropFilter && backdropFilter !== 'none') {
          // Check if blur value is optimized for mobile
          const blurMatch = backdropFilter.match(/blur\((\d+)px\)/);
          if (blurMatch) {
            const blurValue = parseInt(blurMatch[1]);
            if (this.isMobile && blurValue > 8) {
              issues.push(`High blur value (${blurValue}px) may impact mobile performance`);
              score -= 15;
            }
          }
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // 60fps threshold
        issues.push(`Glassmorphism rendering took ${duration.toFixed(2)}ms`);
        score -= 20;
        recommendations.push('Consider reducing backdrop-filter complexity on mobile');
      }
    }
    
    return {
      test: 'Glassmorphism Performance',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testAnimationPerformance(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Test animation frame rate
    let frameCount = 0;
    const startTime = performance.now();
    
    const countFrames = () => {
      frameCount++;
      if (performance.now() - startTime < 1000) {
        requestAnimationFrame(countFrames);
      }
    };
    
    requestAnimationFrame(countFrames);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fps = frameCount;
    
    if (fps < 30) {
      issues.push(`Low frame rate detected: ${fps} FPS`);
      score -= 30;
      recommendations.push('Optimize animations for better performance');
    } else if (fps < 50) {
      issues.push(`Moderate frame rate: ${fps} FPS`);
      score -= 15;
    }
    
    return {
      test: 'Animation Performance',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testScrollBehavior(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Test scroll smoothness
    const scrollableElements = document.querySelectorAll('[style*="overflow"], .overflow-auto, .overflow-scroll');
    
    scrollableElements.forEach(element => {
      const computedStyle = getComputedStyle(element);
      
      // Check for momentum scrolling on iOS
      if (this.isMobile && !computedStyle.webkitOverflowScrolling) {
        issues.push('Missing momentum scrolling for smooth iOS experience');
        score -= 10;
        recommendations.push('Add -webkit-overflow-scrolling: touch for iOS');
      }
    });
    
    return {
      test: 'Scroll Behavior',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testTextReadability(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Test font sizes
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let smallTextCount = 0;
    
    textElements.forEach(element => {
      const computedStyle = getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      if (fontSize < 14 && this.isMobile) {
        smallTextCount++;
      }
    });
    
    if (smallTextCount > 0) {
      issues.push(`${smallTextCount} text elements smaller than 14px on mobile`);
      score -= Math.min((smallTextCount / textElements.length) * 100, 30);
      recommendations.push('Increase font sizes for better mobile readability');
    }
    
    return {
      test: 'Text Readability',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testImageOptimization(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    const images = document.querySelectorAll('img');
    let unoptimizedImages = 0;
    
    images.forEach(img => {
      // Check for responsive images
      if (!img.srcset && !img.sizes) {
        unoptimizedImages++;
      }
      
      // Check for lazy loading
      if (!img.loading || img.loading !== 'lazy') {
        // Only count as issue if image is below the fold
        const rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          unoptimizedImages++;
        }
      }
    });
    
    if (unoptimizedImages > 0) {
      issues.push(`${unoptimizedImages} images not optimized for mobile`);
      score -= Math.min((unoptimizedImages / images.length) * 100, 40);
      recommendations.push('Add responsive images and lazy loading');
    }
    
    return {
      test: 'Image Optimization',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testFormUsability(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const computedStyle = getComputedStyle(input);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Check for zoom prevention on iOS
      if (fontSize < 16 && this.isMobile) {
        issues.push('Input font size less than 16px may cause zoom on iOS');
        score -= 10;
        recommendations.push('Use 16px or larger font size for inputs on mobile');
      }
    });
    
    return {
      test: 'Form Usability',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testNavigationAccessibility(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Test navigation menu accessibility
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    
    navElements.forEach(nav => {
      const links = nav.querySelectorAll('a, button');
      
      links.forEach(link => {
        const rect = link.getBoundingClientRect();
        if (rect.height < 44 && this.touchSupport) {
          issues.push('Navigation links smaller than recommended touch target');
          score -= 5;
        }
      });
    });
    
    return {
      test: 'Navigation Accessibility',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private async testThemeTransitionPerformance(): Promise<MobileTestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Test theme transition performance
    const startTime = performance.now();
    
    // Simulate theme change
    document.body.classList.add('theme-transitioning');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    document.body.classList.remove('theme-transitioning');
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 500) {
      issues.push(`Theme transition took ${duration.toFixed(2)}ms`);
      score -= 20;
      recommendations.push('Optimize theme transitions for mobile performance');
    }
    
    return {
      test: 'Theme Transition Performance',
      passed: score >= 80,
      score,
      issues,
      recommendations
    };
  }
  
  private calculateOverallScore(results: MobileTestResult[]): number {
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }
  
  private extractCriticalIssues(results: MobileTestResult[]): string[] {
    return results
      .filter(result => !result.passed)
      .flatMap(result => result.issues);
  }
  
  generateReport(): string {
    const report = this.runMobileAudit();
    
    return report.then(data => {
      let output = `# Mobile Responsiveness Audit Report\n\n`;
      output += `**Device Type:** ${data.deviceType}\n`;
      output += `**Screen Size:** ${data.screenSize}\n`;
      output += `**Touch Support:** ${data.touchSupport ? 'Yes' : 'No'}\n`;
      output += `**Overall Score:** ${data.overallScore}%\n\n`;
      
      if (data.criticalIssues.length > 0) {
        output += `## Critical Issues\n\n`;
        data.criticalIssues.forEach(issue => {
          output += `- ${issue}\n`;
        });
        output += '\n';
      }
      
      output += `## Test Results\n\n`;
      data.results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        output += `${status} **${result.test}** (${result.score}%)\n`;
        
        if (result.issues.length > 0) {
          output += `   Issues:\n`;
          result.issues.forEach(issue => {
            output += `   - ${issue}\n`;
          });
        }
        
        if (result.recommendations.length > 0) {
          output += `   Recommendations:\n`;
          result.recommendations.forEach(rec => {
            output += `   - ${rec}\n`;
          });
        }
        output += '\n';
      });
      
      return output;
    });
  }
}

// Export singleton instance
export const mobileResponsivenessAuditor = new MobileResponsivenessAuditor();
