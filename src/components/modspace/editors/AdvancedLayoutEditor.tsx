import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { updateAdvancedLayoutConfig } from '../../../store/modspaceSlice';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrientation } from '../../../utils/useOrientation';
import { 
  SharedJournalEntry, 
  AdvancedLayoutConfig,
  LayoutTemplateType,
  EntryDisplayMode
} from '../../../types/modspace.types';
import { TemplateLayoutEngine } from '../../../services/TemplateLayoutEngine';
import Icon from '../../common/Icon';
import JournalEntryCard from '../cards/JournalEntryCard';

const { width: screenWidth } = Dimensions.get('window');

interface AdvancedLayoutEditorProps {
  visible: boolean;
  onClose: () => void;
  entries: SharedJournalEntry[];
}

const AdvancedLayoutEditor: React.FC<AdvancedLayoutEditorProps> = ({
  visible,
  onClose,
  entries = []
}) => {
  const { currentTheme } = useTheme();
  const { isPortrait } = useOrientation();
  const dispatch = useDispatch();
  const { advancedLayoutConfig } = useSelector((state: RootState) => state.modspace);

  // Current template and settings
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplateType>(
    advancedLayoutConfig?.template || 'magazine'
  );
  const [entryOrder] = useState<string[]>(
    advancedLayoutConfig?.entryOrder || entries.map(e => e.id)
  );
  const [entryDisplayStyles, setEntryDisplayStyles] = useState<{ [entryId: string]: EntryDisplayMode }>(
    advancedLayoutConfig?.entryDisplayStyles || {}
  );
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Calculate preview container dimensions
  const PREVIEW_HEIGHT = 400;
  const PREVIEW_PADDING = 20;
  const previewWidth = screenWidth - (PREVIEW_PADDING * 2);
  
  // Generate layout positions using the template engine with container dimensions
  const layoutPositions = TemplateLayoutEngine.calculateLayout({
    template: selectedTemplate,
    entryOrder,
    entryDisplayStyles,
    isPortrait,
    containerWidth: previewWidth,
    containerHeight: PREVIEW_HEIGHT,
  });

  // Template options
  const templateOptions: LayoutTemplateType[] = ['magazine', 'grid', 'timeline', 'masonry', 'hero'];

  const handleTemplateSelect = (template: LayoutTemplateType) => {
    setSelectedTemplate(template);
  };

  const handleEntrySelect = (entryId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedEntries(prev => 
        prev.includes(entryId) 
          ? prev.filter(id => id !== entryId)
          : [...prev, entryId]
      );
    } else {
      setSelectedEntries([entryId]);
    }
  };

  const handleDisplayModeChange = (mode: EntryDisplayMode) => {
    selectedEntries.forEach(entryId => {
      setEntryDisplayStyles(prev => ({
        ...prev,
        [entryId]: mode
      }));
    });
  };


  const handleSave = () => {
    const config: AdvancedLayoutConfig = {
      template: selectedTemplate,
      entryOrder,
      entryDisplayStyles,
      isAdvancedMode: true,
    };

    dispatch(updateAdvancedLayoutConfig(config));
    onClose();
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Any unsaved changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onClose }
      ]
    );
  };

  const getTemplateIcon = (template: LayoutTemplateType) => {
    const info = TemplateLayoutEngine.getTemplateInfo(template);
    return info.icon as any;
  };

  const getDisplayModeForEntry = (entryId: string): EntryDisplayMode => {
    return entryDisplayStyles[entryId] || 'card';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: currentTheme.textColor + '20' }]}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[styles.headerButton, { color: currentTheme.textColor }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.textColor }]}>
            Custom Layout
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.headerButton, { color: currentTheme.primaryColor }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Template Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
              Choose Template
            </Text>
            <Text style={[styles.sectionDescription, { color: currentTheme.textColor + '99' }]}>
              Select a layout template to customize
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateSelector}
            >
              {templateOptions.map((template) => {
                const templateInfo = TemplateLayoutEngine.getTemplateInfo(template);
                const isSelected = selectedTemplate === template;
                
                return (
                  <TouchableOpacity
                    key={template}
                    style={[
                      styles.templateOption,
                      {
                        backgroundColor: isSelected 
                          ? currentTheme.primaryColor + '20' 
                          : currentTheme.surfaceColor || currentTheme.backgroundColor,
                        borderColor: isSelected ? currentTheme.primaryColor : currentTheme.textColor + '30',
                        borderRadius: currentTheme.effects.borderRadius,
                      }
                    ]}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <Icon 
                      name={getTemplateIcon(template)} 
                      size="lg" 
                      color={isSelected ? currentTheme.primaryColor : currentTheme.textColor + '80'} 
                    />
                    <Text style={[
                      styles.templateName,
                      { 
                        color: isSelected ? currentTheme.primaryColor : currentTheme.textColor,
                        fontSize: currentTheme.font.size.small,
                        fontWeight: isSelected ? '700' : '600'
                      }
                    ]}>
                      {templateInfo.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Layout Preview */}
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
                Layout Preview
              </Text>
              {selectedEntries.length > 0 && (
                <Text style={[styles.selectedCount, { color: currentTheme.primaryColor }]}>
                  {selectedEntries.length} selected
                </Text>
              )}
            </View>
            
            <View style={[
              styles.previewContainer,
              {
                backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor + 'CC',
                borderRadius: currentTheme.effects.borderRadius,
                width: previewWidth,
                height: PREVIEW_HEIGHT,
              }
            ]}>
              {layoutPositions.map((position) => {
                const entry = entries.find(e => e.id === position.entryId);
                if (!entry) return null;

                const isSelected = selectedEntries.includes(entry.id);
                const displayMode = getDisplayModeForEntry(entry.id);

                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[
                      styles.previewEntry,
                      {
                        left: position.x,
                        top: position.y,
                        width: position.width,
                        height: position.height,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: currentTheme.primaryColor,
                        borderRadius: currentTheme.effects.borderRadius,
                      }
                    ]}
                    onPress={() => handleEntrySelect(entry.id, false)}
                    onLongPress={() => handleEntrySelect(entry.id, true)}
                  >
                    <JournalEntryCard
                      entry={entry}
                      config={{
                        cardStyle: displayMode === 'compact' ? 'minimal' : 'elevated',
                        showCaptions: displayMode !== 'compact',
                        showStats: displayMode === 'featured',
                        aspectRatio: displayMode === 'featured' ? 'landscape' : 'dynamic',
                      }}
                      theme={currentTheme}
                      width={position.width}
                      aspectRatio="dynamic"
                    />
                    
                    {isSelected && (
                      <View style={[
                        styles.selectedOverlay,
                        { backgroundColor: currentTheme.primaryColor + '40' }
                      ]}>
                        <Icon name="check" size="md" color={currentTheme.primaryColor} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Display Controls */}
          {selectedEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
                Display Options
              </Text>
              <Text style={[styles.sectionDescription, { color: currentTheme.textColor + '99' }]}>
                Choose how selected entries appear
              </Text>
              
              <View style={styles.displayModeSelector}>
                {['compact', 'card', 'featured'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.displayModeOption,
                      {
                        backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
                        borderColor: currentTheme.textColor + '30',
                        borderRadius: currentTheme.effects.borderRadius,
                      }
                    ]}
                    onPress={() => handleDisplayModeChange(mode as EntryDisplayMode)}
                  >
                    <Text style={[
                      styles.displayModeText,
                      {
                        color: currentTheme.textColor,
                        fontSize: currentTheme.font.size.small,
                      }
                    ]}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                    <Text style={[
                      styles.displayModeDescription,
                      {
                        color: currentTheme.textColor + '80',
                        fontSize: currentTheme.font.size.xs,
                      }
                    ]}>
                      {mode === 'compact' && 'Title only'}
                      {mode === 'card' && 'Title + excerpt'}
                      {mode === 'featured' && 'Large showcase'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Usage Instructions */}
          <View style={[styles.section, styles.instructionsSection]}>
            <Text style={[styles.instructionsTitle, { color: currentTheme.textColor }]}>
              How to Customize
            </Text>
            <Text style={[styles.instructionsText, { color: currentTheme.textColor + '99' }]}>
              • Tap entries to select them{'\n'}
              • Use display options to change how entries appear{'\n'}  
              • Switch templates to try different layouts{'\n'}
              • Save when you're happy with your custom layout
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    borderBottomWidth: 1,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  
  // Template Selector
  templateSelector: {
    paddingHorizontal: 4,
  },
  templateOption: {
    padding: 16,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
  },
  templateName: {
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Preview
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  previewEntry: {
    position: 'absolute',
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Display Controls
  displayModeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  displayModeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  displayModeText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  displayModeDescription: {
    textAlign: 'center',
  },
  
  // Instructions
  instructionsSection: {
    marginBottom: 60, // Extra bottom padding
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default AdvancedLayoutEditor;