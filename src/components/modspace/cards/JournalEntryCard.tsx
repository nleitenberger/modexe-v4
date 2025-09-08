import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SharedJournalEntry, LayoutConfig, ThemeConfig } from '../../../types/modspace.types';
import Icon from '../../common/Icon';

interface JournalEntryCardProps {
  entry: SharedJournalEntry;
  config: LayoutConfig;
  theme: ThemeConfig;
  width?: number;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'dynamic';
  onPress?: () => void;
  onLongPress?: () => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  config,
  theme,
  width,
  aspectRatio = 'dynamic',
  onPress,
  onLongPress,
}) => {

  const getCardHeight = () => {
    if (!width) return undefined;
    
    switch (aspectRatio) {
      case 'square':
        return width;
      case 'portrait':
        return width * 1.4;
      case 'landscape':
        return width * 0.7;
      case 'dynamic':
      default:
        // Dynamic height based on content
        const baseHeight = width * 0.8;
        const textLines = Math.ceil(entry.excerpt.length / 50); // Rough estimate
        return baseHeight + (textLines * 20);
    }
  };

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: theme.surfaceColor || theme.backgroundColor,
      borderRadius: theme.effects.borderRadius,
      width: width || undefined,
      height: getCardHeight(),
    };

    switch (config.cardStyle) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: theme.shadows.color,
          shadowOffset: {
            width: theme.shadows.offset.x,
            height: theme.shadows.offset.y,
          },
          shadowOpacity: theme.shadows.enabled ? theme.shadows.opacity : 0,
          shadowRadius: theme.shadows.blur,
          elevation: theme.effects.cardElevation,
        };
        
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.primaryColor + '30', // 30% opacity
          shadowOpacity: 0,
          elevation: 0,
        };
        
      case 'minimal':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
        
      case 'flat':
      default:
        return {
          ...baseStyle,
          shadowOpacity: 0,
          elevation: 0,
        };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <TouchableOpacity
      style={[styles.card, getCardStyle()]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail/Image */}
      {entry.thumbnail && (
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: entry.thumbnail }} 
            style={[
              styles.thumbnail,
              { borderTopLeftRadius: theme.effects.borderRadius, borderTopRightRadius: theme.effects.borderRadius }
            ]}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Content */}
      <View style={[
        styles.content,
        { padding: theme.spacing.medium }
      ]}>
        {/* Title */}
        <Text 
          style={[
            styles.title,
            {
              color: theme.textColor,
              fontSize: theme.font.size.medium,
              fontWeight: theme.font.weight === 'bold' ? '700' : '600',
              fontFamily: theme.font.family === 'serif' ? 'serif' : 'system',
              lineHeight: theme.font.lineHeight * theme.font.size.medium,
              letterSpacing: theme.font.letterSpacing,
            }
          ]}
          numberOfLines={2}
        >
          {entry.title}
        </Text>

        {/* Excerpt */}
        {config.showCaptions && entry.excerpt && (
          <Text 
            style={[
              styles.excerpt,
              {
                color: theme.textColor + 'CC', // 80% opacity
                fontSize: theme.font.size.small,
                fontFamily: theme.font.family === 'serif' ? 'serif' : 'system',
                lineHeight: theme.font.lineHeight * theme.font.size.small,
                marginTop: theme.spacing.small / 2,
              }
            ]}
            numberOfLines={aspectRatio === 'square' ? 2 : 3}
          >
            {entry.excerpt}
          </Text>
        )}

        {/* Date */}
        {config.showDates && (
          <Text 
            style={[
              styles.date,
              {
                color: theme.textColor + '80', // 50% opacity
                fontSize: theme.font.size.xs,
                marginTop: theme.spacing.small,
              }
            ]}
          >
            {formatDate(entry.shareDate)}
          </Text>
        )}

        {/* Stats */}
        {config.showStats && (
          <View style={[styles.stats, { marginTop: theme.spacing.small }]}>
            <View style={styles.statItem}>
              <Icon name="heart" size="xs" color={theme.accentColor} style={{ marginRight: 4 }} />
              <Text style={[
                styles.statText,
                { 
                  color: theme.textColor + '99', // 60% opacity
                  fontSize: theme.font.size.xs,
                }
              ]}>
                {entry.likes}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="discover" size="xs" color={theme.textColor + '99'} style={{ marginRight: 4 }} />
              <Text style={[
                styles.statText,
                { 
                  color: theme.textColor + '99',
                  fontSize: theme.font.size.xs,
                }
              ]}>
                {entry.views}
              </Text>
            </View>

            {entry.comments.length > 0 && (
              <View style={styles.statItem}>
                <Icon name="edit" size="xs" color={theme.textColor + '99'} style={{ marginRight: 4 }} />
                <Text style={[
                  styles.statText,
                  { 
                    color: theme.textColor + '99',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  {entry.comments.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <View style={[styles.tags, { marginTop: theme.spacing.small }]}>
            {entry.tags.slice(0, 2).map((tag, index) => (
              <View 
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.primaryColor + '20', // 20% opacity
                    borderRadius: theme.spacing.small,
                    paddingHorizontal: theme.spacing.small,
                    paddingVertical: theme.spacing.small / 2,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.tagText,
                    {
                      color: theme.primaryColor,
                      fontSize: theme.font.size.xs,
                    }
                  ]}
                >
                  #{tag}
                </Text>
              </View>
            ))}
            {entry.tags.length > 2 && (
              <Text 
                style={[
                  styles.moreTagsText,
                  {
                    color: theme.textColor + '99',
                    fontSize: theme.font.size.xs,
                  }
                ]}
              >
                +{entry.tags.length - 2}
              </Text>
            )}
          </View>
        )}

        {/* Privacy indicator */}
        {entry.visibility !== 'public' && (
          <View style={[styles.privacyIndicator, { marginTop: theme.spacing.small }]}>
            <Icon 
              name={entry.visibility === 'private' ? 'lock' : 'user'} 
              size="xs" 
              color={theme.warningColor || theme.accentColor}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16/9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  excerpt: {
    lineHeight: 20,
  },
  date: {
    fontStyle: 'italic',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontWeight: '500',
  },
  moreTagsText: {
    fontWeight: '500',
    opacity: 0.7,
  },
  privacyIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default JournalEntryCard;