import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { nextSpread, prevSpread, addPage } from '../../store/journalSlice';
import { togglePalette } from '../../store/stickerSlice';

const JournalToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal, currentSpreadIndex } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);

  const totalSpreads = currentJournal ? Math.ceil(currentJournal.pages.length / 2) : 0;
  const canGoPrev = currentSpreadIndex > 0;
  const canGoNext = currentSpreadIndex < totalSpreads - 1;

  const handlePrevSpread = () => {
    if (canGoPrev) {
      dispatch(prevSpread());
    }
  };

  const handleNextSpread = () => {
    if (canGoNext) {
      dispatch(nextSpread());
    } else {
      // Add new pages if at the end
      dispatch(addPage());
      dispatch(addPage());
      dispatch(nextSpread());
    }
  };

  const handleToggleStickers = () => {
    dispatch(togglePalette());
  };

  return (
    <SafeAreaView style={styles.toolbarContainer}>
      <View style={styles.toolbar}>
        {/* Navigation controls */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrev && styles.disabledButton]}
            onPress={handlePrevSpread}
            disabled={!canGoPrev}
          >
            <Text style={[styles.navButtonText, !canGoPrev && styles.disabledText]}>
              ← Prev
            </Text>
          </TouchableOpacity>

          <Text style={styles.spreadIndicator}>
            {currentSpreadIndex + 1} of {Math.max(1, totalSpreads)}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextSpread}
          >
            <Text style={styles.navButtonText}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tool controls */}
        <View style={styles.toolSection}>
          <TouchableOpacity
            style={[styles.toolButton, isPaletteExpanded && styles.activeButton]}
            onPress={handleToggleStickers}
          >
            <Text style={styles.toolButtonText}>🎨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  disabledButton: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  disabledText: {
    color: '#999',
  },
  spreadIndicator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  toolSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  toolButtonText: {
    fontSize: 24,
  },
});

export default JournalToolbar;