import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createModSpace } from '../../store/modspaceSlice';
import { createJournal } from '../../store/journalSlice';
import { useOrientation } from '../../utils/useOrientation';
import ProfileHeader from './widgets/ProfileHeader';
import CustomizationPanel from './CustomizationPanel';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { SharedContentItem } from '../../types/modspace.types';
import Icon from '../common/Icon';

// Utility function to combine journal entries and media items into unified content
const combineSharedContent = (modspace: any): SharedContentItem[] => {
  if (!modspace) return [];
  
  const unifiedContent: SharedContentItem[] = [];
  
  // Add journal entries
  if (modspace.sharedEntries) {
    modspace.sharedEntries.forEach((entry: any) => {
      unifiedContent.push({
        id: entry.id,
        type: 'journal',
        title: entry.title,
        excerpt: entry.excerpt,
        views: entry.views || 0,
        likes: entry.likes || 0,
        createdAt: entry.createdAt,
        tags: entry.tags || [],
        isPublic: entry.isPublic,
        journalId: entry.journalId,
        pageNumbers: entry.pageNumbers,
      });
    });
  }
  
  // Add media items
  if (modspace.mediaGallery) {
    modspace.mediaGallery.forEach((media: any) => {
      unifiedContent.push({
        id: media.id,
        type: 'media',
        title: media.caption || 'Media Post',
        excerpt: media.caption,
        views: media.views || 0,
        likes: media.likes || 0,
        createdAt: media.uploadDate,
        tags: media.tags || [],
        isPublic: true, // Assume media is public for now
        mediaType: media.type,
        url: media.url,
        thumbnail: media.thumbnail,
        dimensions: media.dimensions,
      });
    });
  }
  
  // Sort by creation date (newest first)
  return unifiedContent.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const ModSpaceProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { currentModSpace, isLoading } = useSelector(
    (state: RootState) => state.modspace
  );
  const { isPortrait } = useOrientation();
  const { currentTheme } = useTheme();
  const [showNewEntryOptions, setShowNewEntryOptions] = React.useState(false);
  const [showCustomizationPanel, setShowCustomizationPanel] = React.useState(false);
  
  // Create theme-aware styles
  const themedStyles = createThemedStyles(currentTheme);
  
  // Get combined content (journal entries + media items)
  const sharedContent = combineSharedContent(currentModSpace);

  const handleNewEntryPress = () => {
    setShowNewEntryOptions(true);
  };

  const handleCreateJournal = () => {
    setShowNewEntryOptions(false);
    // Create journal directly without modal
    const defaultTitle = `Journal Entry - ${new Date().toLocaleDateString()}`;
    dispatch(createJournal({ title: defaultTitle }));
    // Navigate to Journal Editor
    navigation.navigate('JournalEditor');
  };

  const handleCreateMedia = () => {
    setShowNewEntryOptions(false);
    // TODO: Implement media creation functionality
    Alert.alert('Media Post', 'Media post creation coming soon!');
  };

  const handleCancelNewEntry = () => {
    setShowNewEntryOptions(false);
  };

  const handleCustomizePress = () => {
    setShowCustomizationPanel(true);
  };

  const handleCustomizationClose = () => {
    setShowCustomizationPanel(false);
  };

  const handleCustomizationSave = () => {
    // The CustomizationPanel handles saving internally
    console.log('Customization saved successfully');
  };



  useEffect(() => {
    // Create a default ModSpace if none exists
    if (!currentModSpace && !isLoading) {
      dispatch(createModSpace({
        userId: 'user-1',
        username: 'journaler',
        displayName: 'My Journal Space',
      }));
    }
  }, [currentModSpace, isLoading, dispatch]);

  if (isLoading) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.loadingContainer}>
          <Text style={themedStyles.loadingText}>Loading ModSpace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentModSpace) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.emptyContainer}>
          <View style={themedStyles.emptyTextContainer}>
            <Text style={themedStyles.emptyText}>Welcome to ModSpace!</Text>
            <Icon name="rocket" size="md" color={currentTheme.primaryColor} style={{ marginLeft: 8 }} />
          </View>
          <Text style={themedStyles.emptySubText}>
            Your personal profile and content hub
          </Text>
          <TouchableOpacity 
            style={themedStyles.createButton}
            onPress={() => dispatch(createModSpace({
              userId: 'user-1',
              username: 'journaler',
              displayName: 'My Journal Space',
            }))}
          >
            <Text style={themedStyles.createButtonText}>Create Your ModSpace</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <ScrollView 
        style={themedStyles.scrollView}
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with integrated stats */}
        <ProfileHeader modspace={currentModSpace} />

        {/* Quick Actions */}
        <View style={[
          themedStyles.quickActionsContainer, 
          { paddingHorizontal: isPortrait ? 16 : 32 }
        ]}>
          <TouchableOpacity 
            style={themedStyles.actionButton}
            onPress={handleNewEntryPress}
          >
            <View style={themedStyles.actionButtonContent}>
              <Icon name="new-entry" size="sm" color={currentTheme.textColor} style={{ marginRight: 6 }} />
              <Text style={themedStyles.actionButtonText}>New Entry</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={themedStyles.actionButton}>
            <View style={themedStyles.actionButtonContent}>
              <Icon name="share" size="sm" color={currentTheme.textColor} style={{ marginRight: 6 }} />
              <Text style={themedStyles.actionButtonText}>Share Entry</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={themedStyles.actionButton}
            onPress={handleCustomizePress}
          >
            <View style={themedStyles.actionButtonContent}>
              <Icon name="customize" size="sm" color={currentTheme.textColor} style={{ marginRight: 6 }} />
              <Text style={themedStyles.actionButtonText}>Customize</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content Sections */}
        <View style={[
          themedStyles.contentContainer,
          { paddingHorizontal: isPortrait ? 16 : 32 }
        ]}>
          

          {/* Unified Content Section */}
          <View style={themedStyles.sectionContainer}>
            <Text style={themedStyles.sectionTitle}>My Content</Text>
            {sharedContent.length === 0 ? (
              <View style={themedStyles.emptySection}>
                <Text style={themedStyles.emptySectionText}>
                  No content shared yet
                </Text>
                <Text style={themedStyles.emptySectionSubText}>
                  Share your journal entries and media to showcase your creativity
                </Text>
              </View>
            ) : (
              <View style={[
                themedStyles.entriesGrid,
                isPortrait ? themedStyles.entriesVertical : themedStyles.entriesHorizontal
              ]}>
                {sharedContent.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      themedStyles.entryCard,
                      isPortrait ? themedStyles.entryCardVertical : themedStyles.entryCardHorizontal
                    ]}
                  >
                    {/* Content Type Icon */}
                    <View style={themedStyles.contentTypeIndicator}>
                      <Icon 
                        name={item.type === 'journal' ? 'edit' : 'media'} 
                        size="xs" 
                        color={item.type === 'journal' ? currentTheme.primaryColor : currentTheme.successColor || '#34C759'} 
                        style={{ marginRight: 6 }} 
                      />
                      <Text style={themedStyles.contentTypeText}>
                        {item.type === 'journal' ? 'Journal' : 'Media'}
                      </Text>
                    </View>

                    {/* Media thumbnail for media items */}
                    {item.type === 'media' && item.thumbnail && (
                      <View style={themedStyles.mediaThumbnailContainer}>
                        <Text style={themedStyles.mediaThumbnailPlaceholder}>
                          {item.mediaType?.toUpperCase()} 📷
                        </Text>
                      </View>
                    )}

                    <Text style={themedStyles.entryTitle}>{item.title}</Text>
                    {item.excerpt && (
                      <Text style={themedStyles.entryExcerpt} numberOfLines={3}>
                        {item.excerpt}
                      </Text>
                    )}

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <View style={themedStyles.tagsContainer}>
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <View key={index} style={themedStyles.tag}>
                            <Text style={themedStyles.tagText}>#{tag}</Text>
                          </View>
                        ))}
                        {item.tags.length > 2 && (
                          <Text style={themedStyles.moreTagsText}>+{item.tags.length - 2}</Text>
                        )}
                      </View>
                    )}

                    <View style={themedStyles.entryStats}>
                      <View style={themedStyles.entryStatContainer}>
                        <Icon name="heart" size="xs" color={currentTheme.errorColor || "#FF3B30"} style={{ marginRight: 4 }} />
                        <Text style={themedStyles.entryStatText}>{item.likes}</Text>
                      </View>
                      <View style={themedStyles.entryStatContainer}>
                        <Icon name="discover" size="xs" color={currentTheme.textColor} style={{ marginRight: 4, opacity: 0.6 }} />
                        <Text style={themedStyles.entryStatText}>{item.views}</Text>
                      </View>
                      <Text style={themedStyles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>


        </View>
      </ScrollView>

      {/* New Entry Options Modal */}
      <Modal
        visible={showNewEntryOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelNewEntry}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalContent}>
            <Text style={themedStyles.modalTitle}>Create New Entry</Text>
            <Text style={themedStyles.modalSubtitle}>
              Choose the type of content you'd like to create
            </Text>
            
            <View style={themedStyles.entryOptionsContainer}>
              <TouchableOpacity 
                style={themedStyles.entryOption}
                onPress={handleCreateJournal}
              >
                <Icon name="edit" size="xl" color={currentTheme.primaryColor} />
                <Text style={themedStyles.entryOptionTitle}>Journal Entry</Text>
                <Text style={themedStyles.entryOptionDescription}>
                  Write and design with text and stickers
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={themedStyles.entryOption}
                onPress={handleCreateMedia}
              >
                <Icon name="media" size="xl" color={currentTheme.successColor || '#34C759'} />
                <Text style={themedStyles.entryOptionTitle}>Media Post</Text>
                <Text style={themedStyles.entryOptionDescription}>
                  Share photos, videos, or other media
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[themedStyles.modalButton, themedStyles.modalCancelButton]}
              onPress={handleCancelNewEntry}
            >
              <Text style={themedStyles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Customization Panel */}
      <CustomizationPanel
        visible={showCustomizationPanel}
        onClose={handleCustomizationClose}
        onSave={handleCustomizationSave}
      />

    </SafeAreaView>
  );
};

// Create theme-aware styles function
const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.textColor,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing?.xl || 32,
  },
  emptyTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing?.xs || 8,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.textColor,
    textAlign: 'center',
    marginBottom: theme.spacing?.xs || 8,
  },
  emptySubText: {
    fontSize: 16,
    color: theme.textColor,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: theme.spacing?.xl || 32,
  },
  createButton: {
    backgroundColor: theme.primaryColor,
    paddingHorizontal: theme.spacing?.lg || 24,
    paddingVertical: theme.spacing?.sm || 12,
    borderRadius: theme.borderRadius || 8,
  },
  createButtonText: {
    color: theme.surfaceColor || 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: theme.spacing?.xl || 32,
  },
  contentContainer: {
    marginTop: theme.spacing?.md || 16,
  },
  sectionContainer: {
    marginBottom: theme.spacing?.lg || 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: theme.spacing?.md || 16,
  },
  emptySection: {
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    borderRadius: theme.borderRadius || 12,
    padding: theme.spacing?.xl || 32,
    alignItems: 'center',
    shadowColor: theme.shadows?.color || '#000',
    shadowOffset: {
      width: 0,
      height: theme.shadows?.offset?.y || 2,
    },
    shadowOpacity: theme.shadows?.opacity || 0.1,
    shadowRadius: theme.shadows?.blur || 4,
    elevation: theme.shadows?.elevation || 3,
  },
  emptySectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textColor,
    opacity: 0.8,
    marginBottom: theme.spacing?.xs || 8,
  },
  emptySectionSubText: {
    fontSize: 14,
    color: theme.textColor,
    opacity: 0.6,
    textAlign: 'center',
  },
  entriesGrid: {
    gap: theme.spacing?.md || 16,
  },
  entriesVertical: {
    flexDirection: 'column',
  },
  entriesHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  entryCard: {
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    borderRadius: theme.borderRadius || 12,
    padding: theme.spacing?.md || 16,
    shadowColor: theme.shadows?.color || '#000',
    shadowOffset: {
      width: 0,
      height: theme.shadows?.offset?.y || 2,
    },
    shadowOpacity: theme.shadows?.opacity || 0.1,
    shadowRadius: theme.shadows?.blur || 4,
    elevation: theme.shadows?.elevation || 3,
  },
  entryCardVertical: {
    width: '100%',
    marginBottom: theme.spacing?.md || 16,
  },
  entryCardHorizontal: {
    width: '48%',
    marginBottom: theme.spacing?.md || 16,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: theme.spacing?.xs || 8,
  },
  entryExcerpt: {
    fontSize: 14,
    color: theme.textColor,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: theme.spacing?.sm || 12,
  },
  entryStats: {
    flexDirection: 'row',
    gap: theme.spacing?.md || 16,
  },
  entryStatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryStatText: {
    fontSize: 12,
    color: theme.textColor,
    opacity: 0.6,
  },
  // New styles for unified content
  contentTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing?.xs || 8,
  },
  contentTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textColor,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mediaThumbnailContainer: {
    height: 80,
    backgroundColor: theme.secondaryColor || theme.surfaceColor,
    borderRadius: theme.borderRadius || 8,
    marginBottom: theme.spacing?.sm || 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaThumbnailPlaceholder: {
    fontSize: 14,
    color: theme.textColor,
    opacity: 0.6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: theme.spacing?.sm || 12,
  },
  tag: {
    backgroundColor: theme.primaryColor + '20', // 20% opacity
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: theme.primaryColor,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: theme.textColor,
    opacity: 0.6,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 10,
    color: theme.textColor,
    opacity: 0.5,
    marginLeft: 'auto',
  },
  mediaGrid: {
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    borderRadius: theme.borderRadius || 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing?.sm || 12,
    marginBottom: theme.spacing?.lg || 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    borderRadius: theme.borderRadius || 8,
    paddingHorizontal: theme.spacing?.md || 16,
    paddingVertical: theme.spacing?.sm || 12,
    shadowColor: theme.shadows?.color || '#000',
    shadowOffset: {
      width: 0,
      height: theme.shadows?.offset?.y || 1,
    },
    shadowOpacity: theme.shadows?.opacity || 0.1,
    shadowRadius: theme.shadows?.blur || 2,
    elevation: theme.shadows?.elevation || 2,
    alignItems: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing?.lg || 20,
  },
  modalContent: {
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    borderRadius: theme.borderRadius || 16,
    padding: theme.spacing?.lg || 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: theme.shadows?.color || '#000',
    shadowOffset: {
      width: 0,
      height: theme.shadows?.offset?.y || 4,
    },
    shadowOpacity: theme.shadows?.opacity || 0.3,
    shadowRadius: theme.shadows?.blur || 8,
    elevation: theme.shadows?.elevation || 8,
  },
  entryOptionsContainer: {
    gap: theme.spacing?.md || 16,
    marginBottom: theme.spacing?.lg || 20,
  },
  entryOption: {
    backgroundColor: theme.secondaryColor || theme.surfaceColor,
    borderRadius: theme.borderRadius || 12,
    padding: theme.spacing?.lg || 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.textColor + '20', // 20% opacity
  },
  entryOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textColor,
    marginTop: theme.spacing?.sm || 12,
    marginBottom: 4,
  },
  entryOptionDescription: {
    fontSize: 14,
    color: theme.textColor,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textColor,
    marginBottom: theme.spacing?.xs || 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.textColor,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: theme.spacing?.lg || 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius || 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: theme.secondaryColor || theme.surfaceColor,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textColor,
    opacity: 0.8,
  },
});

export default ModSpaceProfile;