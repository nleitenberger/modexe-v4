import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SharedJournalEntry } from '../../types/modspace.types';
import { useTheme } from '../../contexts/ThemeContext';
import { useOrientation } from '../../utils/useOrientation';
import Icon from '../common/Icon';

interface JournalFullscreenViewerProps {
  visible: boolean;
  entry: SharedJournalEntry | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const JournalFullscreenViewer: React.FC<JournalFullscreenViewerProps> = ({
  visible,
  entry,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { currentTheme } = useTheme();
  const { isPortrait } = useOrientation();

  if (!entry) return null;

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return 'Unknown date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(dateObj);
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.backgroundColor} />
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: currentTheme.backgroundColor }
      ]}>
        {/* Header */}
        <View style={[
          styles.header,
          {
            backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.textColor + '20',
            paddingHorizontal: isPortrait ? 16 : 32,
            paddingVertical: 12,
          }
        ]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: currentTheme.textColor + '10' }
              ]}
              onPress={onClose}
            >
              <Icon name="arrow-right" size="md" color={currentTheme.textColor} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={[
              styles.headerTitle,
              {
                color: currentTheme.textColor,
                fontSize: currentTheme.font?.size?.large || 18,
                fontWeight: '600',
              }
            ]}>
              Journal Entry
            </Text>
          </View>

          <View style={styles.headerRight}>
            {onEdit && (
              <TouchableOpacity
                style={[
                  styles.actionHeaderButton,
                  { backgroundColor: currentTheme.primaryColor + '20' }
                ]}
                onPress={onEdit}
              >
                <Icon name="edit" size="sm" color={currentTheme.primaryColor} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={[
                  styles.actionHeaderButton,
                  { backgroundColor: (currentTheme.errorColor || currentTheme.accentColor) + '20', marginLeft: 8 }
                ]}
                onPress={onDelete}
              >
                <Icon name="close" size="sm" color={currentTheme.errorColor || currentTheme.accentColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingHorizontal: isPortrait ? 20 : 40 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={[
            styles.title,
            {
              color: currentTheme.textColor,
              fontSize: currentTheme.font?.size?.xlarge || 24,
              fontWeight: '700',
              lineHeight: (currentTheme.font?.lineHeight || 1.4) * (currentTheme.font?.size?.xlarge || 24),
              marginBottom: currentTheme.spacing?.medium || 16,
            }
          ]}>
            {entry.title}
          </Text>

          {/* Metadata */}
          <View style={[styles.metadata, { marginBottom: currentTheme.spacing?.large || 24 }]}>
            <View style={styles.metadataRow}>
              <Icon name="calendar" size="sm" color={currentTheme.textColor + '80'} />
              <Text style={[
                styles.metadataText,
                {
                  color: currentTheme.textColor + '80',
                  fontSize: currentTheme.font?.size?.small || 14,
                  marginLeft: 8,
                }
              ]}>
                {formatDate(entry.shareDate)}
              </Text>
            </View>

            <View style={[styles.metadataRow, { marginTop: 8 }]}>
              <Icon name="heart" size="sm" color={currentTheme.accentColor} />
              <Text style={[
                styles.metadataText,
                {
                  color: currentTheme.textColor + '80',
                  fontSize: currentTheme.font?.size?.small || 14,
                  marginLeft: 8,
                }
              ]}>
                {entry.likes} likes
              </Text>
              
              <Icon name="discover" size="sm" color={currentTheme.textColor + '80'} style={{ marginLeft: 16 }} />
              <Text style={[
                styles.metadataText,
                {
                  color: currentTheme.textColor + '80',
                  fontSize: currentTheme.font?.size?.small || 14,
                  marginLeft: 8,
                }
              ]}>
                {entry.views} views
              </Text>
            </View>

            {/* Privacy indicator */}
            {entry.visibility !== 'public' && (
              <View style={[styles.metadataRow, { marginTop: 8 }]}>
                <Icon 
                  name={entry.visibility === 'private' ? 'lock' : 'user'} 
                  size="sm" 
                  color={currentTheme.warningColor || currentTheme.accentColor} 
                />
                <Text style={[
                  styles.metadataText,
                  {
                    color: currentTheme.warningColor || currentTheme.accentColor,
                    fontSize: currentTheme.font?.size?.small || 14,
                    marginLeft: 8,
                    fontWeight: '500',
                  }
                ]}>
                  {entry.visibility === 'private' ? 'Private' : 'Friends Only'}
                </Text>
              </View>
            )}
          </View>

          {/* Content/Excerpt */}
          <Text style={[
            styles.excerpt,
            {
              color: currentTheme.textColor,
              fontSize: currentTheme.font?.size?.medium || 16,
              lineHeight: (currentTheme.font?.lineHeight || 1.6) * (currentTheme.font?.size?.medium || 16),
              fontFamily: currentTheme.font?.family === 'serif' ? 'serif' : 'system',
              marginBottom: currentTheme.spacing?.large || 24,
            }
          ]}>
            {entry.excerpt || 'No content available'}
          </Text>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={[
                styles.sectionTitle,
                {
                  color: currentTheme.textColor,
                  fontSize: currentTheme.font?.size?.medium || 16,
                  fontWeight: '600',
                  marginBottom: currentTheme.spacing?.small || 8,
                }
              ]}>
                Tags
              </Text>
              <View style={styles.tagsContainer}>
                {entry.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: currentTheme.primaryColor + '20',
                        borderRadius: currentTheme.spacing?.small || 8,
                        paddingHorizontal: currentTheme.spacing?.small || 8,
                        paddingVertical: (currentTheme.spacing?.small || 8) / 2,
                        marginRight: 8,
                        marginBottom: 8,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.tagText,
                      {
                        color: currentTheme.primaryColor,
                        fontSize: currentTheme.font?.size?.small || 14,
                        fontWeight: '500',
                      }
                    ]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Page info */}
          <View style={[styles.pageInfo, { marginTop: currentTheme.spacing?.large || 24 }]}>
            <Text style={[
              styles.pageInfoText,
              {
                color: currentTheme.textColor + '60',
                fontSize: currentTheme.font?.size?.small || 14,
                fontStyle: 'italic',
              }
            ]}>
              Pages {entry.pages.join(', ')} from "{entry.journalTitle}"
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    width: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 24,
  },
  title: {
    fontWeight: '700',
  },
  metadata: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontWeight: '500',
  },
  excerpt: {
    textAlign: 'left',
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontWeight: '500',
  },
  pageInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  pageInfoText: {
    textAlign: 'center',
  },
});

export default JournalFullscreenViewer;