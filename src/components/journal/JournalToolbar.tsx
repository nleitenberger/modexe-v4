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

const JournalToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal, currentSpreadIndex, currentPageIndex } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);
  const { isPortrait } = useOrientation();
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

  const handlePostToModSpace = () => {
    if (!currentJournal || !postTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }

    if (selectedPages.length === 0) {
      Alert.alert('Error', 'Please select at least one page to share');
      return;
    }

    // Create excerpt from selected pages if not provided
    let finalExcerpt = postExcerpt.trim();
    if (!finalExcerpt) {
      const firstPageContent = currentJournal.pages[selectedPages[0]]?.content.text || '';
      finalExcerpt = firstPageContent.slice(0, 150) + (firstPageContent.length > 150 ? '...' : '');
    }

    const sharedEntry: SharedJournalEntry = {
      id: `shared-${Date.now()}`,
      journalId: currentJournal.id,
      journalTitle: currentJournal.title,
      pages: selectedPages,
      title: postTitle.trim(),
      excerpt: finalExcerpt,
      shareDate: new Date(),
      visibility: postVisibility,
      likes: 0,
      views: 0,
      comments: [],
      tags: [],
    };

    dispatch(shareJournalEntry(sharedEntry));
    
    // Reset modal state
    setShowPostModal(false);
    setPostTitle('');
    setPostExcerpt('');
    setSelectedPages([]);
    setPostVisibility('public');
    
    Alert.alert('Success', 'Your journal entry has been posted to your ModSpace!');
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
            <Text style={styles.postButtonText}>📤 Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolButton, isPaletteExpanded && styles.activeButton]}
            onPress={handleToggleStickers}
          >
            <Text style={styles.toolButtonText}>🎨</Text>
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
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={postTitle}
                  onChangeText={setPostTitle}
                  placeholder="Enter post title..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Excerpt (optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={postExcerpt}
                  onChangeText={setPostExcerpt}
                  placeholder="Brief description of your entry..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Pages to Share</Text>
                <View style={styles.pageSelector}>
                  {currentJournal?.pages.map((page, index) => (
                    <TouchableOpacity
                      key={page.id}
                      style={[
                        styles.pageOption,
                        selectedPages.includes(index) && styles.selectedPageOption,
                      ]}
                      onPress={() => togglePageSelection(index)}
                    >
                      <Text style={[
                        styles.pageOptionText,
                        selectedPages.includes(index) && styles.selectedPageOptionText,
                      ]}>
                        Page {index + 1}
                      </Text>
                    </TouchableOpacity>
                  )) || []}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Visibility</Text>
                <View style={styles.visibilitySelector}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      postVisibility === 'public' && styles.selectedVisibilityOption,
                    ]}
                    onPress={() => setPostVisibility('public')}
                  >
                    <Text style={[
                      styles.visibilityOptionText,
                      postVisibility === 'public' && styles.selectedVisibilityOptionText,
                    ]}>
                      🌍 Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      postVisibility === 'private' && styles.selectedVisibilityOption,
                    ]}
                    onPress={() => setPostVisibility('private')}
                  >
                    <Text style={[
                      styles.visibilityOptionText,
                      postVisibility === 'private' && styles.selectedVisibilityOptionText,
                    ]}>
                      🔒 Private
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCancelPost}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPostButton]}
                onPress={handlePostToModSpace}
              >
                <Text style={styles.modalPostText}>Post to ModSpace</Text>
              </TouchableOpacity>
            </View>
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
});

export default JournalToolbar;