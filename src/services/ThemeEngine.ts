import { ThemeConfig, BackgroundConfig, GradientConfig, PatternConfig, ImageConfig, AccessibilityConfig } from '../types/modspace.types';

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
}

interface ContrastRatio {
  normal: number;
  large: number;
  isAccessible: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
}

export class ThemeEngine {
  
  /**
   * Generate a color palette from a primary color
   */
  static generateColorPalette(primaryColor: string): ColorPalette {
    const hsl = this.hexToHsl(primaryColor);
    
    return {
      primary: primaryColor,
      primaryLight: this.hslToHex(hsl.h, Math.max(0, hsl.s - 0.1), Math.min(1, hsl.l + 0.2)),
      primaryDark: this.hslToHex(hsl.h, Math.min(1, hsl.s + 0.1), Math.max(0, hsl.l - 0.2)),
      secondary: this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      secondaryLight: this.hslToHex((hsl.h + 30) % 360, Math.max(0, hsl.s - 0.1), Math.min(1, hsl.l + 0.2)),
      secondaryDark: this.hslToHex((hsl.h + 30) % 360, Math.min(1, hsl.s + 0.1), Math.max(0, hsl.l - 0.2)),
      accent: this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      accentLight: this.hslToHex((hsl.h + 180) % 360, Math.max(0, hsl.s - 0.1), Math.min(1, hsl.l + 0.2)),
      accentDark: this.hslToHex((hsl.h + 180) % 360, Math.min(1, hsl.s + 0.1), Math.max(0, hsl.l - 0.2)),
    };
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static calculateContrastRatio(color1: string, color2: string): ContrastRatio {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    
    let level: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
    let isAccessible = false;
    
    if (ratio >= 7) {
      level = 'AAA';
      isAccessible = true;
    } else if (ratio >= 4.5) {
      level = 'AA';
      isAccessible = true;
    }
    
    return {
      normal: ratio,
      large: ratio, // For large text (18pt+), requirement is lower
      isAccessible: ratio >= 4.5,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL',
    };
  }

  /**
   * Validate theme accessibility
   */
  static validateThemeAccessibility(theme: ThemeConfig): {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check text contrast
    const textContrast = this.calculateContrastRatio(theme.textColor, theme.backgroundColor);
    if (!textContrast.isAccessible) {
      warnings.push(`Text contrast ratio (${textContrast.normal.toFixed(2)}) does not meet WCAG standards`);
      recommendations.push('Adjust text color or background color to improve readability');
    }
    
    // Check primary color contrast
    const primaryContrast = this.calculateContrastRatio(theme.primaryColor, theme.backgroundColor);
    if (primaryContrast.normal < 3) {
      warnings.push('Primary color has low contrast against background');
      recommendations.push('Choose a more contrasting primary color for better visibility');
    }
    
    // Check accent color contrast
    const accentContrast = this.calculateContrastRatio(theme.accentColor, theme.backgroundColor);
    if (accentContrast.normal < 3) {
      warnings.push('Accent color has low contrast against background');
    }
    
    // Check font size accessibility
    if (theme.accessibility.fontSize === 'small' && theme.font.size.medium < 16) {
      warnings.push('Small font sizes may be difficult to read');
      recommendations.push('Consider increasing minimum font size for better accessibility');
    }
    
    return {
      isValid: warnings.length === 0,
      warnings,
      recommendations,
    };
  }

  /**
   * Create accessible theme variations
   */
  static createAccessibleTheme(baseTheme: ThemeConfig): ThemeConfig {
    const accessibleTheme = { ...baseTheme };
    
    // Ensure text has sufficient contrast
    const textContrast = this.calculateContrastRatio(baseTheme.textColor, baseTheme.backgroundColor);
    if (!textContrast.isAccessible) {
      // Adjust text color for better contrast
      const bgLuminance = this.getLuminance(baseTheme.backgroundColor);
      accessibleTheme.textColor = bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    // Increase font sizes
    accessibleTheme.font = {
      ...baseTheme.font,
      size: {
        ...baseTheme.font.size,
        xs: Math.max(baseTheme.font.size.xs, 12),
        small: Math.max(baseTheme.font.size.small, 14),
        medium: Math.max(baseTheme.font.size.medium, 18),
        large: Math.max(baseTheme.font.size.large, 22),
        xlarge: Math.max(baseTheme.font.size.xlarge, 30),
        xxlarge: Math.max(baseTheme.font.size.xxlarge, 38),
      },
      lineHeight: Math.max(baseTheme.font.lineHeight, 1.5),
    };
    
    // Enable high contrast mode
    accessibleTheme.accessibility = {
      ...baseTheme.accessibility,
      highContrast: true,
      fontSize: 'large',
    };
    
    // Enhance shadows for better definition
    if (accessibleTheme.shadows.enabled) {
      accessibleTheme.shadows = {
        ...accessibleTheme.shadows,
        opacity: Math.max(accessibleTheme.shadows.opacity, 0.3),
        blur: Math.max(accessibleTheme.shadows.blur, 4),
      };
    }
    
    return accessibleTheme;
  }

  /**
   * Create color blind friendly theme
   */
  static createColorBlindFriendlyTheme(baseTheme: ThemeConfig): ThemeConfig {
    const colorBlindTheme = { ...baseTheme };
    
    // Use safe color combinations for different types of color blindness
    const safeColors = {
      primary: '#1E88E5',     // Blue
      secondary: '#FFA726',   // Orange  
      accent: '#4CAF50',      // Green
      error: '#D32F2F',       // Red (with high contrast)
      warning: '#F57C00',     // Amber
      success: '#388E3C',     // Dark Green
    };
    
    colorBlindTheme.primaryColor = safeColors.primary;
    colorBlindTheme.secondaryColor = safeColors.secondary;
    colorBlindTheme.accentColor = safeColors.accent;
    colorBlindTheme.errorColor = safeColors.error;
    colorBlindTheme.warningColor = safeColors.warning;
    colorBlindTheme.successColor = safeColors.success;
    
    colorBlindTheme.accessibility = {
      ...colorBlindTheme.accessibility,
      colorBlindFriendly: true,
    };
    
    return colorBlindTheme;
  }

  /**
   * Generate background style from background config
   */
  static generateBackgroundStyle(background: BackgroundConfig): any {
    switch (background.type) {
      case 'solid':
        return {
          backgroundColor: background.value as string,
        };
        
      case 'gradient':
        const gradient = background.value as GradientConfig;
        // React Native gradient would need react-native-linear-gradient
        // For now, return a fallback solid color
        return {
          backgroundColor: gradient.colors[0],
        };
        
      case 'pattern':
        const pattern = background.value as PatternConfig;
        return {
          backgroundColor: pattern.color,
          opacity: pattern.opacity,
        };
        
      case 'image':
        const image = background.value as ImageConfig;
        return {
          backgroundColor: 'transparent',
        };
        
      default:
        return {
          backgroundColor: '#FFFFFF',
        };
    }
  }

  /**
   * Interpolate between two themes for smooth transitions
   */
  static interpolateThemes(
    themeA: ThemeConfig, 
    themeB: ThemeConfig, 
    progress: number
  ): ThemeConfig {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    return {
      ...themeB,
      primaryColor: this.interpolateColor(themeA.primaryColor, themeB.primaryColor, clampedProgress),
      secondaryColor: this.interpolateColor(themeA.secondaryColor, themeB.secondaryColor, clampedProgress),
      backgroundColor: this.interpolateColor(themeA.backgroundColor, themeB.backgroundColor, clampedProgress),
      textColor: this.interpolateColor(themeA.textColor, themeB.textColor, clampedProgress),
      accentColor: this.interpolateColor(themeA.accentColor, themeB.accentColor, clampedProgress),
      borderRadius: this.interpolateNumber(themeA.borderRadius, themeB.borderRadius, clampedProgress),
      shadows: {
        ...themeB.shadows,
        opacity: this.interpolateNumber(themeA.shadows.opacity, themeB.shadows.opacity, clampedProgress),
        blur: this.interpolateNumber(themeA.shadows.blur, themeB.shadows.blur, clampedProgress),
      },
    };
  }

  /**
   * Generate theme suggestions based on user preferences
   */
  static generateThemeSuggestions(
    preferences: {
      favoriteColors?: string[];
      preferredContrast?: 'low' | 'normal' | 'high';
      accessibility?: Partial<AccessibilityConfig>;
    }
  ): ThemeConfig[] {
    const suggestions: ThemeConfig[] = [];
    
    if (preferences.favoriteColors) {
      preferences.favoriteColors.forEach(color => {
        const palette = this.generateColorPalette(color);
        
        const suggestion: ThemeConfig = {
          id: `suggested_${Date.now()}_${color.replace('#', '')}`,
          name: `${color} Theme`,
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          accentColor: palette.accent,
          surfaceColor: '#F8F9FA',
          errorColor: '#FF3B30',
          warningColor: '#FF9500',
          successColor: '#34C759',
          background: {
            type: 'solid',
            value: '#FFFFFF',
          },
          font: {
            family: 'system',
            size: {
              xs: 10,
              small: 12,
              medium: 16,
              large: 20,
              xlarge: 28,
              xxlarge: 36,
            },
            weight: 'normal',
            lineHeight: 1.4,
            letterSpacing: 0,
          },
          spacing: {
            small: 8,
            medium: 16,
            large: 24,
            xlarge: 32,
          },
          borderRadius: 8,
          shadows: {
            enabled: true,
            color: '#000000',
            offset: { x: 0, y: 2 },
            blur: 4,
            opacity: 0.1,
          },
          effects: {
            cardElevation: 2,
            borderRadius: 8,
            blur: {
              enabled: false,
              intensity: 0,
            },
            animations: {
              enabled: true,
              speed: 'normal',
              easing: 'ease-in-out',
            },
          },
          accessibility: {
            highContrast: false,
            colorBlindFriendly: false,
            dyslexiaFriendly: false,
            fontSize: 'normal',
            ...preferences.accessibility,
          },
        };
        
        suggestions.push(suggestion);
      });
    }
    
    return suggestions;
  }

  // Utility functions for color manipulation
  private static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  private static hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  private static getLuminance(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  private static interpolateColor(colorA: string, colorB: string, progress: number): string {
    const hexA = colorA.replace('#', '');
    const hexB = colorB.replace('#', '');
    
    const rA = parseInt(hexA.slice(0, 2), 16);
    const gA = parseInt(hexA.slice(2, 4), 16);
    const bA = parseInt(hexA.slice(4, 6), 16);
    
    const rB = parseInt(hexB.slice(0, 2), 16);
    const gB = parseInt(hexB.slice(2, 4), 16);
    const bB = parseInt(hexB.slice(4, 6), 16);
    
    const r = Math.round(rA + (rB - rA) * progress);
    const g = Math.round(gA + (gB - gA) * progress);
    const b = Math.round(bA + (bB - bA) * progress);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private static interpolateNumber(a: number, b: number, progress: number): number {
    return a + (b - a) * progress;
  }
}

export default ThemeEngine;