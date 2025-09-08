import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Journal, JournalPage } from '../../types/journal.types';
import { useOrientation } from '../../utils/useOrientation';
import JournalPageComponent from './JournalPage';

interface JournalSpreadProps {
  journal: Journal;
}

const JournalSpread: React.FC<JournalSpreadProps> = ({ journal }) => {
  const { currentSpreadIndex, currentPageIndex } = useSelector((state: RootState) => state.journal);
  const { width: screenWidth, isPortrait, isLandscape } = useOrientation();

  // Responsive layout constants
  const MOBILE_PADDING = 16;
  const DESKTOP_PADDING = 32;
  const PAGE_GAP = 12;
  const MAX_JOURNAL_WIDTH = 800; // Maximum width for journal
  
  const padding = isPortrait ? MOBILE_PADDING : DESKTOP_PADDING;
  const availableWidth = Math.min(screenWidth - (padding * 2), MAX_JOURNAL_WIDTH);

  const getSpreadPages = (): { left: JournalPage | null; right: JournalPage | null; current: JournalPage | null } => {
    if (isPortrait) {
      // Portrait mode: show single page based on currentPageIndex
      return {
        left: null,
        right: null,
        current: journal.pages[currentPageIndex] || null,
      };
    } else {
      // Landscape mode: show spread based on currentSpreadIndex
      const leftPageIndex = currentSpreadIndex * 2;
      const rightPageIndex = leftPageIndex + 1;
      
      return {
        left: journal.pages[leftPageIndex] || null,
        right: journal.pages[rightPageIndex] || null,
        current: null,
      };
    }
  };

  const { left: leftPage, right: rightPage, current: currentPage } = getSpreadPages();
  
  // Calculate page dimensions based on orientation
  const pageWidth = isPortrait 
    ? availableWidth - 24 // Single page with some margin
    : (availableWidth - PAGE_GAP) / 2; // Two pages side by side

  if (isPortrait) {
    // Single page layout for portrait mode
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.spreadContainer, { paddingHorizontal: padding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.singlePageSpread, { width: availableWidth }]}>
          {currentPage && (
            <JournalPageComponent
              page={currentPage}
              width={pageWidth}
              isLeftPage={currentPageIndex % 2 === 0}
            />
          )}
        </View>
      </ScrollView>
    );
  }

  // Dual page layout for landscape mode
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[styles.spreadContainer, { paddingHorizontal: padding }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.spread, { width: availableWidth }]}>
        {/* Book binding shadow effect - only in landscape */}
        <View style={styles.binding} />
        
        {/* Left page */}
        <View style={[styles.pageContainer, { width: pageWidth }]}>
          {leftPage && (
            <JournalPageComponent
              page={leftPage}
              width={pageWidth}
              isLeftPage={true}
            />
          )}
        </View>

        {/* Right page */}
        <View style={[styles.pageContainer, { width: pageWidth }]}>
          {rightPage && (
            <JournalPageComponent
              page={rightPage}
              width={pageWidth}
              isLeftPage={false}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  spreadContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  // Single page layout for portrait
  singlePageSpread: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 500,
    maxWidth: 400,
  },
  // Dual page layout for landscape
  spread: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 500,
  },
  binding: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    transform: [{ translateX: -1 }],
    zIndex: 10,
    borderRadius: 1,
  },
  pageContainer: {
    flex: 1,
    minHeight: 500,
    backgroundColor: 'white',
  },
});

export default JournalSpread;