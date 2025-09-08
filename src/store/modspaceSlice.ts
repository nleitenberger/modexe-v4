import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ModSpace,
  ModSpaceState,
  LayoutType,
  SharedJournalEntry,
  MediaItem,
  ThemeConfig,
  LAYOUT_TEMPLATES,
  DEFAULT_THEMES,
} from '../types/modspace.types';

const initialState: ModSpaceState = {
  currentModSpace: null,
  viewingModSpace: null,
  layoutPreview: null,
  isEditMode: false,
  sharedContent: {
    journals: [],
    media: [],
  },
  discoverFeed: [],
  followedUsers: [],
  isLoading: false,
  error: null,
};

const modspaceSlice = createSlice({
  name: 'modspace',
  initialState,
  reducers: {
    // Profile Management
    createModSpace: (
      state,
      action: PayloadAction<{
        userId: string;
        username: string;
        displayName: string;
      }>
    ) => {
      const { userId, username, displayName } = action.payload;
      const newModSpace: ModSpace = {
        id: `modspace-${Date.now()}`,
        userId,
        username,
        displayName,
        bio: '',
        avatar: '',
        coverImage: '',
        layout: LAYOUT_TEMPLATES[0], // Default to grid layout
        theme: DEFAULT_THEMES.light,
        sharedEntries: [],
        mediaGallery: [],
        socialLinks: [],
        privacy: {
          profileVisibility: 'public',
          allowComments: true,
          allowSharing: true,
          showStats: true,
          showLastActive: true,
          discoverableBySearch: true,
        },
        stats: {
          totalEntries: 0,
          totalViews: 0,
          totalLikes: 0,
          followers: 0,
          following: 0,
          joinDate: new Date(),
          lastActive: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.currentModSpace = newModSpace;
    },

    loadModSpace: (state, action: PayloadAction<ModSpace>) => {
      state.currentModSpace = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    updateModSpaceProfile: (
      state,
      action: PayloadAction<{
        displayName?: string;
        bio?: string;
        avatar?: string;
        coverImage?: string;
      }>
    ) => {
      if (state.currentModSpace) {
        Object.assign(state.currentModSpace, action.payload);
        state.currentModSpace.updatedAt = new Date();
      }
    },

    updateModSpaceTheme: (state, action: PayloadAction<ThemeConfig>) => {
      if (state.currentModSpace) {
        state.currentModSpace.theme = action.payload;
        state.currentModSpace.updatedAt = new Date();
      }
    },

    updateModSpaceLayout: (state, action: PayloadAction<LayoutType>) => {
      if (state.currentModSpace) {
        state.currentModSpace.layout = action.payload;
        state.currentModSpace.updatedAt = new Date();
      }
    },

    // Content Management
    shareJournalEntry: (state, action: PayloadAction<SharedJournalEntry>) => {
      if (state.currentModSpace) {
        state.currentModSpace.sharedEntries.push(action.payload);
        state.sharedContent.journals.push(action.payload);
        state.currentModSpace.stats.totalEntries += 1;
        state.currentModSpace.updatedAt = new Date();
      }
    },

    unshareJournalEntry: (state, action: PayloadAction<string>) => {
      if (state.currentModSpace) {
        state.currentModSpace.sharedEntries = state.currentModSpace.sharedEntries.filter(
          entry => entry.id !== action.payload
        );
        state.sharedContent.journals = state.sharedContent.journals.filter(
          entry => entry.id !== action.payload
        );
        state.currentModSpace.stats.totalEntries -= 1;
        state.currentModSpace.updatedAt = new Date();
      }
    },

    updateSharedEntry: (
      state,
      action: PayloadAction<{
        entryId: string;
        updates: Partial<SharedJournalEntry>;
      }>
    ) => {
      const { entryId, updates } = action.payload;
      if (state.currentModSpace) {
        const entry = state.currentModSpace.sharedEntries.find(e => e.id === entryId);
        if (entry) {
          Object.assign(entry, updates);
          state.currentModSpace.updatedAt = new Date();
        }
      }
    },

    addMediaItem: (state, action: PayloadAction<MediaItem>) => {
      if (state.currentModSpace) {
        state.currentModSpace.mediaGallery.push(action.payload);
        state.sharedContent.media.push(action.payload);
        state.currentModSpace.updatedAt = new Date();
      }
    },

    removeMediaItem: (state, action: PayloadAction<string>) => {
      if (state.currentModSpace) {
        state.currentModSpace.mediaGallery = state.currentModSpace.mediaGallery.filter(
          item => item.id !== action.payload
        );
        state.sharedContent.media = state.sharedContent.media.filter(
          item => item.id !== action.payload
        );
        state.currentModSpace.updatedAt = new Date();
      }
    },

    // Social Features
    likeEntry: (state, action: PayloadAction<string>) => {
      if (state.viewingModSpace) {
        const entry = state.viewingModSpace.sharedEntries.find(e => e.id === action.payload);
        if (entry) {
          entry.likes += 1;
        }
      }
      // Also update if it's our own entry
      if (state.currentModSpace) {
        const entry = state.currentModSpace.sharedEntries.find(e => e.id === action.payload);
        if (entry) {
          entry.likes += 1;
          state.currentModSpace.stats.totalLikes += 1;
        }
      }
    },

    followUser: (state, action: PayloadAction<string>) => {
      if (!state.followedUsers.includes(action.payload)) {
        state.followedUsers.push(action.payload);
        if (state.currentModSpace) {
          state.currentModSpace.stats.following += 1;
        }
      }
    },

    unfollowUser: (state, action: PayloadAction<string>) => {
      state.followedUsers = state.followedUsers.filter(userId => userId !== action.payload);
      if (state.currentModSpace) {
        state.currentModSpace.stats.following -= 1;
      }
    },

    // Navigation & Viewing
    setViewingModSpace: (state, action: PayloadAction<ModSpace | null>) => {
      state.viewingModSpace = action.payload;
      if (action.payload) {
        // Increment view count
        action.payload.stats.totalViews += 1;
      }
    },

    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },

    setLayoutPreview: (state, action: PayloadAction<LayoutType | null>) => {
      state.layoutPreview = action.payload;
    },

    // Discover Feed
    loadDiscoverFeed: (state, action: PayloadAction<ModSpace[]>) => {
      state.discoverFeed = action.payload;
    },

    addToDiscoverFeed: (state, action: PayloadAction<ModSpace>) => {
      if (!state.discoverFeed.find(ms => ms.id === action.payload.id)) {
        state.discoverFeed.push(action.payload);
      }
    },

    // Loading & Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Privacy Settings
    updatePrivacySettings: (
      state,
      action: PayloadAction<Partial<ModSpace['privacy']>>
    ) => {
      if (state.currentModSpace) {
        state.currentModSpace.privacy = {
          ...state.currentModSpace.privacy,
          ...action.payload,
        };
        state.currentModSpace.updatedAt = new Date();
      }
    },

    // Social Links
    addSocialLink: (state, action: PayloadAction<ModSpace['socialLinks'][0]>) => {
      if (state.currentModSpace) {
        state.currentModSpace.socialLinks.push(action.payload);
        state.currentModSpace.updatedAt = new Date();
      }
    },

    removeSocialLink: (state, action: PayloadAction<string>) => {
      if (state.currentModSpace) {
        state.currentModSpace.socialLinks = state.currentModSpace.socialLinks.filter(
          link => link.id !== action.payload
        );
        state.currentModSpace.updatedAt = new Date();
      }
    },

    updateSocialLink: (
      state,
      action: PayloadAction<{
        linkId: string;
        updates: Partial<ModSpace['socialLinks'][0]>;
      }>
    ) => {
      if (state.currentModSpace) {
        const link = state.currentModSpace.socialLinks.find(l => l.id === action.payload.linkId);
        if (link) {
          Object.assign(link, action.payload.updates);
          state.currentModSpace.updatedAt = new Date();
        }
      }
    },

    // Reset State
    resetModSpace: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  createModSpace,
  loadModSpace,
  updateModSpaceProfile,
  updateModSpaceTheme,
  updateModSpaceLayout,
  shareJournalEntry,
  unshareJournalEntry,
  updateSharedEntry,
  addMediaItem,
  removeMediaItem,
  likeEntry,
  followUser,
  unfollowUser,
  setViewingModSpace,
  setEditMode,
  setLayoutPreview,
  loadDiscoverFeed,
  addToDiscoverFeed,
  setLoading,
  setError,
  updatePrivacySettings,
  addSocialLink,
  removeSocialLink,
  updateSocialLink,
  resetModSpace,
} = modspaceSlice.actions;

export default modspaceSlice.reducer;