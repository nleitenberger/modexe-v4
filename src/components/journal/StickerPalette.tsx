import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';

// Sticker categories data
const STICKER_CATEGORIES = [
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
      {
        id: 'excited-1',
        name: 'Excited',
        emoji: '🤩',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['excited', 'wow', 'star'],
      },
      {
        id: 'laugh-1',
        name: 'Laugh',
        emoji: '😂',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['laugh', 'funny', 'joy'],
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
      {
        id: 'sun-1',
        name: 'Sun',
        emoji: '☀️',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['sun', 'bright', 'yellow'],
      },
      {
        id: 'rainbow-1',
        name: 'Rainbow',
        emoji: '🌈',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['rainbow', 'colors', 'pretty'],
      },
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '⭐',
    color: '#FFF5E6',
    stickers: [
      {
        id: 'star-1',
        name: 'Star',
        emoji: '⭐',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['star', 'shine', 'favorite'],
      },
      {
        id: 'heart-2',
        name: 'Sparkles',
        emoji: '✨',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['sparkles', 'magic', 'shine'],
      },
      {
        id: 'fire-1',
        name: 'Fire',
        emoji: '🔥',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['fire', 'hot', 'energy'],
      },
      {
        id: 'trophy-1',
        name: 'Trophy',
        emoji: '🏆',
        category: null,
        size: { width: 32, height: 32 },
        tags: ['trophy', 'win', 'achievement'],
      },
    ],
  },
];
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setActiveCategory, togglePalette, loadStickerCategories } from '../../store/stickerSlice';
import { addSticker } from '../../store/journalSlice';
import { Sticker, StickerInstance } from '../../types/sticker.types';
import { useOrientation } from '../../utils/useOrientation';
import Icon from '../common/Icon';

const StickerPalette: React.FC = () => {
  const dispatch = useDispatch();
  const { availableStickers, activeCategoryId } = useSelector(
    (state: RootState) => state.sticker
  );
  const { currentJournal, currentSpreadIndex, currentPageIndex } = useSelector(
    (state: RootState) => state.journal
  );
  const { isPortrait } = useOrientation();

  const activeCategory = availableStickers.find(cat => cat.id === activeCategoryId);

  // Initialize sticker categories when component mounts
  useEffect(() => {
    dispatch(loadStickerCategories(STICKER_CATEGORIES));
  }, [dispatch]);

  const handleCategorySelect = (categoryId: string) => {
    dispatch(setActiveCategory(categoryId));
  };

  const handleStickerSelect = (sticker: Sticker) => {
    if (!currentJournal) return;

    // Get the current page based on orientation
    let targetPage;
    if (isPortrait) {
      // In portrait mode, use the current page index
      targetPage = currentJournal.pages[currentPageIndex];
    } else {
      // In landscape mode, prefer the right page, fall back to left page
      const rightPageIndex = currentSpreadIndex * 2 + 1;
      const leftPageIndex = currentSpreadIndex * 2;
      targetPage = currentJournal.pages[rightPageIndex] || currentJournal.pages[leftPageIndex];
    }

    if (!targetPage) return;

    // Create new sticker instance
    const newStickerInstance: StickerInstance = {
      id: `sticker-${Date.now()}`,
      stickerId: sticker.id,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
      rotation: 0,
      scale: 1,
      zIndex: Date.now(),
      pageId: targetPage.id,
      createdAt: new Date(),
    };

    dispatch(addSticker(newStickerInstance));
    dispatch(togglePalette());
  };

  const handleClose = () => {
    dispatch(togglePalette());
  };

  const renderSticker = ({ item: sticker }: { item: Sticker }) => (
    <TouchableOpacity
      style={styles.stickerButton}
      onPress={() => handleStickerSelect(sticker)}
    >
      <Text style={isPortrait ? styles.stickerEmoji : styles.stickerEmojiLandscape}>{sticker.emoji}</Text>
      <Text style={styles.stickerName}>{sticker.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.palette}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stickers</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="close" size="sm" color="#666" />
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {availableStickers.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategoryId === category.id && styles.activeCategoryTab,
              { backgroundColor: category.color },
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stickers grid */}
      {activeCategory && activeCategory.stickers && activeCategory.stickers.length > 0 ? (
        <FlatList
          data={activeCategory.stickers}
          renderItem={renderSticker}
          keyExtractor={(item) => item.id}
          numColumns={5}
          style={styles.stickersGrid}
          contentContainerStyle={styles.stickersContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {availableStickers.length === 0 
              ? 'Loading stickers...' 
              : 'No stickers available in this category'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  palette: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  categoriesContainer: {
    maxHeight: 80,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryTab: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  stickersGrid: {
    flex: 1,
  },
  stickersContent: {
    padding: 16,
  },
  stickerButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 3,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stickerEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  stickerEmojiLandscape: {
    fontSize: 14,
    marginBottom: 2,
  },
  stickerName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default StickerPalette;