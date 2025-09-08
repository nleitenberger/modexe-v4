import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StickerState, StickerInstance, Position, DragState } from '../types/sticker.types';

const initialState: StickerState = {
  availableStickers: [],
  placedStickers: [],
  draggedSticker: null,
  selectedSticker: null,
  isPaletteExpanded: false,
  activeCategoryId: null,
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
} = stickerSlice.actions;

export default stickerSlice.reducer;