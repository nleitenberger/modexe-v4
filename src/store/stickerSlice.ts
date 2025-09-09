import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StickerState, StickerInstance, Position, DragState } from '../types/sticker.types';

const initialState: StickerState = {
  availableStickers: [],
  placedStickers: [],
  draggedSticker: null,
  selectedSticker: null,
  selectedStickers: [],
  isPaletteExpanded: false,
  activeCategoryId: null,
  multiSelectMode: false,
  favoriteStickers: [],
  recentStickers: [],
  transformHistory: [],
  isTransforming: false,
};

const stickerSlice = createSlice({
  name: 'sticker',
  initialState,
  reducers: {
    loadStickerCategories: (state, action) => {
      state.availableStickers = action.payload;
      if (action.payload.length > 0) {
        state.activeCategoryId = action.payload[0].id;
      }
    },

    togglePalette: (state) => {
      state.isPaletteExpanded = !state.isPaletteExpanded;
    },

    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategoryId = action.payload;
    },

    startDrag: (state, action: PayloadAction<StickerInstance>) => {
      state.draggedSticker = action.payload;
    },

    updateDragPosition: (state, action: PayloadAction<Position>) => {
      if (state.draggedSticker) {
        state.draggedSticker.position = action.payload;
      }
    },

    endDrag: (state) => {
      state.draggedSticker = null;
    },

    selectSticker: (state, action: PayloadAction<StickerInstance | null>) => {
      state.selectedSticker = action.payload;
    },

    updateStickerPosition: (
      state,
      action: PayloadAction<{ stickerId: string; position: Position }>
    ) => {
      const sticker = state.placedStickers.find(s => s.id === action.payload.stickerId);
      if (sticker) {
        sticker.position = action.payload.position;
      }
    },

    updateStickerTransform: (
      state,
      action: PayloadAction<{
        stickerId: string;
        scale?: number;
        rotation?: number;
      }>
    ) => {
      const sticker = state.placedStickers.find(s => s.id === action.payload.stickerId);
      if (sticker) {
        if (action.payload.scale !== undefined) {
          sticker.scale = action.payload.scale;
        }
        if (action.payload.rotation !== undefined) {
          sticker.rotation = action.payload.rotation;
        }
      }
    },

    deletePlacedSticker: (state, action: PayloadAction<string>) => {
      state.placedStickers = state.placedStickers.filter(s => s.id !== action.payload);
      if (state.selectedSticker?.id === action.payload) {
        state.selectedSticker = null;
      }
    },

    clearSelection: (state) => {
      state.selectedSticker = null;
    },

    bringToFront: (state, action: PayloadAction<string>) => {
      const sticker = state.placedStickers.find(s => s.id === action.payload);
      if (sticker) {
        const maxZIndex = Math.max(...state.placedStickers.map(s => s.zIndex));
        sticker.zIndex = maxZIndex + 1;
      }
    },

    sendToBack: (state, action: PayloadAction<string>) => {
      const sticker = state.placedStickers.find(s => s.id === action.payload);
      if (sticker) {
        const minZIndex = Math.min(...state.placedStickers.map(s => s.zIndex));
        sticker.zIndex = minZIndex - 1;
      }
    },

    // Multi-select actions
    toggleMultiSelectMode: (state) => {
      state.multiSelectMode = !state.multiSelectMode;
      if (!state.multiSelectMode) {
        state.selectedStickers = [];
      }
    },

    addToMultiSelect: (state, action: PayloadAction<string>) => {
      if (!state.selectedStickers.includes(action.payload)) {
        state.selectedStickers.push(action.payload);
      }
    },

    removeFromMultiSelect: (state, action: PayloadAction<string>) => {
      state.selectedStickers = state.selectedStickers.filter(id => id !== action.payload);
    },

    clearMultiSelect: (state) => {
      state.selectedStickers = [];
    },

    selectAllOnPage: (state, action: PayloadAction<string>) => {
      const pageStickers = state.placedStickers
        .filter(sticker => sticker.pageId === action.payload)
        .map(sticker => sticker.id);
      state.selectedStickers = pageStickers;
      state.multiSelectMode = pageStickers.length > 1;
    },


    // Favorites actions
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const stickerId = action.payload;
      if (state.favoriteStickers.includes(stickerId)) {
        state.favoriteStickers = state.favoriteStickers.filter(id => id !== stickerId);
      } else {
        state.favoriteStickers.push(stickerId);
      }
    },

    addToRecent: (state, action: PayloadAction<string>) => {
      const stickerId = action.payload;
      // Remove if already exists
      state.recentStickers = state.recentStickers.filter(id => id !== stickerId);
      // Add to beginning
      state.recentStickers.unshift(stickerId);
      // Keep only last 20 recent stickers
      state.recentStickers = state.recentStickers.slice(0, 20);
    },

    // Bulk operations
    executeBulkOperation: (state, action: PayloadAction<any>) => {
      const { type, stickerIds, parameters } = action.payload;
      
      stickerIds.forEach((stickerId: string) => {
        const sticker = state.placedStickers.find(s => s.id === stickerId);
        if (!sticker) return;

        switch (type) {
          case 'delete':
            state.placedStickers = state.placedStickers.filter(s => s.id !== stickerId);
            break;
          case 'move':
            if (parameters?.position) {
              sticker.position = parameters.position;
            }
            break;
          case 'resize':
            if (parameters?.scale) {
              sticker.scale = Math.max(0.3, Math.min(3.0, parameters.scale));
            }
            break;
          case 'rotate':
            if (parameters?.rotation !== undefined) {
              sticker.rotation = parameters.rotation;
            }
            break;
          case 'layer':
            if (parameters?.zIndex !== undefined) {
              sticker.zIndex = parameters.zIndex;
            }
            break;
        }
      });
    },

    // Transform history
    addTransformHistoryEntry: (state, action: PayloadAction<any>) => {
      state.transformHistory.push(action.payload);
      // Keep only last 50 history entries
      if (state.transformHistory.length > 50) {
        state.transformHistory = state.transformHistory.slice(-50);
      }
    },

    // Global transform state (e.g., resizing/rotating) to disable page scroll
    setIsTransforming: (state, action: PayloadAction<boolean>) => {
      state.isTransforming = action.payload;
    },
  },
});

export const {
  loadStickerCategories,
  togglePalette,
  setActiveCategory,
  startDrag,
  updateDragPosition,
  endDrag,
  selectSticker,
  updateStickerPosition,
  updateStickerTransform,
  deletePlacedSticker,
  clearSelection,
  bringToFront,
  sendToBack,
  // Multi-select actions
  toggleMultiSelectMode,
  addToMultiSelect,
  removeFromMultiSelect,
  clearMultiSelect,
  selectAllOnPage,
  // Asset drawer actions
  // Favorites actions
  toggleFavorite,
  addToRecent,
  // Bulk operations
  executeBulkOperation,
  // Transform history
  addTransformHistoryEntry,
  setIsTransforming,
} = stickerSlice.actions;

export default stickerSlice.reducer;