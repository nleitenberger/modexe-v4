import React, { useEffect, useState } from 'react';
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
  const [showFavorites, setShowFavorites] = useState(true);
  const [recentlyUsed, setRecentlyUsed] = useState<Sticker[]>([]);

  const activeCategory = availableStickers.find(cat => cat.id === activeCategoryId);

  // Get frequently used stickers for quick access
  const getFavoriteStickers = (): Sticker[] => {
    const allStickers = availableStickers.flatMap(cat => cat.stickers);
    // For now, just return the first sticker from each category as favorites
    return availableStickers.map(cat => cat.stickers[0]).filter(Boolean);
  };

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
      zIndex: Date.now() + 1000000000, // Start above text layer
      pageId: targetPage.id,
      createdAt: new Date(),
    };

    dispatch(addSticker(newStickerInstance));
    
    // Add to recently used
    setRecentlyUsed(prev => {
      const filtered = prev.filter(s => s.id !== sticker.id);
      return [sticker, ...filtered].slice(0, 6); // Keep only 6 recent stickers
    });
    
    dispatch(togglePalette());
  };

  const handleClose = () => {
    dispatch(togglePalette());
  };

  const renderCompactSticker = ({ item: sticker }: { item: Sticker }) => (
    <TouchableOpacity
      style={styles.compactStickerButton}
      onPress={() => handleStickerSelect(sticker)}
    >
      <Text style={styles.compactStickerEmoji}>{sticker.emoji}</Text>
    </TouchableOpacity>
  );

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
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <Text style={styles.compactTitle}>Assets</Text>
        <TouchableOpacity style={styles.compactCloseButton} onPress={handleClose}>
          <Icon name="close" size="xs" color="#666" />
        </TouchableOpacity>
      </View>

      {/* Quick Access Favorites */}
      {(recentlyUsed.length > 0 || getFavoriteStickers().length > 0) && (
        <View style={styles.quickAccessSection}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setShowFavorites(!showFavorites)}
          >
            <Icon name={showFavorites ? "chevron-down" : "chevron-right"} size="xs" color="#666" />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </TouchableOpacity>
          
          {showFavorites && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickAccessContainer}
              contentContainerStyle={styles.quickAccessContent}
            >
              {recentlyUsed.length > 0 && recentlyUsed.map((sticker) => (
                <TouchableOpacity
                  key={`recent-${sticker.id}`}
                  style={styles.quickAccessButton}
                  onPress={() => handleStickerSelect(sticker)}
                >
                  <Text style={styles.quickAccessEmoji}>{sticker.emoji}</Text>
                </TouchableOpacity>
              ))}
              {recentlyUsed.length === 0 && getFavoriteStickers().map((sticker) => (
                <TouchableOpacity
                  key={`fav-${sticker.id}`}
                  style={styles.quickAccessButton}
                  onPress={() => handleStickerSelect(sticker)}
                >
                  <Text style={styles.quickAccessEmoji}>{sticker.emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Compact Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.compactCategoriesContainer}
        contentContainerStyle={styles.compactCategoriesContent}
      >
        {availableStickers.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.compactCategoryTab,
              activeCategoryId === category.id && styles.activeCategoryTab,
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <Text style={styles.compactCategoryIcon}>{category.icon}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Compact Stickers grid */}
      {activeCategory && activeCategory.stickers && activeCategory.stickers.length > 0 ? (
        <FlatList
          data={activeCategory.stickers}
          renderItem={renderSticker}
          keyExtractor={(item) => item.id}
          numColumns={6}
          style={styles.compactStickersGrid}
          contentContainerStyle={styles.compactStickersContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.compactEmptyState}>
          <Text style={styles.compactEmptyStateText}>
            {availableStickers.length === 0 
              ? 'Loading...' 
              : 'No stickers'}
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
  // Legacy styles for backward compatibility
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
  // New compact styles
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    minHeight: 40,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  compactCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Quick Access Section
  quickAccessSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  quickAccessContainer: {
    maxHeight: 50,
  },
  quickAccessContent: {
    paddingHorizontal: 8,
  },
  quickAccessButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  quickAccessEmoji: {
    fontSize: 16,
  },
  // Compact categories
  compactCategoriesContainer: {
    maxHeight: 50,
  },
  compactCategoriesContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  compactCategoryTab: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  compactCategoryIcon: {
    fontSize: 16,
  },
  activeCategoryTab: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  // Legacy category styles
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
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  // Compact stickers grid
  compactStickersGrid: {
    flex: 1,
  },
  compactStickersContent: {
    padding: 8,
  },
  compactStickerButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  compactStickerEmoji: {
    fontSize: 14,
  },
  compactEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  compactEmptyStateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  // Legacy styles
  stickersGrid: {
    flex: 1,
  },
  stickersContent: {
    padding: 16,
  },
  stickerButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  stickerEmoji: {
    fontSize: 14,
    marginBottom: 1,
  },
  stickerEmojiLandscape: {
    fontSize: 12,
    marginBottom: 1,
  },
  stickerName: {
    fontSize: 8,
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