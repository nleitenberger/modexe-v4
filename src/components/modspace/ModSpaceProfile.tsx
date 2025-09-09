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
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createModSpace } from '../../store/modspaceSlice';
import { createJournal } from '../../store/journalSlice';
import { useOrientation } from '../../utils/useOrientation';
import ProfileHeader from './widgets/ProfileHeader';
import CustomizationPanel from './CustomizationPanel';
import LayoutRenderer from './LayoutRenderer';
import JournalFullscreenViewer from './JournalFullscreenViewer';
import FloatingActionButton from './FloatingActionButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { SharedContentItem } from '../../types/modspace.types';
import { loadJournal, loadJournalFromSharedEntry } from '../../store/journalSlice';
import JournalReconstructionService from '../../services/JournalReconstructionService';
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
  return unifiedContent.sort((a, b) => {
    try {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      // Handle invalid dates by treating them as very old (epoch time)
      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
      
      return timeB - timeA;
    } catch (error) {
      console.warn('Error sorting by date:', error);
      return 0; // Keep original order if there's an error
    }
  });
};

const ModSpaceProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { currentModSpace, isLoading } = useSelector(
    (state: RootState) => state.modspace
  );
  const { isPortrait } = useOrientation();
  const { currentTheme } = useTheme();
  const [showCustomizationPanel, setShowCustomizationPanel] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<SharedContentItem | null>(null);
  const [showFullscreenViewer, setShowFullscreenViewer] = React.useState(false);
  const fabRef = React.useRef<any>(null);
  const [fabKey, setFabKey] = React.useState(0);
  
  // Create theme-aware styles
  const themedStyles = createThemedStyles(currentTheme);
  
  // Get combined content (journal entries + media items)
  const sharedContent = combineSharedContent(currentModSpace);

  const handleCreateJournal = () => {
    // Create journal directly without modal
    const defaultTitle = `Journal Entry - ${new Date().toLocaleDateString()}`;
    dispatch(createJournal({ title: defaultTitle }));
    // Navigate to Journal Editor
    navigation.navigate('JournalEditor');
  };

  const handleCreateMedia = () => {
    // Reset FAB immediately when media button is pressed
    setFabKey(prev => prev + 1);
    // TODO: Implement media creation functionality
    Alert.alert('Media Post', 'Media post creation coming soon!');
  };

  const handleCustomizePress = () => {
    setShowCustomizationPanel(true);
  };

  const handleCustomizationClose = () => {
    setShowCustomizationPanel(false);
    // Reset FAB when customization panel is closed
    setFabKey(prev => prev + 1);
  };

  const handleCustomizationSave = () => {
    // The CustomizationPanel handles saving internally
    console.log('Customization saved successfully');
  };

  const handleEntryFullscreen = (entry: SharedContentItem) => {
    setSelectedEntry(entry);
    setShowFullscreenViewer(true);
  };

  const handleEntryEdit = (entry: SharedContentItem) => {
    if (entry.type === 'journal') {
      // Check if we can reconstruct the journal
      if (JournalReconstructionService.canReconstructJournal(entry)) {
        Alert.alert(
          'Edit Journal Entry',
          `How would you like to edit "${entry.title}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Edit Original',
              onPress: () => handleEditOriginalJournal(entry),
            },
            {
              text: 'Edit as Copy',
              onPress: () => handleEditJournalCopy(entry),
            },
          ]
        );
      } else {
        // Fallback if we can't reconstruct
        Alert.alert(
          'Edit Not Available',
          'This journal entry cannot be edited. You can create a new journal based on this content.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Create New',
              onPress: () => {
                const newTitle = `Inspired by ${entry.title}`;
                dispatch(createJournal({ title: newTitle }));
                navigation.navigate('JournalEditor');
              },
            },
          ]
        );
      }
    } else {
      Alert.alert('Edit', 'Media items cannot be edited in the journal editor');
    }
  };

  const handleEditOriginalJournal = (entry: SharedContentItem) => {
    try {
      // Reconstruct the journal from shared entry data
      const reconstructedJournal = JournalReconstructionService.reconstructJournalFromSharedEntry(entry);
      
      // Validate the reconstructed journal
      if (JournalReconstructionService.validateReconstructedJournal(reconstructedJournal)) {
        // Load the journal into the editor with shared entry tracking
        dispatch(loadJournalFromSharedEntry({ 
          journal: reconstructedJournal, 
          sharedEntryId: entry.id 
        }));
        navigation.navigate('JournalEditor');
      } else {
        throw new Error('Reconstructed journal failed validation');
      }
    } catch (error) {
      console.error('Error reconstructing journal:', error);
      Alert.alert(
        'Error',
        'Could not load the journal for editing. Please try creating a copy instead.',
        [
          { text: 'OK' },
          {
            text: 'Create Copy',
            onPress: () => handleEditJournalCopy(entry),
          },
        ]
      );
    }
  };

  const handleEditJournalCopy = (entry: SharedContentItem) => {
    try {
      // Create a copy of the journal for editing
      const journalCopy = JournalReconstructionService.createJournalCopyFromSharedEntry(entry);
      
      // Load the copy into the editor
      dispatch(loadJournal(journalCopy));
      navigation.navigate('JournalEditor');
    } catch (error) {
      console.error('Error creating journal copy:', error);
      Alert.alert('Error', 'Could not create a copy of the journal');
    }
  };

  const handleEntryDelete = (entry: SharedContentItem) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            console.log('Delete entry:', entry.id);
            Alert.alert('Success', 'Entry deleted successfully');
          },
        },
      ]
    );
  };

  const handleFullscreenClose = () => {
    setShowFullscreenViewer(false);
    setSelectedEntry(null);
  };

  const handleFullscreenEdit = () => {
    if (selectedEntry) {
      handleFullscreenClose();
      // Use a slight delay to ensure the modal closes smoothly before showing the edit dialog
      setTimeout(() => {
        handleEntryEdit(selectedEntry);
      }, 100);
    }
  };

  const handleFullscreenDelete = () => {
    if (selectedEntry) {
      handleFullscreenClose();
      handleEntryDelete(selectedEntry);
    }
  };



  // Reset FAB state when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      // Force complete remount of FAB by changing its key
      setFabKey(prev => prev + 1);
    }, [])
  );

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
      <View style={themedStyles.container}>
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

        {/* Floating Action Button */}
        <FloatingActionButton
          key={fabKey}
          ref={fabRef}
          onJournalEntry={handleCreateJournal}
          onMediaEntry={handleCreateMedia}
          onCustomize={handleCustomizePress}
        />
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <ScrollView 
        style={themedStyles.scrollView}
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with integrated stats - extends into notch area */}
        <ProfileHeader modspace={currentModSpace} />


        {/* Content Section Header */}
        <View style={[
          themedStyles.contentHeader,
          { paddingHorizontal: isPortrait ? 16 : 32 }
        ]}>
          <Text style={themedStyles.sectionTitle}>My Content</Text>
        </View>

        {/* Content with Layout Renderer */}
        {sharedContent.length === 0 ? (
          <View style={[
            themedStyles.emptySection,
            { marginHorizontal: isPortrait ? 16 : 32 }
          ]}>
            <Text style={themedStyles.emptySectionText}>
              No content shared yet
            </Text>
            <Text style={themedStyles.emptySectionSubText}>
              Share your journal entries and media to showcase your creativity
            </Text>
          </View>
        ) : (
          <LayoutRenderer
            layout={currentModSpace.layout}
            content={sharedContent}
            onEntryPress={handleEntryFullscreen}
            onEntryLongPress={(entry) => {
              // TODO: Show context menu
              console.log('Entry long pressed:', entry.id);
            }}
            onEntryEdit={handleEntryEdit}
            onEntryDelete={handleEntryDelete}
            onEntryFullscreen={handleEntryFullscreen}
          />
        )}
      </ScrollView>


      {/* Customization Panel */}
      <CustomizationPanel
        visible={showCustomizationPanel}
        onClose={handleCustomizationClose}
        onSave={handleCustomizationSave}
      />

      {/* Fullscreen Journal Viewer */}
      <JournalFullscreenViewer
        visible={showFullscreenViewer}
        entry={selectedEntry ? {
          // Convert SharedContentItem to SharedJournalEntry format for the viewer
          id: selectedEntry.id,
          journalId: selectedEntry.type === 'journal' ? selectedEntry.journalId || '' : selectedEntry.id,
          journalTitle: selectedEntry.title,
          pages: selectedEntry.type === 'journal' ? selectedEntry.pageNumbers || [1] : [1],
          title: selectedEntry.title,
          excerpt: selectedEntry.excerpt || '',
          thumbnail: selectedEntry.type === 'media' ? selectedEntry.thumbnail : undefined,
          shareDate: new Date(selectedEntry.createdAt),
          visibility: selectedEntry.isPublic ? 'public' as const : 'private' as const,
          likes: selectedEntry.likes,
          views: selectedEntry.views,
          comments: [],
          tags: selectedEntry.tags,
        } : null}
        onClose={handleFullscreenClose}
        onEdit={handleFullscreenEdit}
        onDelete={handleFullscreenDelete}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        key={fabKey}
        ref={fabRef}
        onJournalEntry={handleCreateJournal}
        onMediaEntry={handleCreateMedia}
        onCustomize={handleCustomizePress}
      />

    </View>
  );
};

// Create theme-aware styles function
const createThemedStyles = (theme: any) => {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      minHeight: isLandscape ? width : height,
      minWidth: '100%',
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
    flexGrow: 1,
    minHeight: isLandscape ? '100%' : 'auto',
  },
  contentContainer: {
    marginTop: theme.spacing?.md || 16,
  },
  contentHeader: {
    marginTop: theme.spacing?.md || 16,
    marginBottom: theme.spacing?.sm || 12,
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
};

export default ModSpaceProfile;