import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SharedJournalEntry, LayoutConfig } from '../../../types/modspace.types';
import { useTheme } from '../../../contexts/ThemeContext';
import JournalEntryCard from '../cards/JournalEntryCard';
import Icon from '../../common/Icon';

interface TimelineLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
}

interface GroupedEntries {
  [key: string]: SharedJournalEntry[];
}

const TimelineLayout: React.FC<TimelineLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress 
}) => {
  const { currentTheme } = useTheme();

  // Group entries by date
  const groupEntriesByDate = (entries: SharedJournalEntry[]): GroupedEntries => {
    const grouped: GroupedEntries = {};
    
    entries
      .sort((a, b) => new Date(b.shareDate).getTime() - new Date(a.shareDate).getTime())
      .forEach(entry => {
        const dateKey = new Date(entry.shareDate).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(entry);
      });
    
    return grouped;
  };

  const groupedEntries = groupEntriesByDate(entries);
  const dateGroups = Object.keys(groupedEntries);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
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
                  aspectRatio="dynamic"
                  onPress={() => onEntryPress?.(entry)}
                  onLongPress={() => onEntryLongPress?.(entry)}
                />
                
                {/* Entry timestamp */}
                <Text style={[
                  styles.entryTime,
                  {
                    color: currentTheme.textColor + '80', // 50% opacity
                    fontSize: currentTheme.font.size.xs,
                    marginTop: currentTheme.spacing.small / 2,
                  }
                ]}>
                  {new Date(entry.shareDate).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
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
    paddingBottom: 20,
    paddingTop: 16,
  },
  timeline: {
    position: 'relative',
  },
  dateGroup: {
    position: 'relative',
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    zIndex: 2,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 3,
  },
  dateHeaderContent: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    left: 15.5, // Center of the dot
    top: 32,
    width: 1,
    bottom: -24,
    zIndex: 1,
  },
  entriesContainer: {
    paddingLeft: 44, // Space for timeline elements
  },
  entryWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  entryConnector: {
    position: 'absolute',
    left: -28.5, // Align with timeline
    top: 20,
    width: 20,
    height: 1,
    zIndex: 2,
  },
  entryDot: {
    position: 'absolute',
    left: -33, // Align with timeline
    top: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
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