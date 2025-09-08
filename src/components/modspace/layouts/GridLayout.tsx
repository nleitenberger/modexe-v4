import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SharedJournalEntry, LayoutConfig } from '../../../types/modspace.types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrientation } from '../../../utils/useOrientation';
import JournalEntryCard from '../cards/JournalEntryCard';

interface GridLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const GridLayout: React.FC<GridLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress 
}) => {
  const { currentTheme } = useTheme();
  const { isPortrait } = useOrientation();

  // Adjust columns based on orientation and screen size
  const getColumns = () => {
    if (isPortrait) {
      return Math.min(config.columns || 2, 2); // Max 2 columns in portrait
    } else {
      return config.columns || 3; // Use config or default to 3 in landscape
    }
  };

  const columns = getColumns();
  const spacing = config.spacing || 8;
  const availableWidth = screenWidth - (spacing * (columns + 1));
  const itemWidth = availableWidth / columns;

  // Organize entries into columns for masonry effect
  const organizeEntriesIntoColumns = () => {
    const columnArrays: SharedJournalEntry[][] = Array(columns).fill(null).map(() => []);
    
    if (config.masonry) {
      // Simple masonry: alternate between columns
      entries.forEach((entry, index) => {
        const columnIndex = index % columns;
        columnArrays[columnIndex].push(entry);
      });
    } else {
      // Regular grid: fill columns evenly
      const entriesPerColumn = Math.ceil(entries.length / columns);
      entries.forEach((entry, index) => {
        const columnIndex = Math.floor(index / entriesPerColumn);
        if (columnIndex < columns) {
          columnArrays[columnIndex].push(entry);
        }
      });
    }
    
    return columnArrays;
  };

  const columnArrays = organizeEntriesIntoColumns();

  const renderColumn = (columnEntries: SharedJournalEntry[], columnIndex: number) => (
    <View key={columnIndex} style={[styles.column, { width: itemWidth }]}>
      {columnEntries.map((entry, entryIndex) => (
        <View
          key={entry.id}
          style={[
            styles.entryContainer,
            { 
              marginBottom: spacing,
              // Last item in column has no bottom margin
              ...(entryIndex === columnEntries.length - 1 && { marginBottom: 0 })
            }
          ]}
        >
          <JournalEntryCard
            entry={entry}
            config={config}
            theme={currentTheme}
            width={itemWidth}
            aspectRatio={config.aspectRatio}
            onPress={() => onEntryPress?.(entry)}
            onLongPress={() => onEntryLongPress?.(entry)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: spacing,
          paddingTop: spacing,
          backgroundColor: currentTheme.backgroundColor,
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {entries.length > 0 ? (
        <View style={[styles.grid, { gap: spacing }]}>
          {columnArrays.map((columnEntries, columnIndex) => 
            renderColumn(columnEntries, columnIndex)
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          {/* Empty state will be handled by parent component */}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  entryContainer: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    minHeight: 200,
  },
});

export default GridLayout;