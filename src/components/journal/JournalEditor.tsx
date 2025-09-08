import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootState } from '../../store';
import { createJournal, updateJournalTitle } from '../../store/journalSlice';
import { loadStickerCategories } from '../../store/stickerSlice';
import JournalSpread from './JournalSpread';
import JournalToolbar from './JournalToolbar';
import StickerPalette from './StickerPalette';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Simple sticker categories to avoid circular reference issues
const SIMPLE_STICKER_CATEGORIES = [
  {
    id: 'emotions',
    name: 'Emotions',
    icon: '😊',
    color: '#FFE4E1',
    stickers: [
      {
        id: 'happy-1',
        name: 'Happy',
        emoji: '😊',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['happy', 'smile', 'joy'],
      },
      {
        id: 'love-1',
        name: 'Love',
        emoji: '❤️',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['love', 'heart', 'romance'],
      },
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    color: '#E8F5E8',
    stickers: [
      {
        id: 'tree-1',
        name: 'Tree',
        emoji: '🌳',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['tree', 'nature', 'green'],
      },
      {
        id: 'flower-1',
        name: 'Flower',
        emoji: '🌸',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['flower', 'bloom', 'pink'],
      },
    ],
  },
];

const JournalEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal, isLoading } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Title editing handlers
  const handleTitleEdit = () => {
    setTempTitle(currentJournal?.title || '');
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim() && currentJournal) {
      dispatch(updateJournalTitle({ id: currentJournal.id, title: tempTitle.trim() }));
    }
    setIsEditingTitle(false);
  };

  // Memoize the initialization to prevent infinite loops
  const shouldInitialize = useMemo(() => {
    return !currentJournal && !isLoading;
  }, [currentJournal, isLoading]);

  useEffect(() => {
    if (shouldInitialize) {
      // Initialize sticker categories with simple data
      dispatch(loadStickerCategories(SIMPLE_STICKER_CATEGORIES));

      // Create a new journal
      dispatch(createJournal({ title: 'My Journal' }));
    }
  }, [dispatch, shouldInitialize]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentJournal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.editorContainer}>
          {/* Title Header */}
          <View style={styles.titleContainer}>
            {isEditingTitle ? (
              <TextInput
                style={styles.titleInput}
                value={tempTitle}
                onChangeText={setTempTitle}
                onBlur={handleTitleSave}
                onSubmitEditing={handleTitleSave}
                autoFocus
                selectTextOnFocus
                placeholder="Enter journal title..."
                placeholderTextColor="#999"
              />
            ) : (
              <TouchableOpacity onPress={handleTitleEdit} style={styles.titleTouchable}>
                <Text style={styles.titleText}>
                  {currentJournal.title || 'Untitled Journal'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

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
    paddingHorizontal: 8,
    paddingVertical: 12,
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
  titleContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleTouchable: {
    paddingVertical: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
  },
});

export default JournalEditor;