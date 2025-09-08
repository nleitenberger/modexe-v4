import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { nextSpread, prevSpread, nextPage, prevPage, addPage } from '../../store/journalSlice';
import { togglePalette } from '../../store/stickerSlice';
import { shareJournalEntry } from '../../store/modspaceSlice';
import { SharedJournalEntry } from '../../types/modspace.types';
import { useOrientation } from '../../utils/useOrientation';
import Icon from '../common/Icon';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';

const JournalToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal, currentSpreadIndex, currentPageIndex } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);
  const { isPortrait } = useOrientation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showPostModal, setShowPostModal] = React.useState(false);
  const [postTitle, setPostTitle] = React.useState('');
  const [postExcerpt, setPostExcerpt] = React.useState('');
  const [selectedPages, setSelectedPages] = React.useState<number[]>([]);
  const [postVisibility, setPostVisibility] = React.useState<'public' | 'private'>('public');

  const totalPages = currentJournal ? currentJournal.pages.length : 0;
  const totalSpreads = Math.ceil(totalPages / 2);
  
  const canGoPrev = isPortrait ? currentPageIndex > 0 : currentSpreadIndex > 0;
  const canGoNext = isPortrait ? currentPageIndex < totalPages - 1 : currentSpreadIndex < totalSpreads - 1;

  // Calculate current page numbers for display
  const getCurrentPageDisplay = () => {
    if (isPortrait) {
      // Portrait mode: show single page number based on currentPageIndex
      const currentPageNumber = currentPageIndex + 1;
      return `Page ${currentPageNumber} of ${totalPages}`;
    } else {
      // Landscape mode: show spread pages based on currentSpreadIndex
      const leftPageNumber = currentSpreadIndex * 2 + 1;
      const rightPageNumber = Math.min(leftPageNumber + 1, totalPages);
      if (leftPageNumber === rightPageNumber) {
        return `Page ${leftPageNumber}`;
      }
      return `Pages ${leftPageNumber}-${rightPageNumber}`;
    }
  };

  const handlePrevSpread = () => {
    if (canGoPrev) {
      if (isPortrait) {
        dispatch(prevPage());
      } else {
        dispatch(prevSpread());
      }
    }
  };

  const handleNextSpread = () => {
    if (canGoNext) {
      if (isPortrait) {
        dispatch(nextPage());
      } else {
        dispatch(nextSpread());
      }
    } else {
      // Add new pages if at the end
      if (isPortrait) {
        dispatch(addPage());
        dispatch(nextPage());
      } else {
        dispatch(addPage());
        dispatch(addPage());
        dispatch(nextSpread());
      }
    }
  };

  const handleToggleStickers = () => {
    dispatch(togglePalette());
  };

  const handleOpenPostModal = () => {
    if (!currentJournal) return;
    
    // Initialize with current journal title and current page selection
    setPostTitle(currentJournal.title);
    setPostExcerpt('');
    setSelectedPages(isPortrait ? [currentPageIndex] : [currentSpreadIndex * 2, currentSpreadIndex * 2 + 1]);
    setShowPostModal(true);
  };

  const handlePostPublic = () => {
    handlePostToModSpace('public');
  };

  const handlePostPrivate = () => {
    handlePostToModSpace('private');
  };

  const handlePostToModSpace = (visibility: 'public' | 'private') => {
    if (!currentJournal) {
      Alert.alert('Error', 'No journal to post');
      return;
    }

    // Auto-generate post data
    const currentPages = isPortrait ? [currentPageIndex] : [currentSpreadIndex * 2, currentSpreadIndex * 2 + 1];
    const firstPageContent = currentJournal.pages[currentPages[0]]?.content.text || '';
    const excerpt = firstPageContent.slice(0, 150) + (firstPageContent.length > 150 ? '...' : '');

    const sharedEntry: SharedJournalEntry = {
      id: `shared-${Date.now()}`,
      journalId: currentJournal.id,
      journalTitle: currentJournal.title,
      pages: currentPages.filter(pageIndex => pageIndex < currentJournal.pages.length),
      title: currentJournal.title,
      excerpt: excerpt || 'A new journal entry',
      shareDate: new Date(),
      visibility,
      likes: 0,
      views: 0,
      comments: [],
      tags: [],
    };

    dispatch(shareJournalEntry(sharedEntry));
    
    // Close modal and navigate back to ModSpace
    setShowPostModal(false);
    navigation.navigate('MainTabs');
    
    // Show success message
    const visibilityText = visibility === 'public' ? 'publicly' : 'privately';
    Alert.alert('Success', `Your journal entry has been posted ${visibilityText} to your ModSpace!`);
  };

  const handleCancelPost = () => {
    setShowPostModal(false);
    setPostTitle('');
    setPostExcerpt('');
    setSelectedPages([]);
    setPostVisibility('public');
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev => 
      prev.includes(pageIndex) 
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  return (
    <SafeAreaView style={styles.toolbarContainer}>
      <View style={styles.toolbar}>
        {/* Navigation controls */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrev && styles.disabledButton]}
            onPress={handlePrevSpread}
            disabled={!canGoPrev}
          >
            <Text style={[styles.navButtonText, !canGoPrev && styles.disabledText]}>
              ← Prev
            </Text>
          </TouchableOpacity>

          <Text style={styles.spreadIndicator}>
            {getCurrentPageDisplay()}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextSpread}
          >
            <Text style={styles.navButtonText}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tool controls */}
        <View style={styles.toolSection}>
          <TouchableOpacity
            style={styles.postButton}
            onPress={handleOpenPostModal}
          >
            <View style={styles.postButtonContent}>
              <Icon name="post" size="sm" color="white" style={{ marginRight: 6 }} />
              <Text style={styles.postButtonText}>Post</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolButton, isPaletteExpanded && styles.activeButton]}
            onPress={handleToggleStickers}
          >
            <Icon name="palette" size="md" color={isPaletteExpanded ? "white" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post to ModSpace Modal */}
      <Modal
        visible={showPostModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelPost}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Post to ModSpace</Text>
            <Text style={styles.modalSubtitle}>
              Choose how you'd like to share your journal entry
            </Text>
            
            <View style={styles.visibilityButtonsContainer}>
              <TouchableOpacity 
                style={[styles.visibilityButton, styles.publicButton]}
                onPress={handlePostPublic}
              >
                <Icon name="public" size="xl" color="white" />
                <Text style={styles.visibilityButtonTitle}>Post Public</Text>
                <Text style={styles.visibilityButtonDescription}>
                  Everyone can see this entry
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.visibilityButton, styles.privateButton]}
                onPress={handlePostPrivate}
              >
                <Icon name="private" size="xl" color="white" />
                <Text style={styles.visibilityButtonTitle}>Post Private</Text>
                <Text style={styles.visibilityButtonDescription}>
                  Only you can see this entry
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={handleCancelPost}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  disabledButton: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  disabledText: {
    color: '#999',
  },
  spreadIndicator: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 12,
    minWidth: 80,
    textAlign: 'center',
    fontWeight: '500',
  },
  toolSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  toolButtonText: {
    fontSize: 24,
  },
  postButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  visibilityButtonsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  visibilityButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  publicButton: {
    backgroundColor: '#007AFF',
  },
  privateButton: {
    backgroundColor: '#34C759',
  },
  visibilityButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
  },
  visibilityButtonDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  selectedPageOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pageOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPageOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  visibilitySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  selectedVisibilityOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  visibilityOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedVisibilityOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalPostButton: {
    backgroundColor: '#34C759',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalPostText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  postButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default JournalToolbar;