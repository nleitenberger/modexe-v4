import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SharedJournalEntry, LayoutConfig } from '../../../types/modspace.types';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../common/Icon';

interface MinimalLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
}

const MinimalLayout: React.FC<MinimalLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress 
}) => {
  const { currentTheme } = useTheme();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

  const getReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = getWordCount(text);
    return Math.ceil(words / wordsPerMinute);
  };

  const renderEntry = (entry: SharedJournalEntry, index: number) => (
    <TouchableOpacity
      key={entry.id}
      style={[
        styles.entryContainer,
        {
          borderBottomWidth: index < entries.length - 1 ? 1 : 0,
          borderBottomColor: currentTheme.textColor + '10', // 10% opacity
          paddingVertical: currentTheme.spacing.large,
          paddingHorizontal: currentTheme.spacing.medium,
        }
      ]}
      onPress={() => onEntryPress?.(entry)}
      onLongPress={() => onEntryLongPress?.(entry)}
      activeOpacity={0.6}
    >
      {/* Entry header */}
      <View style={styles.entryHeader}>
        {/* Date and reading time */}
        <View style={styles.entryMeta}>
          {config.showDates && (
            <Text style={[
              styles.dateText,
              {
                color: currentTheme.textColor + '80', // 50% opacity
                fontSize: currentTheme.font.size.xs,
                fontWeight: '500',
                fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
              }
            ]}>
              {formatDate(entry.shareDate)}
            </Text>
          )}
          
          <View style={styles.metaSeparator}>
            <View style={[
              styles.separator,
              { backgroundColor: currentTheme.textColor + '40' }
            ]} />
          </View>

          <Text style={[
            styles.readingTime,
            {
              color: currentTheme.textColor + '80',
              fontSize: currentTheme.font.size.xs,
              fontWeight: '500',
            }
          ]}>
            {getReadingTime(entry.excerpt)} min read
          </Text>

          {config.showDates && (
            <>
              <View style={styles.metaSeparator}>
                <View style={[
                  styles.separator,
                  { backgroundColor: currentTheme.textColor + '40' }
                ]} />
              </View>
              <Text style={[
                styles.timeText,
                {
                  color: currentTheme.textColor + '60', // 40% opacity
                  fontSize: currentTheme.font.size.xs,
                }
              ]}>
                {formatTime(entry.shareDate)}
              </Text>
            </>
          )}
        </View>

        {/* Privacy indicator */}
        {entry.visibility !== 'public' && (
          <Icon 
            name={entry.visibility === 'private' ? 'lock' : 'user'} 
            size="xs" 
            color={currentTheme.textColor + '60'}
          />
        )}
      </View>

      {/* Title */}
      <View style={[styles.titleContainer, { marginTop: currentTheme.spacing.small }]}>
        <Text style={[
          styles.title,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.large,
            fontWeight: currentTheme.font.weight === 'bold' ? '700' : '600',
            fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
            lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.large,
            letterSpacing: currentTheme.font.letterSpacing,
          }
        ]}>
          {entry.title}
        </Text>
      </View>

      {/* Excerpt */}
      {config.showCaptions && entry.excerpt && (
        <View style={[styles.excerptContainer, { marginTop: currentTheme.spacing.small }]}>
          <Text style={[
            styles.excerpt,
            {
              color: currentTheme.textColor + 'CC', // 80% opacity
              fontSize: currentTheme.font.size.medium,
              fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
              lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.medium,
              letterSpacing: currentTheme.font.letterSpacing * 0.5,
            }
          ]}
          numberOfLines={3}
          >
            {entry.excerpt}
          </Text>
        </View>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <View style={[styles.tagsContainer, { marginTop: currentTheme.spacing.medium }]}>
          {entry.tags.slice(0, 3).map((tag, tagIndex) => (
            <Text 
              key={tagIndex}
              style={[
                styles.tag,
                {
                  color: currentTheme.primaryColor,
                  fontSize: currentTheme.font.size.xs,
                  fontWeight: '500',
                }
              ]}
            >
              #{tag}
              {tagIndex < Math.min(entry.tags.length, 3) - 1 && (
                <Text style={[
                  styles.tagSeparator,
                  { color: currentTheme.textColor + '40' }
                ]}>
                  {' '} · {' '}
                </Text>
              )}
            </Text>
          ))}
          {entry.tags.length > 3 && (
            <Text style={[
              styles.moreTags,
              {
                color: currentTheme.textColor + '60',
                fontSize: currentTheme.font.size.xs,
              }
            ]}>
              {' '}+{entry.tags.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Footer with stats */}
      {config.showStats && (
        <View style={[
          styles.entryFooter,
          { 
            marginTop: currentTheme.spacing.medium,
            paddingTop: currentTheme.spacing.small,
            borderTopWidth: 1,
            borderTopColor: currentTheme.textColor + '08', // 5% opacity
          }
        ]}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Icon name="heart" size="xs" color={currentTheme.textColor + '60'} />
              <Text style={[
                styles.statText,
                {
                  color: currentTheme.textColor + '80',
                  fontSize: currentTheme.font.size.xs,
                  marginLeft: 4,
                }
              ]}>
                {entry.likes}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="discover" size="xs" color={currentTheme.textColor + '60'} />
              <Text style={[
                styles.statText,
                {
                  color: currentTheme.textColor + '80',
                  fontSize: currentTheme.font.size.xs,
                  marginLeft: 4,
                }
              ]}>
                {entry.views}
              </Text>
            </View>

            {entry.comments.length > 0 && (
              <View style={styles.statItem}>
                <Icon name="edit" size="xs" color={currentTheme.textColor + '60'} />
                <Text style={[
                  styles.statText,
                  {
                    color: currentTheme.textColor + '80',
                    fontSize: currentTheme.font.size.xs,
                    marginLeft: 4,
                  }
                ]}>
                  {entry.comments.length}
                </Text>
              </View>
            )}
          </View>

          {/* Read more indicator */}
          <View style={styles.readMoreContainer}>
            <Text style={[
              styles.readMore,
              {
                color: currentTheme.primaryColor,
                fontSize: currentTheme.font.size.xs,
                fontWeight: '600',
              }
            ]}>
              Read full entry
            </Text>
            <Icon name="arrow-right" size="xs" color={currentTheme.primaryColor} style={{ marginLeft: 4 }} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {entries.length > 0 ? (
        <View style={styles.entriesList}>
          {entries
            .sort((a, b) => new Date(b.shareDate).getTime() - new Date(a.shareDate).getTime())
            .map((entry, index) => renderEntry(entry, index))
          }
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
  entriesList: {
    // Minimal container styling
  },
  entryContainer: {
    // Individual entry styling applied dynamically
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '500',
  },
  timeText: {
    fontStyle: 'italic',
  },
  readingTime: {
    fontStyle: 'italic',
  },
  metaSeparator: {
    marginHorizontal: 8,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  titleContainer: {
    // Title container styling
  },
  title: {
    // Title styling applied dynamically
  },
  excerptContainer: {
    // Excerpt container styling
  },
  excerpt: {
    // Excerpt styling applied dynamically
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    // Tag styling applied dynamically
  },
  tagSeparator: {
    // Separator styling applied dynamically
  },
  moreTags: {
    fontStyle: 'italic',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontWeight: '500',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    // Read more styling applied dynamically
  },
  emptyState: {
    flex: 1,
    minHeight: 200,
  },
});

export default MinimalLayout;