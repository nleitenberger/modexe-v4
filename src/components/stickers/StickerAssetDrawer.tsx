import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  toggleAssetDrawer,
  setAssetDrawerOpen,
  toggleFavorite,
  addToRecent,
  toggleMultiSelectMode,
  addToMultiSelect,
  removeFromMultiSelect,
  clearMultiSelect,
  executeBulkOperation,
  selectSticker,
} from '../../store/stickerSlice';
import { addSticker, deleteSticker } from '../../store/journalSlice';
import {
  Sticker,
  StickerInstance,
  StickerThumbnail,
  AssetLibraryFilter,
  BulkOperation,
} from '../../types/sticker.types';
import { useOrientation } from '../../utils/useOrientation';
import Icon from '../common/Icon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StickerAssetDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { isPortrait } = useOrientation();
  const {
    isAssetDrawerOpen,
    availableStickers,
    multiSelectMode,
    selectedStickers,
    favoriteStickers,
    recentStickers,
  } = useSelector((state: RootState) => state.sticker);
  const { currentJournal, currentPageIndex, currentSpreadIndex } = useSelector(
    (state: RootState) => state.journal
  );

  // Local state
  const [activeTab, setActiveTab] = useState<'library' | 'onPage' | 'layers'>('library');
  const [filter, setFilter] = useState<AssetLibraryFilter>({
    searchQuery: '',
    category: null,
    sortBy: 'name',
    showOnlyFavorites: false,
    showOnlyOnPage: false,
  });

  // Drawer animation
  const drawerWidth = isPortrait ? screenWidth * 0.85 : screenWidth * 0.4;
  const translateX = useSharedValue(isAssetDrawerOpen ? 0 : -drawerWidth);

  useEffect(() => {
    translateX.value = withSpring(isAssetDrawerOpen ? 0 : -drawerWidth, {
      damping: 20,
      stiffness: 150,
    });
  }, [isAssetDrawerOpen, drawerWidth]);

  // Get current page stickers
  const currentPageStickers = useMemo(() => {
    if (!currentJournal) return [];
    
    let targetPageId;
    if (isPortrait) {
      targetPageId = currentJournal.pages[currentPageIndex]?.id;
    } else {
      const rightPageIndex = currentSpreadIndex * 2 + 1;
      const leftPageIndex = currentSpreadIndex * 2;
      targetPageId = currentJournal.pages[rightPageIndex]?.id || 
                   currentJournal.pages[leftPageIndex]?.id;
    }

    if (!targetPageId) return [];

    const page = currentJournal.pages.find(p => p.id === targetPageId);
    return page?.stickers || [];
  }, [currentJournal, currentPageIndex, currentSpreadIndex, isPortrait]);

  // Filter and sort stickers
  const filteredStickers = useMemo(() => {
    let stickers: Sticker[] = [];

    // Get stickers from categories
    availableStickers.forEach(category => {
      if (!filter.category || category.id === filter.category) {
        stickers.push(...category.stickers);
      }
    });

    // Apply search filter
    if (filter.searchQuery) {
      stickers = stickers.filter(sticker =>
        sticker.name.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
        sticker.tags.some(tag =>
          tag.toLowerCase().includes(filter.searchQuery.toLowerCase())
        )
      );
    }

    // Apply favorites filter
    if (filter.showOnlyFavorites) {
      stickers = stickers.filter(sticker => favoriteStickers.includes(sticker.id));
    }

    // Sort stickers
    switch (filter.sortBy) {
      case 'recent':
        stickers.sort((a, b) => {
          const aIndex = recentStickers.indexOf(a.id);
          const bIndex = recentStickers.indexOf(b.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        break;
      case 'name':
        stickers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'usage':
        // TODO: Implement usage sorting based on usage stats
        break;
      default:
        break;
    }

    return stickers;
  }, [availableStickers, filter, favoriteStickers, recentStickers]);

  // Convert page stickers to thumbnails
  const pageThumbnails: StickerThumbnail[] = useMemo(() => {
    return currentPageStickers.map(stickerInstance => {
      const stickerData = availableStickers
        .flatMap(cat => cat.stickers)
        .find(s => s.id === stickerInstance.stickerId);

      return {
        id: stickerInstance.id,
        stickerId: stickerInstance.stickerId,
        pageId: stickerInstance.pageId,
        thumbnail: stickerData?.emoji || '😊',
        position: stickerInstance.position,
        scale: stickerInstance.scale,
        rotation: stickerInstance.rotation,
        isSelected: selectedStickers.includes(stickerInstance.id),
      };
    });
  }, [currentPageStickers, availableStickers, selectedStickers]);

  // Gesture handler for drawer
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startX: number }) => {
      context.startX = translateX.value;
    },
    onActive: (event, context: { startX: number }) => {
      const newTranslateX = context.startX + event.translationX;
      translateX.value = Math.max(-drawerWidth, Math.min(0, newTranslateX));
    },
    onEnd: (event) => {
      const shouldClose = event.velocityX < -500 || translateX.value < -drawerWidth / 2;
      
      if (shouldClose) {
        translateX.value = withSpring(-drawerWidth);
        runOnJS(dispatch)(setAssetDrawerOpen(false));
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAssetDrawerOpen ? 0.5 : 0, { duration: 300 }),
  }));

  // Event handlers
  const handleClose = () => {
    dispatch(setAssetDrawerOpen(false));
  };

  const handleStickerSelect = (sticker: Sticker) => {
    if (!currentJournal) return;

    // Add to recent stickers
    dispatch(addToRecent(sticker.id));

    // Get target page
    let targetPage;
    if (isPortrait) {
      targetPage = currentJournal.pages[currentPageIndex];
    } else {
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
      zIndex: Date.now() + 1000000000,
      pageId: targetPage.id,
      createdAt: new Date(),
    };

    dispatch(addSticker(newStickerInstance));
  };

  const handleThumbnailTap = (thumbnail: StickerThumbnail) => {
    if (multiSelectMode) {
      if (thumbnail.isSelected) {
        dispatch(removeFromMultiSelect(thumbnail.id));
      } else {
        dispatch(addToMultiSelect(thumbnail.id));
      }
    } else {
      // Select sticker on page
      const stickerInstance = currentPageStickers.find(s => s.id === thumbnail.id);
      if (stickerInstance) {
        dispatch(selectSticker(stickerInstance));
      }
      handleClose();
    }
  };

  const handleToggleFavorite = (stickerId: string) => {
    dispatch(toggleFavorite(stickerId));
  };

  const handleBulkDelete = () => {
    if (selectedStickers.length === 0) return;
    
    const bulkOp: BulkOperation = {
      type: 'delete',
      stickerIds: selectedStickers,
    };
    
    dispatch(executeBulkOperation(bulkOp));
    dispatch(clearMultiSelect());
  };

  // Render methods
  const renderStickerItem = ({ item: sticker }: { item: Sticker }) => {
    const isFavorite = favoriteStickers.includes(sticker.id);
    const isRecent = recentStickers.includes(sticker.id);

    return (
      <TouchableOpacity
        style={styles.stickerItem}
        onPress={() => handleStickerSelect(sticker)}
        onLongPress={() => handleToggleFavorite(sticker.id)}
      >
        <View style={styles.stickerContent}>
          <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
          <Text style={styles.stickerName} numberOfLines={1}>
            {sticker.name}
          </Text>
          {isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Icon name="star" size="xs" color="#FFD700" />
            </View>
          )}
          {isRecent && (
            <View style={styles.recentIndicator}>
              <Icon name="clock" size="xs" color="#007AFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderThumbnailItem = ({ item: thumbnail }: { item: StickerThumbnail }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailItem,
        thumbnail.isSelected && styles.thumbnailItemSelected,
      ]}
      onPress={() => handleThumbnailTap(thumbnail)}
      onLongPress={() => {
        if (!multiSelectMode) {
          dispatch(toggleMultiSelectMode());
        }
        dispatch(addToMultiSelect(thumbnail.id));
      }}
    >
      <Text style={styles.thumbnailEmoji}>{thumbnail.thumbnail}</Text>
      <View style={styles.thumbnailInfo}>
        <Text style={styles.thumbnailScale}>
          {Math.round(thumbnail.scale * 100)}%
        </Text>
        <Text style={styles.thumbnailRotation}>
          {Math.round(thumbnail.rotation)}°
        </Text>
      </View>
      {multiSelectMode && (
        <View style={[
          styles.selectionCheckbox,
          thumbnail.isSelected && styles.selectionCheckboxSelected,
        ]}>
          {thumbnail.isSelected && (
            <Icon name="check" size="xs" color="white" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return (
          <FlatList
            data={filteredStickers}
            renderItem={renderStickerItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.libraryContent}
            showsVerticalScrollIndicator={false}
          />
        );
      
      case 'onPage':
        return (
          <View style={styles.onPageContainer}>
            {multiSelectMode && selectedStickers.length > 0 && (
              <View style={styles.multiSelectToolbar}>
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => dispatch(clearMultiSelect())}
                >
                  <Icon name="close" size="sm" color="#666" />
                  <Text style={styles.toolbarButtonText}>Clear</Text>
                </TouchableOpacity>
                <Text style={styles.selectedCount}>
                  {selectedStickers.length} selected
                </Text>
                <TouchableOpacity
                  style={[styles.toolbarButton, styles.deleteButton]}
                  onPress={handleBulkDelete}
                >
                  <Icon name="trash" size="sm" color="#FF3B30" />
                  <Text style={[styles.toolbarButtonText, styles.deleteButtonText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <FlatList
              data={pageThumbnails}
              renderItem={renderThumbnailItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.thumbnailsContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No stickers on this page
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add stickers from the library tab
                  </Text>
                </View>
              )}
            />
          </View>
        );
      
      case 'layers':
        // TODO: Implement layer management UI
        return (
          <View style={styles.layersContainer}>
            <Text style={styles.comingSoonText}>
              Layer management coming soon!
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (!isAssetDrawerOpen) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isAssetDrawerOpen}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Drawer */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.drawer, { width: drawerWidth }, animatedDrawerStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Asset Library</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon name="close" size="sm" color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search and filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size="sm" color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search stickers..."
                placeholderTextColor="#999"
                value={filter.searchQuery}
                onChangeText={(text) => setFilter({ ...filter, searchQuery: text })}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter.showOnlyFavorites && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setFilter({ ...filter, showOnlyFavorites: !filter.showOnlyFavorites })
                }
              >
                <Icon name="star" size="xs" color={filter.showOnlyFavorites ? "#FFD700" : "#999"} />
                <Text
                  style={[
                    styles.filterButtonText,
                    filter.showOnlyFavorites && styles.filterButtonTextActive,
                  ]}
                >
                  Favorites
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'library' && styles.tabActive]}
              onPress={() => setActiveTab('library')}
            >
              <Icon name="star" size="sm" color={activeTab === 'library' ? "#007AFF" : "#999"} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'library' && styles.tabTextActive,
                ]}
              >
                Library
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'onPage' && styles.tabActive]}
              onPress={() => setActiveTab('onPage')}
            >
              <Icon name="layers" size="sm" color={activeTab === 'onPage' ? "#007AFF" : "#999"} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'onPage' && styles.tabTextActive,
                ]}
              >
                On Page ({pageThumbnails.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'layers' && styles.tabActive]}
              onPress={() => setActiveTab('layers')}
            >
              <Icon name="layers" size="sm" color={activeTab === 'layers' ? "#007AFF" : "#999"} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'layers' && styles.tabTextActive,
                ]}
              >
                Layers
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderTabContent()}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    maxHeight: 40,
  },
  filterContent: {
    paddingVertical: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  libraryContent: {
    padding: 16,
  },
  stickerItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stickerEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  stickerName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onPageContainer: {
    flex: 1,
  },
  multiSelectToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toolbarButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  thumbnailsContent: {
    padding: 16,
  },
  thumbnailItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    position: 'relative',
  },
  thumbnailItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  thumbnailEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  thumbnailInfo: {
    alignItems: 'center',
  },
  thumbnailScale: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  thumbnailRotation: {
    fontSize: 9,
    color: '#999',
  },
  selectionCheckbox: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  layersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default StickerAssetDrawer;