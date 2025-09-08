import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import { SharedJournalEntry, LayoutConfig } from '../../../types/modspace.types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrientation } from '../../../utils/useOrientation';
import JournalEntryCard from '../cards/JournalEntryCard';

interface MagazineLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
}

interface EntryWithHeight {
  entry: SharedJournalEntry;
  height: number;
  featured?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const MagazineLayout: React.FC<MagazineLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress 
}) => {
  const { currentTheme } = useTheme();
  const { isPortrait } = useOrientation();

  // Adjust columns based on orientation
  const getColumns = () => {
    if (isPortrait) {
      return Math.min(config.columns || 2, 2);
    } else {
      return config.columns || 3;
    }
  };

  const columns = getColumns();
  const spacing = config.spacing || 12;
  const availableWidth = screenWidth - (spacing * (columns + 1));
  const itemWidth = availableWidth / columns;

  // Calculate estimated heights for entries and determine featured entries
  const calculateEntryHeights = (): EntryWithHeight[] => {
    return entries.map((entry, index) => {
      // Base height calculation
      let baseHeight = itemWidth * 0.8; // Start with reasonable aspect ratio
      
      // Add height for text content
      const titleLines = Math.ceil(entry.title.length / 30);
      const excerptLines = config.showCaptions ? Math.ceil(entry.excerpt.length / 50) : 0;
      const textHeight = (titleLines * 20) + (excerptLines * 16) + 40; // padding and margins
      
      // Add height for stats, dates, tags if shown
      let metadataHeight = 0;
      if (config.showStats) metadataHeight += 24;
      if (config.showDates) metadataHeight += 20;
      if (entry.tags.length > 0) metadataHeight += 32;
      
      const totalHeight = baseHeight + textHeight + metadataHeight;
      
      // Determine featured entries (first entry and every 6th entry)
      const isFeatured = index === 0 || (index % 6 === 0 && index > 0);
      
      return {
        entry,
        height: isFeatured ? Math.max(totalHeight, itemWidth * 1.2) : totalHeight,
        featured: isFeatured,
      };
    });
  };

  const entriesWithHeight = calculateEntryHeights();

  // Organize entries into columns using masonry algorithm
  const organizeEntriesIntoColumns = (): EntryWithHeight[][] => {
    const columnArrays: EntryWithHeight[][] = Array(columns).fill(null).map(() => []);
    const columnHeights = Array(columns).fill(0);

    entriesWithHeight.forEach((entryWithHeight) => {
      // Find the column with the smallest height
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add entry to that column
      columnArrays[shortestColumnIndex].push(entryWithHeight);
      columnHeights[shortestColumnIndex] += entryWithHeight.height + spacing;
    });

    return columnArrays;
  };

  const columnArrays = organizeEntriesIntoColumns();

  const renderColumn = (columnEntries: EntryWithHeight[], columnIndex: number) => (
    <View key={columnIndex} style={[styles.column, { width: itemWidth }]}>
      {columnEntries.map((entryWithHeight, entryIndex) => {
        const { entry, featured } = entryWithHeight;
        
        return (
          <View
            key={entry.id}
            style={[
              styles.entryContainer,
              { 
                marginBottom: spacing,
                ...(entryIndex === columnEntries.length - 1 && { marginBottom: 0 })
              }
            ]}
          >
            {/* Featured entry overlay */}
            {featured && (
              <View style={[
                styles.featuredBadge,
                {
                  backgroundColor: currentTheme.accentColor,
                  borderRadius: currentTheme.spacing.small,
                }
              ]}>
                <Text style={[
                  styles.featuredText,
                  {
                    color: currentTheme.backgroundColor,
                    fontSize: currentTheme.font.size.xs,
                    fontWeight: '700',
                  }
                ]}>
                  Featured
                </Text>
              </View>
            )}

            <JournalEntryCard
              entry={entry}
              config={{
                ...config,
                // Enhanced config for featured entries
                showCaptions: featured ? true : config.showCaptions,
                showStats: featured ? true : config.showStats,
              }}
              theme={currentTheme}
              width={itemWidth}
              aspectRatio="dynamic"
              onPress={() => onEntryPress?.(entry)}
              onLongPress={() => onEntryLongPress?.(entry)}
            />

            {/* Magazine-style overlay for featured entries */}
            {featured && entry.thumbnail && (
              <View style={[
                styles.magazineOverlay,
                {
                  borderRadius: currentTheme.effects.borderRadius,
                  backgroundColor: currentTheme.textColor + '80', // 50% opacity
                }
              ]}>
                <Text style={[
                  styles.overlayTitle,
                  {
                    color: currentTheme.backgroundColor,
                    fontSize: currentTheme.font.size.large,
                    fontWeight: '700',
                    fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
                    textAlign: 'center',
                    lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.large,
                  }
                ]}>
                  {entry.title}
                </Text>
                
                {config.showCaptions && entry.excerpt && (
                  <Text style={[
                    styles.overlayExcerpt,
                    {
                      color: currentTheme.backgroundColor + 'DD', // 85% opacity
                      fontSize: currentTheme.font.size.small,
                      textAlign: 'center',
                      marginTop: currentTheme.spacing.small,
                      lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.small,
                    }
                  ]}>
                    {entry.excerpt.length > 100 ? 
                      `${entry.excerpt.substring(0, 100)}...` : 
                      entry.excerpt
                    }
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const featuredCount = entriesWithHeight.filter(e => e.featured).length;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: spacing,
          paddingTop: spacing,
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {entries.length > 0 ? (
        <>
          {/* Magazine header */}
          <View style={[
            styles.magazineHeader,
            {
              marginBottom: spacing * 1.5,
              backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
              borderRadius: currentTheme.effects.borderRadius,
              padding: currentTheme.spacing.medium,
            }
          ]}>
            <Text style={[
              styles.magazineTitle,
              {
                color: currentTheme.textColor,
                fontSize: currentTheme.font.size.xlarge,
                fontWeight: '700',
                fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
                textAlign: 'center',
                marginBottom: currentTheme.spacing.small / 2,
              }
            ]}>
              Journal Collection
            </Text>
            <Text style={[
              styles.magazineSubtitle,
              {
                color: currentTheme.textColor + '99', // 60% opacity
                fontSize: currentTheme.font.size.small,
                textAlign: 'center',
              }
            ]}>
              {entries.length} stories • {featuredCount} featured
            </Text>
          </View>

          {/* Masonry grid */}
          <View style={[styles.grid, { gap: spacing }]}>
            {columnArrays.map((columnEntries, columnIndex) => 
              renderColumn(columnEntries, columnIndex)
            )}
          </View>
        </>
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
  magazineHeader: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  magazineTitle: {
    textAlign: 'center',
  },
  magazineSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  entryContainer: {
    position: 'relative',
    width: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
  },
  magazineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 5,
  },
  overlayTitle: {
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayExcerpt: {
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyState: {
    flex: 1,
    minHeight: 200,
  },
});

export default MagazineLayout;