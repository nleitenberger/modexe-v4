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

const ModSpaceProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { currentModSpace, isLoading } = useSelector(
    (state: RootState) => state.modspace
  );
  const { currentJournal } = useSelector(
    (state: RootState) => state.journal
  );
  const { isPortrait } = useOrientation();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [journalTitle, setJournalTitle] = React.useState('');

  const handleCreateJournal = () => {
    setShowCreateModal(true);
    setJournalTitle(`Journal Entry - ${new Date().toLocaleDateString()}`);
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

  const handleContinueJournal = () => {
    navigation.navigate('JournalEditor');
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
          <Text style={styles.emptyText}>Welcome to ModSpace! 🚀</Text>
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
        {/* Profile Header */}
        <ProfileHeader modspace={currentModSpace} />

        {/* Journal Actions */}
        <View style={styles.journalActionsContainer}>
          {currentJournal && (
            <TouchableOpacity 
              style={[styles.journalActionButton, styles.continueJournalButton]}
              onPress={handleContinueJournal}
            >
              <Text style={styles.journalActionIcon}>📖</Text>
              <View style={styles.journalActionTextContainer}>
                <Text style={styles.journalActionTitle}>Continue "{currentJournal.title}"</Text>
                <Text style={styles.journalActionSubtitle}>
                  {currentJournal.pages.length} pages • Last updated {currentJournal.updatedAt.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.journalActionArrow}>→</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.journalActionButton, styles.createJournalButton]}
            onPress={handleCreateJournal}
          >
            <Text style={styles.journalActionIcon}>📝</Text>
            <View style={styles.journalActionTextContainer}>
              <Text style={styles.journalActionTitle}>
                {currentJournal ? 'Create New Journal Entry' : 'Start Your First Journal'}
              </Text>
              <Text style={styles.journalActionSubtitle}>
                {currentJournal ? 'Begin a fresh story' : 'Start writing your story'}
              </Text>
            </View>
            <Text style={styles.journalActionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentModSpace.stats.totalEntries}
              </Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentModSpace.stats.totalViews}
              </Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentModSpace.stats.followers}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentModSpace.stats.following}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

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
              <View style={styles.entriesGrid}>
                {currentModSpace.sharedEntries.map((entry) => (
                  <TouchableOpacity key={entry.id} style={styles.entryCard}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryExcerpt} numberOfLines={3}>
                      {entry.excerpt}
                    </Text>
                    <View style={styles.entryStats}>
                      <Text style={styles.entryStatText}>❤️ {entry.likes}</Text>
                      <Text style={styles.entryStatText}>👁 {entry.views}</Text>
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

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCreateJournal}
            >
              <Text style={styles.actionButtonText}>📝 New Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📤 Share Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📷 Add Media</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>🎨 Customize</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
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
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  journalActionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  journalActionButton: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  createJournalButton: {
    backgroundColor: '#007AFF',
  },
  continueJournalButton: {
    backgroundColor: '#34C759',
  },
  journalActionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  journalActionTextContainer: {
    flex: 1,
  },
  journalActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  journalActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  journalActionArrow: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
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
});

export default ModSpaceProfile;