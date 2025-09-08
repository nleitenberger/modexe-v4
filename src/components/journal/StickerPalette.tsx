import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setActiveCategory, togglePalette } from '../../store/stickerSlice';
import { addSticker } from '../../store/journalSlice';
import { Sticker, StickerInstance } from '../../types/sticker.types';

const StickerPalette: React.FC = () => {
  const dispatch = useDispatch();
  const { availableStickers, activeCategoryId } = useSelector(
    (state: RootState) => state.sticker
  );
  const { currentJournal, currentSpreadIndex } = useSelector(
    (state: RootState) => state.journal
  );

  const activeCategory = availableStickers.find(cat => cat.id === activeCategoryId);

  const handleCategorySelect = (categoryId: string) => {
    dispatch(setActiveCategory(categoryId));
  };

  const handleStickerSelect = (sticker: Sticker) => {
    if (!currentJournal) return;

    // Get the current right page (or left if right doesn't exist)
    const rightPageIndex = currentSpreadIndex * 2 + 1;
    const leftPageIndex = currentSpreadIndex * 2;
    const targetPage = currentJournal.pages[rightPageIndex] || currentJournal.pages[leftPageIndex];

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
      <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
      <Text style={styles.stickerName}>{sticker.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.palette}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stickers</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>×</Text>
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
      {activeCategory && (
        <FlatList
          data={activeCategory.stickers}
          renderItem={renderSticker}
          keyExtractor={(item) => item.id}
          numColumns={4}
          style={styles.stickersGrid}
          contentContainerStyle={styles.stickersContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  palette: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
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
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stickerEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  stickerName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default StickerPalette;