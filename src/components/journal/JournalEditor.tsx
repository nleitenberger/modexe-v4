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
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { RootState } from '../../store';
import { createJournal, updateJournalTitle, nextSpread, prevSpread, nextPage, prevPage, addPage } from '../../store/journalSlice';
import { togglePalette } from '../../store/stickerSlice';
import { useOrientation } from '../../utils/useOrientation';
import JournalSpread from './JournalSpread';
import JournalToolbar from './JournalToolbar';
import StickerPalette from './StickerPalette';


const JournalEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal, currentSpreadIndex, currentPageIndex, isLoading } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);
  const { isPortrait, height: screenHeight } = useOrientation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Drawer height management - responsive to orientation
  const defaultHeight = useMemo(() => screenHeight * 0.6, [screenHeight]);
  const drawerHeight = useSharedValue(defaultHeight);
  const [currentHeight, setCurrentHeight] = useState(defaultHeight);

  // Update drawer height when orientation changes
  useEffect(() => {
    const newDefaultHeight = screenHeight * 0.6;
    const newMinHeight = screenHeight * 0.3;
    const newMaxHeight = screenHeight * 0.8;
    
    // Clamp current height to new bounds
    const clampedHeight = Math.max(newMinHeight, Math.min(newMaxHeight, currentHeight));
    drawerHeight.value = withSpring(clampedHeight, { damping: 20, stiffness: 100 });
    setCurrentHeight(clampedHeight);
  }, [screenHeight]);

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

  // Navigation handlers
  const totalPages = currentJournal ? currentJournal.pages.length : 0;
  const totalSpreads = Math.ceil(totalPages / 2);
  
  const canGoPrev = isPortrait ? currentPageIndex > 0 : currentSpreadIndex > 0;
  const canGoNext = isPortrait ? currentPageIndex < totalPages - 1 : currentSpreadIndex < totalSpreads - 1;

  const getCurrentPageDisplay = () => {
    if (isPortrait) {
      const currentPageNumber = currentPageIndex + 1;
      return `Page ${currentPageNumber} of ${totalPages}`;
    } else {
      const leftPageNumber = currentSpreadIndex * 2 + 1;
      const rightPageNumber = Math.min(leftPageNumber + 1, totalPages);
      if (leftPageNumber === rightPageNumber) {
        return `Page ${leftPageNumber}`;
      }
      return `Pages ${leftPageNumber}-${rightPageNumber}`;
    }
  };

  const handlePrevSpread = () => {
    if (canGoPrev) {
      if (isPortrait) {
        dispatch(prevPage());
      } else {
        dispatch(prevSpread());
      }
    }
  };

  const handleNextSpread = () => {
    if (canGoNext) {
      if (isPortrait) {
        dispatch(nextPage());
      } else {
        dispatch(nextSpread());
      }
    }
  };

  const handleAddPage = () => {
    if (isPortrait) {
      dispatch(addPage());
    } else {
      dispatch(addPage());
      dispatch(addPage());
    }
  };

  // Drawer resize gesture handler
  const updateHeight = (height: number) => {
    setCurrentHeight(height);
  };

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startHeight: number }) => {
      context.startHeight = drawerHeight.value;
    },
    onActive: (event, context: { startHeight: number }) => {
      const newHeight = context.startHeight - event.translationY;
      const currentMinHeight = screenHeight * 0.3;
      const currentMaxHeight = screenHeight * 0.8;
      const clampedHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, newHeight));
      drawerHeight.value = clampedHeight;
      runOnJS(updateHeight)(clampedHeight);
    },
    onEnd: (event) => {
      const velocity = -event.velocityY;
      const newHeight = drawerHeight.value;
      const currentMinHeight = screenHeight * 0.3;
      const currentMaxHeight = screenHeight * 0.8;
      
      // Snap to nearest logical height
      let targetHeight;
      if (newHeight < currentMinHeight + 50) {
        targetHeight = currentMinHeight;
      } else if (newHeight > currentMaxHeight - 50) {
        targetHeight = currentMaxHeight;
      } else {
        targetHeight = newHeight;
      }
      
      drawerHeight.value = withSpring(targetHeight, {
        velocity: velocity / 1000,
        stiffness: 100,
        damping: 15,
      });
      runOnJS(updateHeight)(targetHeight);
    },
  });

  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      height: drawerHeight.value,
    };
  });

  // Memoize the initialization to prevent infinite loops
  const shouldInitialize = useMemo(() => {
    return !currentJournal && !isLoading;
  }, [currentJournal, isLoading]);

  useEffect(() => {
    if (shouldInitialize) {
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
            
            {/* Navigation Controls */}
            <View style={styles.navigationHeader}>
              <TouchableOpacity
                style={[styles.navButton, !canGoPrev && styles.disabledButton]}
                onPress={handlePrevSpread}
                disabled={!canGoPrev}
              >
                <Text style={[styles.navButtonText, !canGoPrev && styles.disabledText]}>
                  ← Prev
                </Text>
              </TouchableOpacity>

              <View style={styles.centerSection}>
                <Text style={styles.spreadIndicator}>
                  {getCurrentPageDisplay()}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.navButton, !canGoNext && styles.disabledButton]}
                onPress={handleNextSpread}
                disabled={!canGoNext}
              >
                <Text style={[styles.navButtonText, !canGoNext && styles.disabledText]}>
                  Next →
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addPageButton}
                onPress={handleAddPage}
              >
                <Text style={styles.addPageButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main journal spread area */}
          <View style={styles.journalContainer}>
            <JournalSpread journal={currentJournal} />
          </View>

          {/* Toolbar at the bottom */}
          <JournalToolbar />

          {/* Sticker palette bottom drawer */}
          {isPaletteExpanded && (
            <View style={styles.drawerOverlay}>
              <TouchableOpacity 
                style={styles.drawerBackdrop} 
                onPress={() => dispatch(togglePalette())}
                activeOpacity={1}
              />
              <Animated.View style={[styles.drawerContainer, animatedDrawerStyle]}>
                <PanGestureHandler onGestureEvent={panGestureHandler}>
                  <Animated.View style={styles.drawerHandleArea}>
                    <View style={styles.drawerHandle} />
                  </Animated.View>
                </PanGestureHandler>
                <StickerPalette />
              </Animated.View>
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
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHandleArea: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#bbb',
    borderRadius: 2,
  },
  titleContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleTouchable: {
    paddingVertical: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    minWidth: 55,
  },
  disabledButton: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    textAlign: 'center',
  },
  disabledText: {
    color: '#999',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  spreadIndicator: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  addPageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addPageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

export default JournalEditor;