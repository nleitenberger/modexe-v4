import { configureStore } from '@reduxjs/toolkit';
import journalReducer from './journalSlice';
import stickerReducer from './stickerSlice';

export const store = configureStore({
  reducer: {
    journal: journalReducer,
    sticker: stickerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['journal/createJournal', 'journal/loadJournal'],
        ignoredPaths: ['journal.currentJournal.createdAt', 'journal.currentJournal.updatedAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;