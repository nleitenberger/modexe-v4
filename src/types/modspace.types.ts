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
  cardStyle?: 'rounded' | 'square' | 'minimal';
  showCaptions?: boolean;
  showStats?: boolean;
  headerStyle?: 'compact' | 'full' | 'minimal';
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
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  font: FontConfig;
  spacing: SpacingConfig;
  borderRadius: number;
  shadows: boolean;
}

export interface FontConfig {
  family: 'system' | 'serif' | 'monospace' | 'custom';
  size: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  weight: 'light' | 'normal' | 'medium' | 'bold';
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
      cardStyle: 'square',
      showCaptions: false,
      showStats: true,
      headerStyle: 'full',
    },
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological feed layout',
    config: {
      columns: 1,
      spacing: 16,
      cardStyle: 'rounded',
      showCaptions: true,
      showStats: true,
      headerStyle: 'compact',
    },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Pinterest-style masonry layout',
    config: {
      columns: 2,
      spacing: 8,
      cardStyle: 'rounded',
      showCaptions: true,
      showStats: false,
      headerStyle: 'full',
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
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Fully customizable layout',
    config: {
      columns: 2,
      spacing: 12,
      cardStyle: 'rounded',
      showCaptions: true,
      showStats: true,
      headerStyle: 'full',
    },
  },
];

// Default theme configurations
export const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  light: {
    primaryColor: '#007AFF',
    secondaryColor: '#5856D6',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    accentColor: '#FF3B30',
    font: {
      family: 'system',
      size: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 28,
      },
      weight: 'normal',
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 8,
    shadows: true,
  },
  dark: {
    primaryColor: '#0A84FF',
    secondaryColor: '#5E5CE6',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    accentColor: '#FF453A',
    font: {
      family: 'system',
      size: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 28,
      },
      weight: 'normal',
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 8,
    shadows: true,
  },
  vintage: {
    primaryColor: '#8B4513',
    secondaryColor: '#D2691E',
    backgroundColor: '#FFF8DC',
    textColor: '#2F4F4F',
    accentColor: '#B22222',
    font: {
      family: 'serif',
      size: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 28,
      },
      weight: 'normal',
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32,
    },
    borderRadius: 4,
    shadows: false,
  },
};