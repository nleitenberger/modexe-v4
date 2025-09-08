import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { togglePalette } from '../../store/stickerSlice';
import { shareJournalEntry } from '../../store/modspaceSlice';
import { SharedJournalEntry } from '../../types/modspace.types';
import Icon from '../common/Icon';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';

const JournalToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJournal } = useSelector((state: RootState) => state.journal);
  const { isPaletteExpanded } = useSelector((state: RootState) => state.sticker);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showPostModal, setShowPostModal] = React.useState(false);

  const handleToggleStickers = () => {
    dispatch(togglePalette());
  };

  const handleOpenPostModal = () => {
    if (!currentJournal) return;
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

    // Auto-generate post data using all pages
    const allPageIndices = Array.from({ length: currentJournal.pages.length }, (_, i) => i);
    const firstPageContent = currentJournal.pages[0]?.content.text || '';
    const excerpt = firstPageContent.slice(0, 150) + (firstPageContent.length > 150 ? '...' : '');

    const sharedEntry: SharedJournalEntry = {
      id: `shared-${Date.now()}`,
      journalId: currentJournal.id,
      journalTitle: currentJournal.title,
      pages: allPageIndices,
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
  };

  return (
    <SafeAreaView style={styles.toolbarContainer}>
      <View style={styles.toolbar}>
        {/* Left side - Customize button */}
        <TouchableOpacity
          style={[styles.customizeButton, isPaletteExpanded && styles.activeButton]}
          onPress={handleToggleStickers}
        >
          <Text style={[styles.customizeButtonText, isPaletteExpanded && styles.activeButtonText]}>
            Customize
          </Text>
        </TouchableOpacity>
        
        {/* Right side - Post button */}
        <TouchableOpacity
          style={styles.postButton}
          onPress={handleOpenPostModal}
        >
          <View style={styles.postButtonContent}>
            <Icon name="post" size="sm" color="white" style={{ marginRight: 6 }} />
            <Text style={styles.postButtonText}>Post</Text>
          </View>
        </TouchableOpacity>
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
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  customizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  customizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  activeButtonText: {
    color: 'white',
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