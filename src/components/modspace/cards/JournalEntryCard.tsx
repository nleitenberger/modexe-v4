import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Animated } from 'react-native';
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
  onEdit?: () => void;
  onDelete?: () => void;
  onFullscreen?: () => void;
  showActions?: boolean;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  config,
  theme,
  width,
  aspectRatio = 'dynamic',
  onPress,
  onLongPress,
  onEdit,
  onDelete,
  onFullscreen,
  showActions = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleMenuClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMenu(false);
    });
  };

  // Animation effect when menu shows/hides
  useEffect(() => {
    if (showMenu) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMenu, scaleAnim, opacityAnim]);

  const handleViewPress = () => {
    handleMenuClose();
    setTimeout(() => onFullscreen?.(), 200); // Delay to let animation finish
  };

  const handleEditPress = () => {
    handleMenuClose();
    setTimeout(() => onEdit?.(), 200); // Delay to let animation finish
  };

  const handleDeletePress = () => {
    handleMenuClose();
    setTimeout(() => {
      Alert.alert(
        'Delete Entry',
        `Are you sure you want to delete "${entry.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ]
      );
    }, 200); // Delay to let animation finish
  };

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
      borderRadius: theme.effects?.borderRadius || theme.borderRadius || 12,
      width: width || undefined,
      height: getCardHeight(),
    };

    switch (config.cardStyle) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: theme.shadows?.color || '#000',
          shadowOffset: {
            width: theme.shadows?.offset?.x || 0,
            height: theme.shadows?.offset?.y || 2,
          },
          shadowOpacity: theme.shadows?.enabled ? (theme.shadows?.opacity || 0.1) : 0.1,
          shadowRadius: theme.shadows?.blur || 4,
          elevation: theme.effects?.cardElevation || 3,
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

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Invalid date';
    }
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
              { 
                borderTopLeftRadius: theme.effects?.borderRadius || theme.borderRadius || 12, 
                borderTopRightRadius: theme.effects?.borderRadius || theme.borderRadius || 12 
              }
            ]}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Content */}
      <View style={[
        styles.content,
        { padding: theme.spacing?.medium || 16 }
      ]}>
        {/* Title */}
        <Text 
          style={[
            styles.title,
            {
              color: theme.textColor,
              fontSize: theme.font?.size?.medium || 16,
              fontWeight: theme.font?.weight === 'bold' ? '700' : '600',
              fontFamily: theme.font?.family === 'serif' ? 'serif' : 'system',
              lineHeight: (theme.font?.lineHeight || 1.4) * (theme.font?.size?.medium || 16),
              letterSpacing: theme.font?.letterSpacing || 0,
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
                fontSize: theme.font?.size?.small || 14,
                fontFamily: theme.font?.family === 'serif' ? 'serif' : 'system',
                lineHeight: (theme.font?.lineHeight || 1.4) * (theme.font?.size?.small || 14),
                marginTop: (theme.spacing?.small || 8) / 2,
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
                fontSize: theme.font?.size?.xs || 12,
                marginTop: theme.spacing?.small || 8,
              }
            ]}
          >
            {formatDate(entry.shareDate)}
          </Text>
        )}

        {/* Stats */}
        {config.showStats && (
          <View style={[styles.stats, { marginTop: theme.spacing?.small || 8 }]}>
            <View style={styles.statItem}>
              <Icon name="heart" size="xs" color={theme.accentColor} style={{ marginRight: 4 }} />
              <Text style={[
                styles.statText,
                { 
                  color: theme.textColor + '99', // 60% opacity
                  fontSize: theme.font?.size?.xs || 12,
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
                  fontSize: theme.font?.size?.xs || 12,
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
                    fontSize: theme.font?.size?.xs || 12,
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
          <View style={[styles.tags, { marginTop: theme.spacing?.small || 8 }]}>
            {entry.tags.slice(0, 2).map((tag, index) => (
              <View 
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.primaryColor + '20', // 20% opacity
                    borderRadius: theme.spacing?.small || 8,
                    paddingHorizontal: theme.spacing?.small || 8,
                    paddingVertical: (theme.spacing?.small || 8) / 2,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.tagText,
                    {
                      color: theme.primaryColor,
                      fontSize: theme.font?.size?.xs || 12,
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
                    fontSize: theme.font?.size?.xs || 12,
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
          <View style={[styles.privacyIndicator]}>
            <Icon 
              name={entry.visibility === 'private' ? 'lock' : 'user'} 
              size="xs" 
              color={theme.warningColor || theme.accentColor}
            />
          </View>
        )}

      </View>

      {/* Menu button */}
      {showActions && (
        <TouchableOpacity
          style={[styles.menuButton, {
            backgroundColor: theme.backgroundColor + 'E6', // 90% opacity
            borderRadius: 16,
          }]}
          onPress={handleMenuPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="more" size="sm" color={theme.textColor} />
        </TouchableOpacity>
      )}

      {/* Context dropdown menu */}
      {showMenu && (
        <>
          {/* Overlay to close menu */}
          <TouchableOpacity
            style={styles.contextOverlay}
            activeOpacity={1}
            onPress={handleMenuClose}
          />
          
          {/* Animated dropdown menu - positioned relative to card */}
          <Animated.View style={[
            styles.contextMenu,
            {
              backgroundColor: theme.surfaceColor || theme.backgroundColor,
              borderRadius: theme.effects?.borderRadius || 12,
              shadowColor: theme.shadows?.color || '#000',
              shadowOffset: {
                width: theme.shadows?.offset?.x || 0,
                height: theme.shadows?.offset?.y || 8,
              },
              shadowOpacity: theme.shadows?.enabled ? (theme.shadows?.opacity || 0.25) : 0.25,
              shadowRadius: theme.shadows?.blur || 12,
              elevation: 8,
              opacity: opacityAnim,
              transform: [
                {
                  scale: scaleAnim,
                },
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0], // Slide down from slightly above
                  }),
                },
              ],
            }
          ]}>
            <TouchableOpacity
              style={[styles.contextMenuItem, { borderBottomColor: theme.textColor + '20' }]}
              onPress={handleViewPress}
              activeOpacity={0.7}
            >
              <Icon name="discover" size="sm" color={theme.primaryColor} style={{ marginRight: 12 }} />
              <Text style={[styles.contextMenuItemText, {
                color: theme.textColor,
                fontSize: theme.font?.size?.medium || 16,
              }]}>View Full Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contextMenuItem, { borderBottomColor: theme.textColor + '20' }]}
              onPress={handleEditPress}
              activeOpacity={0.7}
            >
              <Icon name="edit" size="sm" color={theme.secondaryColor} style={{ marginRight: 12 }} />
              <Text style={[styles.contextMenuItemText, {
                color: theme.textColor,
                fontSize: theme.font?.size?.medium || 16,
              }]}>Edit Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Icon name="close" size="sm" color={theme.errorColor || theme.accentColor} style={{ marginRight: 12 }} />
              <Text style={[styles.contextMenuItemText, {
                color: theme.errorColor || theme.accentColor,
                fontSize: theme.font?.size?.medium || 16,
              }]}>Delete Entry</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
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
    top: 12,
    left: 12,
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  contextMenu: {
    position: 'absolute',
    top: 50, // Position below the menu button
    right: 8, // Align with right edge of card
    width: 180,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    minHeight: 44, // Ensure touch-friendly height
  },
  contextMenuItemText: {
    fontWeight: '500',
    flex: 1,
  },
});

export default JournalEntryCard;