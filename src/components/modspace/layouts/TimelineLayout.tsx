import React from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
import { SharedJournalEntry, LayoutConfig } from '../../../types/modspace.types';
import { useTheme } from '../../../contexts/ThemeContext';
import JournalEntryCard from '../cards/JournalEntryCard';
import Icon from '../../common/Icon';

interface TimelineLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
  onEntryEdit?: (entry: SharedJournalEntry) => void;
  onEntryDelete?: (entry: SharedJournalEntry) => void;
  onEntryFullscreen?: (entry: SharedJournalEntry) => void;
}

interface GroupedEntries {
  [key: string]: SharedJournalEntry[];
}

const { width: screenWidth } = Dimensions.get('window');

const TimelineLayout: React.FC<TimelineLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress,
  onEntryEdit,
  onEntryDelete,
  onEntryFullscreen
}) => {
  const { currentTheme } = useTheme();

  // Calculate width for timeline entry cards
  const getCardWidth = () => {
    const timelinePadding = (currentTheme.spacing?.medium || 16) * 2; // Left and right padding
    const entriesContainerPadding = 34; // Reduced left padding for timeline elements
    return screenWidth - timelinePadding - entriesContainerPadding;
  };

  // Group entries by date
  const groupEntriesByDate = (entries: SharedJournalEntry[]): GroupedEntries => {
    const grouped: GroupedEntries = {};
    
    entries
      .filter(entry => entry.shareDate) // Filter out entries without valid dates
      .sort((a, b) => {
        const dateA = new Date(a.shareDate);
        const dateB = new Date(b.shareDate);
        
        // Handle invalid dates by treating them as very old
        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
        
        return timeB - timeA;
      })
      .forEach(entry => {
        try {
          const date = new Date(entry.shareDate);
          const dateKey = isNaN(date.getTime()) ? 'Invalid Date' : date.toDateString();
          
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(entry);
        } catch (error) {
          console.warn('Error processing date for entry:', entry.id, error);
          // Group invalid dates together
          if (!grouped['Invalid Date']) {
            grouped['Invalid Date'] = [];
          }
          grouped['Invalid Date'].push(entry);
        }
      });
    
    return grouped;
  };

  const groupedEntries = groupEntriesByDate(entries);
  const dateGroups = Object.keys(groupedEntries);

  const formatDateHeader = (dateString: string) => {
    try {
      // Handle invalid date strings
      if (dateString === 'Invalid Date') {
        return 'Unknown Date';
      }
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown Date';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Today';
      } else if (diffDays === 2) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch (error) {
      console.warn('Error formatting date header:', dateString, error);
      return 'Unknown Date';
    }
  };

  const getTimelineColor = (index: number) => {
    const colors = [
      currentTheme.primaryColor,
      currentTheme.secondaryColor,
      currentTheme.accentColor,
    ];
    return colors[index % colors.length];
  };

  const renderDateGroup = (dateString: string, groupIndex: number) => {
    const entriesForDate = groupedEntries[dateString];
    const timelineColor = getTimelineColor(groupIndex);
    
    return (
      <View key={dateString} style={styles.dateGroup}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <View style={[
            styles.timelineDot,
            { 
              backgroundColor: timelineColor,
              borderColor: currentTheme.backgroundColor,
            }
          ]}>
            <Icon name="calendar" size="xs" color={currentTheme.backgroundColor} />
          </View>
          <View style={[
            styles.dateHeaderContent,
            {
              backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
              borderRadius: currentTheme.effects.borderRadius,
            }
          ]}>
            <Text style={[
              styles.dateHeaderText,
              {
                color: currentTheme.textColor,
                fontSize: currentTheme.font.size.medium,
                fontWeight: currentTheme.font.weight === 'bold' ? '700' : '600',
                fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
              }
            ]}>
              {formatDateHeader(dateString)}
            </Text>
            <Text style={[
              styles.entryCountText,
              {
                color: currentTheme.textColor + '99', // 60% opacity
                fontSize: currentTheme.font.size.xs,
              }
            ]}>
              {entriesForDate.length} {entriesForDate.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        </View>

        {/* Timeline Line */}
        {groupIndex < dateGroups.length - 1 && (
          <View style={[
            styles.timelineLine,
            { backgroundColor: timelineColor + '40' } // 25% opacity
          ]} />
        )}

        {/* Entries for this date */}
        <View style={styles.entriesContainer}>
          {entriesForDate.map((entry, entryIndex) => (
            <View key={entry.id} style={styles.entryWrapper}>
              {/* Entry connector */}
              <View style={[
                styles.entryConnector,
                { backgroundColor: timelineColor + '40' }
              ]} />
              
              {/* Entry dot */}
              <View style={[
                styles.entryDot,
                { backgroundColor: timelineColor }
              ]} />

              {/* Entry card */}
              <View style={styles.entryCardContainer}>
                <JournalEntryCard
                  entry={entry}
                  config={config}
                  theme={currentTheme}
                  width={getCardWidth()}
                  aspectRatio="dynamic"
                  onPress={() => onEntryPress?.(entry)}
                  onLongPress={() => onEntryLongPress?.(entry)}
                  onEdit={() => onEntryEdit?.(entry)}
                  onDelete={() => onEntryDelete?.(entry)}
                  onFullscreen={() => onEntryFullscreen?.(entry)}
                  showActions={true}
                />
                
                {/* Entry timestamp */}
                <Text style={[
                  styles.entryTime,
                  {
                    color: currentTheme.textColor + '80', // 50% opacity
                    fontSize: currentTheme.font?.size?.xs || 12,
                    marginTop: (currentTheme.spacing?.small || 8) / 2,
                  }
                ]}>
                  {(() => {
                    try {
                      const date = new Date(entry.shareDate);
                      if (isNaN(date.getTime())) {
                        return 'Unknown time';
                      }
                      return date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      });
                    } catch (error) {
                      console.warn('Error formatting entry time:', error);
                      return 'Unknown time';
                    }
                  })()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: currentTheme.spacing.medium }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {entries.length > 0 ? (
        <View style={styles.timeline}>
          {dateGroups.map((dateString, index) => renderDateGroup(dateString, index))}
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
    paddingBottom: 16,
    paddingTop: 12,
  },
  timeline: {
    position: 'relative',
  },
  dateGroup: {
    position: 'relative',
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    zIndex: 2,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    zIndex: 3,
  },
  dateHeaderContent: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dateHeaderText: {
    fontWeight: '600',
    marginBottom: 2,
  },
  entryCountText: {
    fontSize: 12,
    opacity: 0.7,
  },
  timelineLine: {
    position: 'absolute',
    left: 11.5, // Center of the smaller dot
    top: 24,
    width: 1,
    bottom: -16,
    zIndex: 1,
  },
  entriesContainer: {
    paddingLeft: 34, // Reduced space for timeline elements
  },
  entryWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  entryConnector: {
    position: 'absolute',
    left: -22.5, // Align with timeline
    top: 16,
    width: 16,
    height: 1,
    zIndex: 2,
  },
  entryDot: {
    position: 'absolute',
    left: -27, // Align with timeline
    top: 13,
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 3,
  },
  entryCardContainer: {
    flex: 1,
  },
  entryTime: {
    textAlign: 'right',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    minHeight: 200,
  },
});

export default TimelineLayout;