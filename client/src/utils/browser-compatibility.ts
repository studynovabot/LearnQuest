/**
 * Cross-browser compatibility testing for LearnQuest theme system
 * Tests Chrome, Firefox, Safari, and Edge compatibility
 */

export interface BrowserFeature {
  name: string;
  supported: boolean;
  fallback?: string;
}

export interface BrowserCompatibilityReport {
  browser: string;
  version: string;
  features: BrowserFeature[];
  overallCompatibility: number;
  recommendations: string[];
}

export class BrowserCompatibilityTester {
  private userAgent: string;
  private browser: string;
  private version: string;
  
  constructor() {
    this.userAgent = navigator.userAgent;
    this.browser = this.detectBrowser();
    this.version = this.detectVersion();
  }
  
  private detectBrowser(): string {
    const ua = this.userAgent.toLowerCase();
    
    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
    
    return 'Unknown';
  }
  
  private detectVersion(): string {
    const ua = this.userAgent;
    let version = 'Unknown';
    
    switch (this.browser) {
      case 'Chrome':
        const chromeMatch = ua.match(/Chrome\/(\d+)/);
        version = chromeMatch ? chromeMatch[1] : 'Unknown';
        break;
      case 'Firefox':
        const firefoxMatch = ua.match(/Firefox\/(\d+)/);
        version = firefoxMatch ? firefoxMatch[1] : 'Unknown';
        break;
      case 'Safari':
        const safariMatch = ua.match(/Version\/(\d+)/);
        version = safariMatch ? safariMatch[1] : 'Unknown';
        break;
      case 'Edge':
        const edgeMatch = ua.match(/Edg\/(\d+)/);
        version = edgeMatch ? edgeMatch[1] : 'Unknown';
        break;
    }
    
    return version;
  }
  
  testCompatibility(): BrowserCompatibilityReport {
    const features: BrowserFeature[] = [
      this.testBackdropFilter(),
      this.testCSSVariables(),
      this.testFlexbox(),
      this.testGrid(),
      this.testTransitions(),
      this.testTransforms(),
      this.testGradients(),
      this.testBoxShadow(),
      this.testBorderRadius(),
      this.testLocalStorage(),
      this.testSessionStorage(),
      this.testRequestAnimationFrame(),
      this.testPerformanceAPI(),
      this.testIntersectionObserver(),
      this.testResizeObserver()
    ];
    
    const supportedFeatures = features.filter(f => f.supported).length;
    const overallCompatibility = Math.round((supportedFeatures / features.length) * 100);
    
    const recommendations = this.generateRecommendations(features);
    
    return {
      browser: this.browser,
      version: this.version,
      features,
      overallCompatibility,
      recommendations
    };
  }
  
  private testBackdropFilter(): BrowserFeature {
    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(1px)';
    (testElement.style as any).webkitBackdropFilter = 'blur(1px)';

    const supported = !!(
      testElement.style.backdropFilter ||
      (testElement.style as any).webkitBackdropFilter
    );
    
    return {
      name: 'Backdrop Filter (Glassmorphism)',
      supported,
      fallback: supported ? undefined : 'Use solid backgrounds with opacity'
    };
  }
  
  private testCSSVariables(): BrowserFeature {
    const supported = window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
    
    return {
      name: 'CSS Custom Properties (Variables)',
      supported,
      fallback: supported ? undefined : 'Use SCSS variables or PostCSS'
    };
  }
  
  private testFlexbox(): BrowserFeature {
    const supported = CSS.supports('display', 'flex');
    
    return {
      name: 'Flexbox Layout',
      supported,
      fallback: supported ? undefined : 'Use float-based layouts'
    };
  }
  
  private testGrid(): BrowserFeature {
    const supported = CSS.supports('display', 'grid');
    
    return {
      name: 'CSS Grid Layout',
      supported,
      fallback: supported ? undefined : 'Use flexbox or float layouts'
    };
  }
  
  private testTransitions(): BrowserFeature {
    const supported = CSS.supports('transition', 'all 0.3s ease');
    
    return {
      name: 'CSS Transitions',
      supported,
      fallback: supported ? undefined : 'Use JavaScript animations'
    };
  }
  
  private testTransforms(): BrowserFeature {
    const supported = CSS.supports('transform', 'translateX(10px)');
    
    return {
      name: 'CSS Transforms',
      supported,
      fallback: supported ? undefined : 'Use position changes'
    };
  }
  
  private testGradients(): BrowserFeature {
    const supported = CSS.supports('background', 'linear-gradient(to right, red, blue)');
    
    return {
      name: 'CSS Gradients',
      supported,
      fallback: supported ? undefined : 'Use solid colors or background images'
    };
  }
  
  private testBoxShadow(): BrowserFeature {
    const supported = CSS.supports('box-shadow', '0 0 10px rgba(0,0,0,0.5)');
    
    return {
      name: 'Box Shadow',
      supported,
      fallback: supported ? undefined : 'Use border styling'
    };
  }
  
  private testBorderRadius(): BrowserFeature {
    const supported = CSS.supports('border-radius', '10px');
    
    return {
      name: 'Border Radius',
      supported,
      fallback: supported ? undefined : 'Use square corners'
    };
  }
  
  private testLocalStorage(): BrowserFeature {
    let supported = false;
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      supported = true;
    } catch (e) {
      supported = false;
    }
    
    return {
      name: 'Local Storage',
      supported,
      fallback: supported ? undefined : 'Use cookies or session storage'
    };
  }
  
  private testSessionStorage(): BrowserFeature {
    let supported = false;
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      supported = true;
    } catch (e) {
      supported = false;
    }
    
    return {
      name: 'Session Storage',
      supported,
      fallback: supported ? undefined : 'Use cookies'
    };
  }
  
  private testRequestAnimationFrame(): BrowserFeature {
    const supported = typeof requestAnimationFrame === 'function';
    
    return {
      name: 'Request Animation Frame',
      supported,
      fallback: supported ? undefined : 'Use setTimeout for animations'
    };
  }
  
  private testPerformanceAPI(): BrowserFeature {
    const supported = typeof performance !== 'undefined' && typeof performance.now === 'function';
    
    return {
      name: 'Performance API',
      supported,
      fallback: supported ? undefined : 'Use Date.now() for timing'
    };
  }
  
  private testIntersectionObserver(): BrowserFeature {
    const supported = typeof IntersectionObserver === 'function';
    
    return {
      name: 'Intersection Observer',
      supported,
      fallback: supported ? undefined : 'Use scroll event listeners'
    };
  }
  
  private testResizeObserver(): BrowserFeature {
    const supported = typeof ResizeObserver === 'function';
    
    return {
      name: 'Resize Observer',
      supported,
      fallback: supported ? undefined : 'Use window resize events'
    };
  }
  
  private generateRecommendations(features: BrowserFeature[]): string[] {
    const recommendations: string[] = [];
    const unsupportedFeatures = features.filter(f => !f.supported);
    
    if (unsupportedFeatures.length === 0) {
      recommendations.push('✅ Full compatibility - all features supported!');
      return recommendations;
    }
    
    // Browser-specific recommendations
    switch (this.browser) {
      case 'Safari':
        if (unsupportedFeatures.some(f => f.name.includes('Backdrop Filter'))) {
          recommendations.push('Consider using solid backgrounds for Safari compatibility');
        }
        break;
      case 'Firefox':
        if (unsupportedFeatures.some(f => f.name.includes('Backdrop Filter'))) {
          recommendations.push('Firefox may need -moz- prefixes for some features');
        }
        break;
      case 'Edge':
        if (parseInt(this.version) < 79) {
          recommendations.push('Consider upgrading to Chromium-based Edge for better compatibility');
        }
        break;
    }
    
    // General recommendations
    if (unsupportedFeatures.length > 3) {
      recommendations.push('Consider providing enhanced fallbacks for this browser');
    }
    
    if (unsupportedFeatures.some(f => f.name.includes('Storage'))) {
      recommendations.push('Theme preferences may not persist - consider cookie fallback');
    }
    
    return recommendations;
  }
  
  generateReport(): string {
    const report = this.testCompatibility();
    
    let output = `# Browser Compatibility Report\n\n`;
    output += `**Browser:** ${report.browser} ${report.version}\n`;
    output += `**Overall Compatibility:** ${report.overallCompatibility}%\n\n`;
    
    output += `## Feature Support\n\n`;
    report.features.forEach(feature => {
      const status = feature.supported ? '✅' : '❌';
      output += `${status} **${feature.name}**\n`;
      if (!feature.supported && feature.fallback) {
        output += `   *Fallback: ${feature.fallback}*\n`;
      }
      output += '\n';
    });
    
    if (report.recommendations.length > 0) {
      output += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        output += `- ${rec}\n`;
      });
    }
    
    return output;
  }
}

// Export singleton instance
export const browserCompatibilityTester = new BrowserCompatibilityTester();
