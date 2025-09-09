import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Journal, JournalPage, PageSize } from '../../types/journal.types';
import { useOrientation } from '../../utils/useOrientation';
import { calculatePageDimensions, getPageConfig } from '../../utils/pageSize';
import JournalPageComponent from './JournalPage';

interface JournalSpreadProps {
  journal: Journal;
}

const JournalSpread: React.FC<JournalSpreadProps> = ({ journal }) => {
  const { currentSpreadIndex, currentPageIndex } = useSelector((state: RootState) => state.journal);
  const { width: screenWidth, height: screenHeight, isPortrait, isLandscape } = useOrientation();

  // Get page size configuration
  const pageSize = journal.pageSize || PageSize.JOURNAL; // Default to journal if not set
  const pageConfig = getPageConfig(pageSize);
  
  // Calculate responsive dimensions based on page size preference
  const pageDimensions = calculatePageDimensions(
    pageSize, 
    screenWidth, 
    screenHeight, 
    isPortrait
  );
  
  const PAGE_GAP = 12;

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

  if (isPortrait) {
    // Single page layout for portrait mode
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.spreadContainer, { paddingHorizontal: pageDimensions.padding.horizontal }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.singlePageSpread, 
          { 
            width: pageDimensions.width,
            height: pageDimensions.height,
            aspectRatio: pageConfig.aspectRatio,
          }
        ]}>
          {currentPage && (
            <JournalPageComponent
              page={currentPage}
              width={pageDimensions.width}
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
      contentContainerStyle={[styles.spreadContainer, { paddingHorizontal: pageDimensions.padding.horizontal }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[
        styles.spread, 
        { 
          width: (pageDimensions.width * 2) + PAGE_GAP,
          height: pageDimensions.height,
        }
      ]}>
        {/* Book binding shadow effect - only in landscape */}
        <View style={styles.binding} />
        
        {/* Left page */}
        <View style={[
          styles.pageContainer, 
          { 
            width: pageDimensions.width,
            height: pageDimensions.height,
            aspectRatio: pageConfig.aspectRatio,
          }
        ]}>
          {leftPage && (
            <JournalPageComponent
              page={leftPage}
              width={pageDimensions.width}
              isLeftPage={true}
            />
          )}
        </View>

        {/* Right page */}
        <View style={[
          styles.pageContainer, 
          { 
            width: pageDimensions.width,
            height: pageDimensions.height,
            aspectRatio: pageConfig.aspectRatio,
          }
        ]}>
          {rightPage && (
            <JournalPageComponent
              page={rightPage}
              width={pageDimensions.width}
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
    backgroundColor: 'white',
  },
});

export default JournalSpread;