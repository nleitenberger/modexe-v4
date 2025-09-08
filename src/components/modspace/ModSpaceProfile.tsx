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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import Icon from '../common/Icon';

const ModSpaceProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { currentModSpace, isLoading } = useSelector(
    (state: RootState) => state.modspace
  );
  const { isPortrait } = useOrientation();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [journalTitle, setJournalTitle] = React.useState('');
  const [showNewEntryOptions, setShowNewEntryOptions] = React.useState(false);

  const handleNewEntryPress = () => {
    setShowNewEntryOptions(true);
  };

  const handleCreateJournal = () => {
    setShowNewEntryOptions(false);
    setShowCreateModal(true);
    setJournalTitle(`Journal Entry - ${new Date().toLocaleDateString()}`);
  };

  const handleCreateMedia = () => {
    setShowNewEntryOptions(false);
    // TODO: Implement media creation functionality
    Alert.alert('Media Post', 'Media post creation coming soon!');
  };

  const handleCancelNewEntry = () => {
    setShowNewEntryOptions(false);
  };

  const handleConfirmCreate = () => {
    if (!journalTitle.trim()) {
      Alert.alert('Error', 'Please enter a journal title');
      return;
    }
    dispatch(createJournal({ title: journalTitle.trim() }));
    setShowCreateModal(false);
    setJournalTitle('');
    // Navigate to Journal Editor
    navigation.navigate('JournalEditor');
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setJournalTitle('');
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ModSpace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentModSpace) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>Welcome to ModSpace!</Text>
            <Icon name="rocket" size="md" color="#007AFF" style={{ marginLeft: 8 }} />
          </View>
          <Text style={styles.emptySubText}>
            Your personal profile and content hub
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => dispatch(createModSpace({
              userId: 'user-1',
              username: 'journaler',
              displayName: 'My Journal Space',
            }))}
          >
            <Text style={styles.createButtonText}>Create Your ModSpace</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isPortrait ? 16 : 32 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with integrated stats */}
        <ProfileHeader modspace={currentModSpace} />

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNewEntryPress}
          >
            <View style={styles.actionButtonContent}>
              <Icon name="new-entry" size="sm" color="#333" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>New Entry</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Icon name="share" size="sm" color="#333" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>Share Entry</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Icon name="customize" size="sm" color="#333" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>Customize</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          

          {/* Shared Entries Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Shared Journal Entries</Text>
            {currentModSpace.sharedEntries.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  No entries shared yet
                </Text>
                <Text style={styles.emptySectionSubText}>
                  Share your favorite journal pages to showcase your writing
                </Text>
              </View>
            ) : (
              <View style={[
                styles.entriesGrid,
                isPortrait ? styles.entriesVertical : styles.entriesHorizontal
              ]}>
                {currentModSpace.sharedEntries.map((entry) => (
                  <TouchableOpacity 
                    key={entry.id} 
                    style={[
                      styles.entryCard,
                      isPortrait ? styles.entryCardVertical : styles.entryCardHorizontal
                    ]}
                  >
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryExcerpt} numberOfLines={3}>
                      {entry.excerpt}
                    </Text>
                    <View style={styles.entryStats}>
                      <View style={styles.entryStatContainer}>
                        <Icon name="heart" size="xs" color="#FF3B30" style={{ marginRight: 4 }} />
                        <Text style={styles.entryStatText}>{entry.likes}</Text>
                      </View>
                      <View style={styles.entryStatContainer}>
                        <Icon name="discover" size="xs" color="#999" style={{ marginRight: 4 }} />
                        <Text style={styles.entryStatText}>{entry.views}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Media Gallery Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Media Gallery</Text>
            {currentModSpace.mediaGallery.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  No media uploaded yet
                </Text>
                <Text style={styles.emptySectionSubText}>
                  Add photos and videos to personalize your ModSpace
                </Text>
              </View>
            ) : (
              <View style={styles.mediaGrid}>
                {/* Media items will be rendered here */}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Entry</Text>
            <Text style={styles.modalSubtitle}>
              Choose the type of content you'd like to create
            </Text>
            
            <View style={styles.entryOptionsContainer}>
              <TouchableOpacity 
                style={styles.entryOption}
                onPress={handleCreateJournal}
              >
                <Icon name="edit" size="xl" color="#007AFF" />
                <Text style={styles.entryOptionTitle}>Journal Entry</Text>
                <Text style={styles.entryOptionDescription}>
                  Write and design with text and stickers
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.entryOption}
                onPress={handleCreateMedia}
              >
                <Icon name="media" size="xl" color="#34C759" />
                <Text style={styles.entryOptionTitle}>Media Post</Text>
                <Text style={styles.entryOptionDescription}>
                  Share photos, videos, or other media
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={handleCancelNewEntry}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Journal Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelCreate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Journal Entry</Text>
            <Text style={styles.modalSubtitle}>
              Give your journal entry a meaningful title
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={journalTitle}
              onChangeText={setJournalTitle}
              placeholder="Enter journal title..."
              placeholderTextColor="#999"
              autoFocus
              selectTextOnFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCancelCreate}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCreateButton]}
                onPress={handleConfirmCreate}
              >
                <Text style={styles.modalCreateText}>Create & Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  contentContainer: {
    marginTop: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
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
  emptySectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySectionSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  entriesGrid: {
    gap: 16,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryCardVertical: {
    width: '100%',
    marginBottom: 16,
  },
  entryCardHorizontal: {
    width: '48%',
    marginBottom: 16,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  entryExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  entryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  entryStatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryStatText: {
    fontSize: 12,
    color: '#999',
  },
  mediaGrid: {
    backgroundColor: 'white',
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
  modalCreateButton: {
    backgroundColor: '#007AFF',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  entryOptionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  entryOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  entryOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  entryOptionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ModSpaceProfile;