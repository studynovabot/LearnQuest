import { type ThemePersonality } from "@/config/themes";

/**
 * Theme Personality Utility System
 * Converts theme personality traits into CSS classes and styles
 */

export interface ThemePersonalityClasses {
  typography: string;
  layout: string;
  effects: string;
  atmosphere: string;
  combined: string;
}

export interface ThemePersonalityStyles {
  typography: Record<string, string>;
  layout: Record<string, string>;
  effects: Record<string, string>;
  atmosphere: Record<string, string>;
}

/**
 * Typography personality mappings
 */
const typographyClasses = {
  fontWeight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  },
  letterSpacing: {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide'
  },
  lineHeight: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed'
  },
  textRendering: {
    crisp: 'text-rendering-crisp',
    smooth: 'text-rendering-smooth',
    geometric: 'text-rendering-geometric'
  }
};

/**
 * Layout personality mappings
 */
const layoutClasses = {
  borderRadius: {
    sharp: 'theme-radius-sharp',
    rounded: 'theme-radius-rounded',
    pill: 'theme-radius-pill'
  },
  spacing: {
    compact: 'theme-spacing-compact',
    normal: 'theme-spacing-normal',
    spacious: 'theme-spacing-spacious'
  },
  density: {
    dense: 'theme-density-dense',
    normal: 'theme-density-normal',
    airy: 'theme-density-airy'
  },
  cardStyle: {
    flat: 'theme-cards-flat',
    elevated: 'theme-cards-elevated',
    floating: 'theme-cards-floating'
  }
};

/**
 * Effects personality mappings
 */
const effectsClasses = {
  glassmorphism: {
    subtle: 'theme-glass-subtle',
    medium: 'theme-glass-medium',
    intense: 'theme-glass-intense'
  },
  shadows: {
    minimal: 'theme-shadows-minimal',
    soft: 'theme-shadows-soft',
    dramatic: 'theme-shadows-dramatic',
    glow: 'theme-shadows-glow'
  },
  animations: {
    minimal: 'theme-animations-minimal',
    smooth: 'theme-animations-smooth',
    playful: 'theme-animations-playful',
    dynamic: 'theme-animations-dynamic'
  },
  transitions: {
    instant: 'theme-transitions-instant',
    quick: 'theme-transitions-quick',
    smooth: 'theme-transitions-smooth',
    flowing: 'theme-transitions-flowing'
  }
};

/**
 * Atmosphere personality mappings
 */
const atmosphereClasses = {
  backgroundPattern: {
    none: 'theme-bg-none',
    dots: 'theme-bg-dots',
    grid: 'theme-bg-grid',
    waves: 'theme-bg-waves',
    particles: 'theme-bg-particles'
  },
  ambientAnimation: {
    none: 'theme-ambient-none',
    subtle: 'theme-ambient-subtle',
    gentle: 'theme-ambient-gentle',
    active: 'theme-ambient-active'
  },
  cursorStyle: {
    default: 'theme-cursor-default',
    precise: 'theme-cursor-precise',
    creative: 'theme-cursor-creative',
    playful: 'theme-cursor-playful'
  },
  interactionFeedback: {
    minimal: 'theme-feedback-minimal',
    standard: 'theme-feedback-standard',
    enhanced: 'theme-feedback-enhanced',
    immersive: 'theme-feedback-immersive'
  }
};

/**
 * Convert theme personality to CSS classes
 */
export function getThemePersonalityClasses(personality: ThemePersonality): ThemePersonalityClasses {
  const typography = [
    typographyClasses.fontWeight[personality.typography.fontWeight],
    typographyClasses.letterSpacing[personality.typography.letterSpacing],
    typographyClasses.lineHeight[personality.typography.lineHeight],
    typographyClasses.textRendering[personality.typography.textRendering]
  ].join(' ');

  const layout = [
    layoutClasses.borderRadius[personality.layout.borderRadius],
    layoutClasses.spacing[personality.layout.spacing],
    layoutClasses.density[personality.layout.density],
    layoutClasses.cardStyle[personality.layout.cardStyle]
  ].join(' ');

  const effects = [
    effectsClasses.glassmorphism[personality.effects.glassmorphism],
    effectsClasses.shadows[personality.effects.shadows],
    effectsClasses.animations[personality.effects.animations],
    effectsClasses.transitions[personality.effects.transitions]
  ].join(' ');

  const atmosphere = [
    atmosphereClasses.backgroundPattern[personality.atmosphere.backgroundPattern],
    atmosphereClasses.ambientAnimation[personality.atmosphere.ambientAnimation],
    atmosphereClasses.cursorStyle[personality.atmosphere.cursorStyle],
    atmosphereClasses.interactionFeedback[personality.atmosphere.interactionFeedback]
  ].join(' ');

  const combined = [typography, layout, effects, atmosphere].join(' ');

  return {
    typography,
    layout,
    effects,
    atmosphere,
    combined
  };
}

/**
 * Get CSS custom properties for theme personality
 */
export function getThemePersonalityStyles(personality: ThemePersonality): ThemePersonalityStyles {
  const typography = {
    '--theme-font-weight': personality.typography.fontWeight,
    '--theme-letter-spacing': personality.typography.letterSpacing,
    '--theme-line-height': personality.typography.lineHeight,
    '--theme-text-rendering': personality.typography.textRendering
  };

  const layout = {
    '--theme-border-radius': personality.layout.borderRadius,
    '--theme-spacing': personality.layout.spacing,
    '--theme-density': personality.layout.density,
    '--theme-card-style': personality.layout.cardStyle
  };

  const effects = {
    '--theme-glassmorphism': personality.effects.glassmorphism,
    '--theme-shadows': personality.effects.shadows,
    '--theme-animations': personality.effects.animations,
    '--theme-transitions': personality.effects.transitions
  };

  const atmosphere = {
    '--theme-background-pattern': personality.atmosphere.backgroundPattern,
    '--theme-ambient-animation': personality.atmosphere.ambientAnimation,
    '--theme-cursor-style': personality.atmosphere.cursorStyle,
    '--theme-interaction-feedback': personality.atmosphere.interactionFeedback
  };

  return {
    typography,
    layout,
    effects,
    atmosphere
  };
}

/**
 * Apply theme personality to document
 */
export function applyThemePersonality(personality: ThemePersonality): void {
  const classes = getThemePersonalityClasses(personality);
  const styles = getThemePersonalityStyles(personality);

  // Remove only specific theme personality classes to avoid breaking layout
  const personalityClassesToRemove = [
    // Typography classes
    /\btext-rendering-\w+\b/g,
    /\bfont-weight-\w+\b/g,
    /\bletter-spacing-\w+\b/g,
    /\bline-height-\w+\b/g,

    // Layout classes
    /\btheme-radius-\w+\b/g,
    /\btheme-spacing-\w+\b/g,
    /\btheme-density-\w+\b/g,
    /\btheme-cards-\w+\b/g,

    // Effects classes
    /\btheme-glass-\w+\b/g,
    /\btheme-shadows-\w+\b/g,
    /\btheme-animations-\w+\b/g,
    /\btheme-transitions-\w+\b/g,

    // Atmosphere classes
    /\btheme-bg-\w+\b/g,
    /\btheme-ambient-\w+\b/g,
    /\btheme-cursor-\w+\b/g,
    /\btheme-feedback-\w+\b/g
  ];

  // Apply classes to body safely
  let bodyClassName = document.body.className;
  personalityClassesToRemove.forEach(regex => {
    bodyClassName = bodyClassName.replace(regex, '');
  });

  // Clean up extra spaces and add new classes
  document.body.className = bodyClassName
    .replace(/\s+/g, ' ')
    .trim()
    .concat(` ${classes.combined}`);

  // Apply CSS custom properties to root
  const root = document.documentElement;
  Object.entries({
    ...styles.typography,
    ...styles.layout,
    ...styles.effects,
    ...styles.atmosphere
  }).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Get component-specific classes based on theme personality
 */
export function getComponentPersonalityClasses(
  personality: ThemePersonality,
  component: 'button' | 'card' | 'input' | 'nav' | 'text'
): string {
  const base = getThemePersonalityClasses(personality);
  
  switch (component) {
    case 'button':
      return `${base.layout} ${base.effects}`;
    case 'card':
      return `${base.layout} ${base.effects}`;
    case 'input':
      return `${base.layout} ${base.effects}`;
    case 'nav':
      return `${base.layout} ${base.effects} ${base.atmosphere}`;
    case 'text':
      return base.typography;
    default:
      return base.combined;
  }
}
