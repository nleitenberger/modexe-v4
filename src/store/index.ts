import { configureStore } from '@reduxjs/toolkit';
import journalReducer from './journalSlice';
import stickerReducer from './stickerSlice';
import modspaceReducer from './modspaceSlice';

export const store = configureStore({
  reducer: {
    journal: journalReducer,
    sticker: stickerReducer,
    modspace: modspaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'journal/createJournal', 
          'journal/loadJournal',
          'journal/updatePageContent',
          'journal/addSticker',
          'journal/updateSticker',
          'sticker/loadStickerCategories',
          'sticker/selectSticker',
          'modspace/createModSpace',
          'modspace/loadModSpace',
          'modspace/shareJournalEntry',
          'modspace/addMediaItem',
          'modspace/setViewingModSpace'
        ],
        ignoredPaths: [
          'journal.currentJournal.createdAt', 
          'journal.currentJournal.updatedAt',
          'journal.currentJournal.pages',
          'sticker.availableStickers',
          'sticker.selectedSticker.createdAt',
          'sticker.selectedSticker',
          'sticker.placedStickers',
          'modspace.currentModSpace',
          'modspace.viewingModSpace',
          'modspace.sharedContent',
          'modspace.discoverFeed'
        ],
        ignoredActionPaths: [
          'payload.createdAt', 
          'payload.updatedAt',
          'payload.sticker.createdAt',
          'payload.updates.createdAt',
          'payload.shareDate',
          'payload.uploadDate',
          'payload.joinDate',
          'payload.lastActive'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;