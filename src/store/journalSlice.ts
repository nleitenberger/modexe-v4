import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Journal, JournalPage, JournalState, RichTextContent } from '../types/journal.types';
import { StickerInstance } from '../types/sticker.types';

const initialState: JournalState = {
  currentJournal: null,
  currentSpreadIndex: 0,
  currentPageIndex: 0,
  isDirty: false,
  isLoading: false,
  error: null,
};

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    createJournal: (state, action: PayloadAction<{ title: string }>) => {
      const newJournal: Journal = {
        id: Date.now().toString(),
        title: action.payload.title,
        pages: [
          {
            id: `page-${Date.now()}-0`,
            pageNumber: 0,
            content: {
              text: '',
              formatting: [],
              textStyle: {
                fontSize: 16,
                fontFamily: 'System',
                lineHeight: 24,
                textAlign: 'left',
                color: '#000000',
              },
            },
            stickers: [],
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
                lineHeight: 24,
                textAlign: 'left',
                color: '#000000',
              },
            },
            stickers: [],
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
    },

    loadJournal: (state, action: PayloadAction<Journal>) => {
      state.currentJournal = action.payload;
      state.currentSpreadIndex = 0;
      state.currentPageIndex = 0;
      state.isDirty = false;
      state.isLoading = false;
      state.error = null;
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
              lineHeight: 24,
              textAlign: 'left',
              color: '#000000',
            },
          },
          stickers: [],
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
  },
});

export const {
  createJournal,
  loadJournal,
  updateJournalTitle,
  updatePageContent,
  addSticker,
  updateSticker,
  removeSticker,
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
} = journalSlice.actions;

export default journalSlice.reducer;