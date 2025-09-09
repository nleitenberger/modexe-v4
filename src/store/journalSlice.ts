import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Journal, JournalPage, JournalState, RichTextContent, PageSize } from '../types/journal.types';
import { StickerInstance } from '../types/sticker.types';
import { HandwritingStroke } from '../types/handwriting.types';
import { generateJournalId, generatePageId } from '../utils/uniqueId';

const initialState: JournalState = {
  currentJournal: null,
  currentSpreadIndex: 0,
  currentPageIndex: 0,
  isDirty: false,
  isLoading: false,
  error: null,
  originalSharedEntryId: null, // Track the original shared entry if editing
};

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    createJournal: (state, action: PayloadAction<{ title: string; pageSize?: PageSize }>) => {
      const newJournal: Journal = {
        id: generateJournalId(),
        title: action.payload.title,
        pageSize: action.payload.pageSize || PageSize.JOURNAL, // Default to journal size
        pages: [
          {
            id: generatePageId(0),
            pageNumber: 0,
            content: {
              text: '',
              formatting: [],
              textStyle: {
                fontSize: 16,
                fontFamily: 'System',
                lineHeight: 1.5,
                textAlign: 'left',
                color: '#000000',
              },
            },
            stickers: [],
            handwritingStrokes: [],
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
          {
            id: `page-${Date.now()}-1`,
            pageNumber: 1,
            content: {
              text: '',
              formatting: [],
              textStyle: {
                fontSize: 16,
                fontFamily: 'System',
                lineHeight: 1.5,
                textAlign: 'left',
                color: '#000000',
              },
            },
            stickers: [],
            handwritingStrokes: [],
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.currentJournal = newJournal;
      state.currentSpreadIndex = 0;
      state.currentPageIndex = 0;
      state.isDirty = true;
      state.originalSharedEntryId = null; // Clear shared entry ID for new journals
    },

    loadJournal: (state, action: PayloadAction<Journal>) => {
      state.currentJournal = action.payload;
      state.currentSpreadIndex = 0;
      state.currentPageIndex = 0;
      state.isDirty = false;
      state.isLoading = false;
      state.error = null;
      // Keep existing originalSharedEntryId if not specified
    },

    loadJournalFromSharedEntry: (state, action: PayloadAction<{ journal: Journal; sharedEntryId: string }>) => {
      state.currentJournal = action.payload.journal;
      state.currentSpreadIndex = 0;
      state.currentPageIndex = 0;
      state.isDirty = false;
      state.isLoading = false;
      state.error = null;
      state.originalSharedEntryId = action.payload.sharedEntryId; // Track the original shared entry
    },

    updateJournalTitle: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      if (state.currentJournal && state.currentJournal.id === action.payload.id) {
        state.currentJournal.title = action.payload.title;
        state.currentJournal.updatedAt = new Date();
        state.isDirty = true;
      }
    },

    updateJournalPageSize: (
      state,
      action: PayloadAction<{ id: string; pageSize: PageSize }>
    ) => {
      if (state.currentJournal && state.currentJournal.id === action.payload.id) {
        state.currentJournal.pageSize = action.payload.pageSize;
        state.currentJournal.updatedAt = new Date();
        state.isDirty = true;
      }
    },

    updatePageContent: (
      state,
      action: PayloadAction<{ pageId: string; content: RichTextContent }>
    ) => {
      if (state.currentJournal) {
        const page = state.currentJournal.pages.find(p => p.id === action.payload.pageId);
        if (page) {
          page.content = action.payload.content;
          state.currentJournal.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },

    addSticker: (state, action: PayloadAction<StickerInstance>) => {
      if (state.currentJournal) {
        const page = state.currentJournal.pages.find(p => p.id === action.payload.pageId);
        if (page) {
          page.stickers.push(action.payload);
          state.currentJournal.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },

    updateSticker: (
      state,
      action: PayloadAction<{ stickerId: string; updates: Partial<StickerInstance> }>
    ) => {
      if (state.currentJournal) {
        for (const page of state.currentJournal.pages) {
          const stickerIndex = page.stickers.findIndex((s: StickerInstance) => s.id === action.payload.stickerId);
          if (stickerIndex !== -1) {
            page.stickers[stickerIndex] = {
              ...page.stickers[stickerIndex],
              ...action.payload.updates,
            };
            state.currentJournal.updatedAt = new Date();
            state.isDirty = true;
            break;
          }
        }
      }
    },

    removeSticker: (state, action: PayloadAction<string>) => {
      if (state.currentJournal) {
        for (const page of state.currentJournal.pages) {
          const stickerIndex = page.stickers.findIndex((s: StickerInstance) => s.id === action.payload);
          if (stickerIndex !== -1) {
            page.stickers.splice(stickerIndex, 1);
            state.currentJournal.updatedAt = new Date();
            state.isDirty = true;
            break;
          }
        }
      }
    },

    sendStickerToFront: (state, action: PayloadAction<string>) => {
      if (state.currentJournal) {
        for (const page of state.currentJournal.pages) {
          const stickerIndex = page.stickers.findIndex((s: StickerInstance) => s.id === action.payload);
          if (stickerIndex !== -1) {
            const sticker = page.stickers[stickerIndex];
            const maxZ = Math.max(...page.stickers.map(s => s.zIndex));
            page.stickers[stickerIndex] = {
              ...sticker,
              zIndex: maxZ + 1,
            };
            state.currentJournal.updatedAt = new Date();
            state.isDirty = true;
            break;
          }
        }
      }
    },

    sendStickerToBack: (state, action: PayloadAction<string>) => {
      if (state.currentJournal) {
        for (const page of state.currentJournal.pages) {
          const stickerIndex = page.stickers.findIndex((s: StickerInstance) => s.id === action.payload);
          if (stickerIndex !== -1) {
            const sticker = page.stickers[stickerIndex];
            const minZ = Math.min(...page.stickers.map(s => s.zIndex));
            page.stickers[stickerIndex] = {
              ...sticker,
              zIndex: Math.max(1, minZ - 1),
            };
            state.currentJournal.updatedAt = new Date();
            state.isDirty = true;
            break;
          }
        }
      }
    },

    sendStickerBehindText: (state, action: PayloadAction<string>) => {
      if (state.currentJournal) {
        for (const page of state.currentJournal.pages) {
          const stickerIndex = page.stickers.findIndex((s: StickerInstance) => s.id === action.payload);
          if (stickerIndex !== -1) {
            const sticker = page.stickers[stickerIndex];
            const backgroundStickers = page.stickers.filter(s => s.zIndex < 1000000000);
            const maxBackgroundZ = Math.max(0, ...backgroundStickers.map(s => s.zIndex));
            page.stickers[stickerIndex] = {
              ...sticker,
              zIndex: Math.min(maxBackgroundZ + 1, 999999999),
            };
            state.currentJournal.updatedAt = new Date();
            state.isDirty = true;
            break;
          }
        }
      }
    },

    sendStickerAboveText: (state, action: PayloadAction<string>) => {
      if (state.currentJournal) {
        for (const page of state.currentJournal.pages) {
          const stickerIndex = page.stickers.findIndex((s: StickerInstance) => s.id === action.payload);
          if (stickerIndex !== -1) {
            const sticker = page.stickers[stickerIndex];
            const foregroundStickers = page.stickers.filter(s => s.zIndex >= 1000000000);
            const maxForegroundZ = Math.max(1000000000, ...foregroundStickers.map(s => s.zIndex));
            page.stickers[stickerIndex] = {
              ...sticker,
              zIndex: maxForegroundZ + 1,
            };
            state.currentJournal.updatedAt = new Date();
            state.isDirty = true;
            break;
          }
        }
      }
    },

    setCurrentSpread: (state, action: PayloadAction<number>) => {
      state.currentSpreadIndex = Math.max(0, action.payload);
      // Sync page index with spread index
      state.currentPageIndex = state.currentSpreadIndex * 2;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      if (state.currentJournal) {
        state.currentPageIndex = Math.max(0, Math.min(action.payload, state.currentJournal.pages.length - 1));
        // Sync spread index with page index
        state.currentSpreadIndex = Math.floor(state.currentPageIndex / 2);
      }
    },

    nextSpread: (state) => {
      if (state.currentJournal) {
        const maxSpread = Math.floor((state.currentJournal.pages.length - 1) / 2);
        state.currentSpreadIndex = Math.min(state.currentSpreadIndex + 1, maxSpread);
        // Sync page index
        state.currentPageIndex = state.currentSpreadIndex * 2;
      }
    },

    nextPage: (state) => {
      if (state.currentJournal) {
        const maxPage = state.currentJournal.pages.length - 1;
        state.currentPageIndex = Math.min(state.currentPageIndex + 1, maxPage);
        // Sync spread index
        state.currentSpreadIndex = Math.floor(state.currentPageIndex / 2);
      }
    },

    prevSpread: (state) => {
      state.currentSpreadIndex = Math.max(0, state.currentSpreadIndex - 1);
      // Sync page index
      state.currentPageIndex = state.currentSpreadIndex * 2;
    },

    prevPage: (state) => {
      state.currentPageIndex = Math.max(0, state.currentPageIndex - 1);
      // Sync spread index
      state.currentSpreadIndex = Math.floor(state.currentPageIndex / 2);
    },

    addPage: (state) => {
      if (state.currentJournal) {
        const newPageNumber = state.currentJournal.pages.length;
        const newPage: JournalPage = {
          id: `page-${Date.now()}-${newPageNumber}`,
          pageNumber: newPageNumber,
          content: {
            text: '',
            formatting: [],
            textStyle: {
              fontSize: 16,
              fontFamily: 'System',
              lineHeight: 1.5,
              textAlign: 'left',
              color: '#000000',
            },
          },
          stickers: [],
          handwritingStrokes: [],
          backgroundColor: '#ffffff',
          textColor: '#000000',
        };
        state.currentJournal.pages.push(newPage);
        state.currentJournal.updatedAt = new Date();
        state.isDirty = true;
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    markSaved: (state) => {
      state.isDirty = false;
    },

    // Handwriting actions
    addHandwritingStroke: (state, action: PayloadAction<{ pageId: string; stroke: HandwritingStroke }>) => {
      if (state.currentJournal) {
        const page = state.currentJournal.pages.find(p => p.id === action.payload.pageId);
        if (page) {
          page.handwritingStrokes.push(action.payload.stroke);
          state.currentJournal.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },

    updateHandwritingStrokes: (state, action: PayloadAction<{ pageId: string; strokes: HandwritingStroke[] }>) => {
      if (state.currentJournal) {
        const page = state.currentJournal.pages.find(p => p.id === action.payload.pageId);
        if (page) {
          page.handwritingStrokes = action.payload.strokes;
          state.currentJournal.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },

    clearHandwritingStrokes: (state, action: PayloadAction<string>) => {
      if (state.currentJournal) {
        const page = state.currentJournal.pages.find(p => p.id === action.payload);
        if (page) {
          page.handwritingStrokes = [];
          state.currentJournal.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
  },
});

export const {
  createJournal,
  loadJournal,
  loadJournalFromSharedEntry,
  updateJournalTitle,
  updateJournalPageSize,
  updatePageContent,
  addSticker,
  updateSticker,
  removeSticker,
  sendStickerToFront,
  sendStickerToBack,
  sendStickerBehindText,
  sendStickerAboveText,
  setCurrentSpread,
  setCurrentPage,
  nextSpread,
  nextPage,
  prevSpread,
  prevPage,
  addPage,
  setLoading,
  setError,
  markSaved,
  addHandwritingStroke,
  updateHandwritingStrokes,
  clearHandwritingStrokes,
} = journalSlice.actions;

export default journalSlice.reducer;