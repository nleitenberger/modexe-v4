import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Journal, JournalPage } from '../../types/journal.types';
import JournalPageComponent from './JournalPage';

interface JournalSpreadProps {
  journal: Journal;
}

const { width: screenWidth } = Dimensions.get('window');
const SPREAD_PADDING = 32;
const PAGE_GAP = 16;

const JournalSpread: React.FC<JournalSpreadProps> = ({ journal }) => {
  const currentSpreadIndex = useSelector((state: RootState) => state.journal.currentSpreadIndex);

  const getSpreadPages = (spreadIndex: number): { left: JournalPage | null; right: JournalPage | null } => {
    const leftPageIndex = spreadIndex * 2;
    const rightPageIndex = leftPageIndex + 1;

    return {
      left: journal.pages[leftPageIndex] || null,
      right: journal.pages[rightPageIndex] || null,
    };
  };

  const { left: leftPage, right: rightPage } = getSpreadPages(currentSpreadIndex);
  const pageWidth = (screenWidth - SPREAD_PADDING - PAGE_GAP) / 2;

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.spreadContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.spread}>
        {/* Book binding shadow effect */}
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
    paddingHorizontal: SPREAD_PADDING / 2,
    paddingVertical: 20,
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 600,
  },
  binding: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ translateX: -1 }],
    zIndex: 10,
  },
  pageContainer: {
    flex: 1,
    minHeight: 600,
    backgroundColor: 'white',
  },
});

export default JournalSpread;