import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootState } from '../../store';
import { createJournal } from '../../store/journalSlice';
import { loadStickerCategories } from '../../store/stickerSlice';
import { STICKER_CATEGORIES } from '../../constants/stickers';
import JournalSpread from './JournalSpread';
import JournalToolbar from './JournalToolbar';
import StickerPalette from './StickerPalette';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const JournalEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal, isLoading } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);

  useEffect(() => {
    // Initialize sticker categories
    dispatch(loadStickerCategories(STICKER_CATEGORIES));

    // Create a new journal if none exists
    if (!currentJournal) {
      dispatch(createJournal({ title: 'My Journal' }));
    }
  }, [dispatch, currentJournal]);

  if (isLoading || !currentJournal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.editorContainer}>
          {/* Main journal spread area */}
          <View style={styles.journalContainer}>
            <JournalSpread journal={currentJournal} />
          </View>

          {/* Toolbar at the bottom */}
          <JournalToolbar />

          {/* Sticker palette overlay */}
          {isPaletteExpanded && (
            <View style={styles.paletteOverlay}>
              <StickerPalette />
            </View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  editorContainer: {
    flex: 1,
    position: 'relative',
  },
  journalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paletteOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    maxHeight: screenHeight * 0.4,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default JournalEditor;