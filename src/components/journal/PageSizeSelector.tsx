import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateJournalPageSize } from '../../store/journalSlice';
import { PageSize } from '../../types/journal.types';
import { getPageSizeDisplayName, getPageSizeDescription } from '../../utils/pageSize';

interface PageSizeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { currentJournal } = useSelector((state: RootState) => state.journal);
  
  const currentPageSize = currentJournal?.pageSize || PageSize.JOURNAL;

  const handlePageSizeSelect = (pageSize: PageSize) => {
    if (currentJournal) {
      dispatch(updateJournalPageSize({
        id: currentJournal.id,
        pageSize,
      }));
    }
    onClose();
  };

  const renderPageSizeOption = (pageSize: PageSize) => {
    const isSelected = currentPageSize === pageSize;
    const aspectRatio = pageSize === PageSize.POCKETBOOK ? 0.75 : 
                       pageSize === PageSize.JOURNAL ? 0.8 : 0.77;
    
    return (
      <TouchableOpacity
        key={pageSize}
        style={[styles.option, isSelected && styles.selectedOption]}
        onPress={() => handlePageSizeSelect(pageSize)}
      >
        <View style={styles.optionContent}>
          {/* Visual preview of page size */}
          <View style={[
            styles.pagePreview,
            {
              aspectRatio,
              backgroundColor: isSelected ? '#007AFF' : '#f0f0f0',
            }
          ]}>
            <View style={[
              styles.pagePreviewLines,
              { borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }
            ]} />
          </View>
          
          {/* Page size info */}
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, isSelected && styles.selectedText]}>
              {getPageSizeDisplayName(pageSize)}
            </Text>
            <Text style={[styles.optionDescription, isSelected && styles.selectedDescription]}>
              {getPageSizeDescription(pageSize)}
            </Text>
          </View>
          
          {/* Selected indicator */}
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIcon}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Page Size</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Select the page format that works best for your writing style
          </Text>
          
          <View style={styles.options}>
            {Object.values(PageSize).map(renderPageSizeOption)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  options: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 16,
    backgroundColor: '#fafafa',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pagePreview: {
    width: 40,
    height: 50,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  pagePreviewLines: {
    position: 'absolute',
    top: 8,
    left: 6,
    right: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedText: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  selectedDescription: {
    color: '#0056b3',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PageSizeSelector;