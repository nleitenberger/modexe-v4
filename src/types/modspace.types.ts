// ModSpace Types - Personal Profile & Content Hub System

export interface ModSpace {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  layout: LayoutType;
  theme: ThemeConfig;
  sharedEntries: SharedJournalEntry[];
  mediaGallery: MediaItem[];
  socialLinks: SocialLink[];
  privacy: PrivacySettings;
  stats: ProfileStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutType {
  id: 'grid' | 'timeline' | 'magazine' | 'minimal' | 'creative';
  name: string;
  description: string;
  config: LayoutConfig;
}

export interface LayoutConfig {
  columns?: number;
  spacing?: number;
  cardStyle?: 'flat' | 'elevated' | 'outlined' | 'minimal';
  showCaptions?: boolean;
  showStats?: boolean;
  showDates?: boolean;
  headerStyle?: 'compact' | 'full' | 'minimal';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'dynamic';
  masonry?: boolean; // For Pinterest-style layouts
  customPositions?: EntryPosition[]; // For creative layout
}

export interface EntryPosition {
  entryId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
}

export interface SharedJournalEntry {
  id: string;
  journalId: string;
  journalTitle: string;
  pages: number[];
  title: string;
  excerpt: string;
  thumbnail?: string;
  shareDate: Date;
  visibility: 'public' | 'friends' | 'private';
  likes: number;
  views: number;
  comments: Comment[];
  tags: string[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  caption: string;
  tags: string[];
  uploadDate: Date;
  size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'website' | 'other';
  url: string;
  displayName?: string;
  isVisible: boolean;
}

export interface ThemeConfig {
  id?: string;
  name?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  surfaceColor?: string;
  errorColor?: string;
  warningColor?: string;
  successColor?: string;
  background: BackgroundConfig;
  font: FontConfig;
  spacing: SpacingConfig;
  borderRadius: number;
  shadows: ShadowConfig;
  effects: VisualEffectsConfig;
  accessibility: AccessibilityConfig;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  value: string | GradientConfig | PatternConfig | ImageConfig;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number; // For linear gradients
  stops?: number[]; // Color stop positions (0-1)
}

export interface PatternConfig {
  type: 'dots' | 'lines' | 'grid' | 'waves' | 'geometric';
  color: string;
  opacity: number;
  scale: number;
}

export interface ImageConfig {
  uri: string;
  opacity: number;
  blur?: number;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'stretch';
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  offset: { x: number; y: number };
  blur: number;
  opacity: number;
}

export interface VisualEffectsConfig {
  cardElevation: number;
  borderRadius: number;
  blur: {
    enabled: boolean;
    intensity: number;
  };
  animations: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  };
}

export interface AccessibilityConfig {
  highContrast: boolean;
  colorBlindFriendly: boolean;
  dyslexiaFriendly: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
}

export interface FontConfig {
  family: 'system' | 'serif' | 'monospace' | 'display' | 'handwriting' | 'custom';
  customName?: string; // For custom Google Fonts
  size: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  weight: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  lineHeight: number;
  letterSpacing: number;
}

export interface SpacingConfig {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  allowComments: boolean;
  allowSharing: boolean;
  showStats: boolean;
  showLastActive: boolean;
  discoverableBySearch: boolean;
}

export interface ProfileStats {
  totalEntries: number;
  totalViews: number;
  totalLikes: number;
  followers: number;
  following: number;
  joinDate: Date;
  lastActive: Date;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: Date;
  likes: number;
  replies?: Comment[];
}

export interface ModSpaceState {
  currentModSpace: ModSpace | null;
  viewingModSpace: ModSpace | null;
  layoutPreview: LayoutType | null;
  isEditMode: boolean;
  sharedContent: {
    journals: SharedJournalEntry[];
    media: MediaItem[];
  };
  discoverFeed: ModSpace[];
  followedUsers: string[];
  isLoading: boolean;
  error: string | null;
}

// Layout Templates
export const LAYOUT_TEMPLATES: LayoutType[] = [
  {
    id: 'grid',
    name: 'Grid',
    description: 'Instagram-style grid layout',
    config: {
      columns: 3,
      spacing: 4,
      cardStyle: 'flat',
      showCaptions: false,
      showStats: true,
      headerStyle: 'full',
      aspectRatio: 'square',
    },
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological feed layout',
    config: {
      columns: 1,
      spacing: 16,
      cardStyle: 'elevated',
      showCaptions: true,
      showStats: true,
      showDates: true,
      headerStyle: 'compact',
      aspectRatio: 'dynamic',
    },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Pinterest-style masonry layout',
    config: {
      columns: 2,
      spacing: 8,
      cardStyle: 'elevated',
      showCaptions: true,
      showStats: false,
      headerStyle: 'full',
      aspectRatio: 'dynamic',
      masonry: true,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, text-focused layout',
    config: {
      columns: 1,
      spacing: 24,
      cardStyle: 'minimal',
      showCaptions: true,
      showStats: false,
      headerStyle: 'minimal',
      aspectRatio: 'dynamic',
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Fully customizable layout',
    config: {
      columns: 2,
      spacing: 12,
      cardStyle: 'elevated',
      showCaptions: true,
      showStats: true,
      headerStyle: 'full',
      aspectRatio: 'dynamic',
      customPositions: [],
    },
  },
];

// Default theme configurations
export const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Light',
    primaryColor: '#007AFF',
    secondaryColor: '#5856D6',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    accentColor: '#FF3B30',
    surfaceColor: '#F8F9FA',
    errorColor: '#FF3B30',
    warningColor: '#FF9500',
    successColor: '#34C759',
    background: {
      type: 'solid',
      value: '#FFFFFF'
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
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    primaryColor: '#0A84FF',
    secondaryColor: '#5E5CE6',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    accentColor: '#FF453A',
    surfaceColor: '#1C1C1E',
    errorColor: '#FF453A',
    warningColor: '#FF9F0A',
    successColor: '#32D74B',
    background: {
      type: 'solid',
      value: '#000000'
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
      opacity: 0.3,
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
    },
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    primaryColor: '#8B4513',
    secondaryColor: '#D2691E',
    backgroundColor: '#FFF8DC',
    textColor: '#2F4F4F',
    accentColor: '#B22222',
    surfaceColor: '#F5F5DC',
    errorColor: '#B22222',
    warningColor: '#DAA520',
    successColor: '#228B22',
    background: {
      type: 'solid',
      value: '#FFF8DC'
    },
    font: {
      family: 'serif',
      size: {
        xs: 10,
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 28,
        xxlarge: 36,
      },
      weight: 'normal',
      lineHeight: 1.6,
      letterSpacing: 0.5,
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 4,
    shadows: {
      enabled: false,
      color: '#000000',
      offset: { x: 0, y: 0 },
      blur: 0,
      opacity: 0,
    },
    effects: {
      cardElevation: 0,
      borderRadius: 4,
      blur: {
        enabled: false,
        intensity: 0,
      },
      animations: {
        enabled: true,
        speed: 'slow',
        easing: 'ease',
      },
    },
    accessibility: {
      highContrast: false,
      colorBlindFriendly: false,
      dyslexiaFriendly: true,
      fontSize: 'normal',
    },
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel',
    primaryColor: '#E1BEE7',
    secondaryColor: '#B8E6B8',
    backgroundColor: '#FFF9F9',
    textColor: '#4A4A4A',
    accentColor: '#FFB6C1',
    surfaceColor: '#F0F8FF',
    errorColor: '#FFB6C1',
    warningColor: '#FFEAA7',
    successColor: '#B8E6B8',
    background: {
      type: 'gradient',
      value: {
        type: 'linear',
        colors: ['#FFF9F9', '#F0F8FF'],
        angle: 45,
      }
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
      weight: 'light',
      lineHeight: 1.5,
      letterSpacing: 0.3,
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 16,
    shadows: {
      enabled: true,
      color: '#E1BEE7',
      offset: { x: 0, y: 4 },
      blur: 8,
      opacity: 0.15,
    },
    effects: {
      cardElevation: 3,
      borderRadius: 16,
      blur: {
        enabled: true,
        intensity: 0.1,
      },
      animations: {
        enabled: true,
        speed: 'normal',
        easing: 'spring',
      },
    },
    accessibility: {
      highContrast: false,
      colorBlindFriendly: true,
      dyslexiaFriendly: false,
      fontSize: 'normal',
    },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    accentColor: '#FFD23F',
    surfaceColor: '#F8F8F8',
    errorColor: '#FF6B35',
    warningColor: '#FFD23F',
    successColor: '#4CAF50',
    background: {
      type: 'solid',
      value: '#FFFFFF'
    },
    font: {
      family: 'system',
      size: {
        xs: 11,
        small: 14,
        medium: 18,
        large: 24,
        xlarge: 32,
        xxlarge: 40,
      },
      weight: 'bold',
      lineHeight: 1.3,
      letterSpacing: -0.5,
    },
    spacing: {
      small: 12,
      medium: 20,
      large: 28,
      xlarge: 36,
    },
    borderRadius: 2,
    shadows: {
      enabled: true,
      color: '#000000',
      offset: { x: 2, y: 4 },
      blur: 0,
      opacity: 0.25,
    },
    effects: {
      cardElevation: 4,
      borderRadius: 2,
      blur: {
        enabled: false,
        intensity: 0,
      },
      animations: {
        enabled: true,
        speed: 'fast',
        easing: 'ease-out',
      },
    },
    accessibility: {
      highContrast: true,
      colorBlindFriendly: true,
      dyslexiaFriendly: false,
      fontSize: 'large',
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    primaryColor: '#667EEA',
    secondaryColor: '#764BA2',
    backgroundColor: '#FAFBFC',
    textColor: '#2D3748',
    accentColor: '#ED64A6',
    surfaceColor: '#FFFFFF',
    errorColor: '#F56565',
    warningColor: '#ED8936',
    successColor: '#68D391',
    background: {
      type: 'gradient',
      value: {
        type: 'linear',
        colors: ['#FAFBFC', '#F7FAFC'],
        angle: 180,
      }
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
      weight: 'medium',
      lineHeight: 1.4,
      letterSpacing: -0.25,
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 12,
    shadows: {
      enabled: true,
      color: '#667EEA',
      offset: { x: 0, y: 8 },
      blur: 16,
      opacity: 0.08,
    },
    effects: {
      cardElevation: 1,
      borderRadius: 12,
      blur: {
        enabled: true,
        intensity: 0.05,
      },
      animations: {
        enabled: true,
        speed: 'normal',
        easing: 'spring',
      },
    },
    accessibility: {
      highContrast: false,
      colorBlindFriendly: false,
      dyslexiaFriendly: false,
      fontSize: 'normal',
    },
  },
};