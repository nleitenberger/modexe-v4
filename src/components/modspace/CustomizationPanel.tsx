import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useOrientation } from '../../utils/useOrientation';
import Icon from '../common/Icon';
import ThemeEditor from './editors/ThemeEditor';
import LayoutEditor from './editors/LayoutEditor';
import ColorPicker from './editors/ColorPicker';
import TypographyEditor from './editors/TypographyEditor';
import EffectsEditor from './editors/EffectsEditor';

interface CustomizationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export type CustomizationTab = 'themes' | 'layout' | 'colors' | 'typography' | 'effects';

interface TabInfo {
  id: CustomizationTab;
  name: string;
  icon: string;
  description: string;
}

const CUSTOMIZATION_TABS: TabInfo[] = [
  {
    id: 'themes',
    name: 'Themes',
    icon: 'palette',
    description: 'Choose from preset themes or create custom ones',
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: 'layout',
    description: 'Arrange your journal entries with different layouts',
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: 'color-picker',
    description: 'Customize colors, backgrounds, and gradients',
  },
  {
    id: 'typography',
    name: 'Typography',
    icon: 'text',
    description: 'Adjust fonts, sizes, and text styling',
  },
  {
    id: 'effects',
    name: 'Effects',
    icon: 'effects',
    description: 'Add shadows, animations, and visual effects',
  },
];

const { height: screenHeight } = Dimensions.get('window');

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { currentTheme, previewTheme, setPreviewTheme, applyPreviewTheme, canUndo, canRedo, undoTheme, redoTheme } = useTheme();
  const { isPortrait } = useOrientation();
  
  const [activeTab, setActiveTab] = useState<CustomizationTab>('themes');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(previewTheme !== null);
  }, [previewTheme]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    try {
      if (previewTheme) {
        await applyPreviewTheme();
        setHasUnsavedChanges(false);
      }
      onSave?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customizations');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Changes',
      'Are you sure you want to reset all changes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPreviewTheme(null);
            setHasUnsavedChanges(false);
          },
        },
      ]
    );
  };

  const handleExitConfirm = () => {
    setPreviewTheme(null);
    setHasUnsavedChanges(false);
    setShowExitConfirmation(false);
    onClose();
  };

  const handleExitCancel = () => {
    setShowExitConfirmation(false);
  };

  const renderTabButton = (tab: TabInfo) => {
    const isActive = activeTab === tab.id;
    const theme = previewTheme || currentTheme;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? theme.primaryColor : 'transparent',
            borderRadius: theme.effects.borderRadius,
            marginRight: theme.spacing.small,
          }
        ]}
        onPress={() => setActiveTab(tab.id)}
      >
        <Icon 
          name={tab.icon} 
          size="sm" 
          color={isActive ? theme.backgroundColor : theme.textColor + '80'} 
        />
        <Text style={[
          styles.tabButtonText,
          {
            color: isActive ? theme.backgroundColor : theme.textColor + '80',
            fontSize: theme.font.size.xs,
            fontWeight: isActive ? '600' : '500',
            marginTop: 4,
          }
        ]}>
          {tab.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'themes':
        return <ThemeEditor />;
      case 'layout':
        return <LayoutEditor />;
      case 'colors':
        return <ColorPicker />;
      case 'typography':
        return <TypographyEditor />;
      case 'effects':
        return <EffectsEditor />;
      default:
        return <ThemeEditor />;
    }
  };

  const theme = previewTheme || currentTheme;
  const activeTabInfo = CUSTOMIZATION_TABS.find(tab => tab.id === activeTab);

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={[
          styles.container,
          { backgroundColor: theme.backgroundColor }
        ]}>
          {/* Header */}
          <View style={[
            styles.header,
            {
              backgroundColor: theme.surfaceColor || theme.backgroundColor,
              borderBottomWidth: 1,
              borderBottomColor: theme.textColor + '20',
              paddingHorizontal: theme.spacing.medium,
              paddingVertical: theme.spacing.small,
            }
          ]}>
            {/* Top row with title and actions */}
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: theme.textColor + '10' }
                  ]}
                  onPress={handleClose}
                >
                  <Icon name="close" size="md" color={theme.textColor} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={[
                    styles.title,
                    {
                      color: theme.textColor,
                      fontSize: theme.font.size.xlarge,
                      fontWeight: '700',
                    }
                  ]}>
                    Customize
                  </Text>
                  <Text style={[
                    styles.subtitle,
                    {
                      color: theme.textColor + '99',
                      fontSize: theme.font.size.small,
                    }
                  ]}>
                    {activeTabInfo?.description}
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                {/* Undo/Redo */}
                <View style={styles.undoRedoContainer}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: theme.textColor + '10',
                        opacity: canUndo ? 1 : 0.5,
                      }
                    ]}
                    onPress={undoTheme}
                    disabled={!canUndo}
                  >
                    <Icon name="undo" size="sm" color={theme.textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: theme.textColor + '10',
                        opacity: canRedo ? 1 : 0.5,
                      }
                    ]}
                    onPress={redoTheme}
                    disabled={!canRedo}
                  >
                    <Icon name="redo" size="sm" color={theme.textColor} />
                  </TouchableOpacity>
                </View>

                {/* Reset button */}
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    { 
                      backgroundColor: theme.errorColor || theme.accentColor,
                      opacity: hasUnsavedChanges ? 1 : 0.5,
                    }
                  ]}
                  onPress={handleReset}
                  disabled={!hasUnsavedChanges}
                >
                  <Text style={[
                    styles.resetButtonText,
                    {
                      color: theme.backgroundColor,
                      fontSize: theme.font.size.xs,
                      fontWeight: '600',
                    }
                  ]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tab navigation */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.tabNavigation,
                { paddingTop: theme.spacing.medium }
              ]}
            >
              {CUSTOMIZATION_TABS.map(renderTabButton)}
            </ScrollView>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderActiveTabContent()}
          </View>

          {/* Footer */}
          <View style={[
            styles.footer,
            {
              backgroundColor: theme.surfaceColor || theme.backgroundColor,
              borderTopWidth: 1,
              borderTopColor: theme.textColor + '20',
              paddingHorizontal: theme.spacing.medium,
              paddingVertical: theme.spacing.medium,
            }
          ]}>
            <View style={styles.footerContent}>
              {/* Preview indicator */}
              {hasUnsavedChanges && (
                <View style={styles.previewIndicator}>
                  <View style={[
                    styles.previewDot,
                    { backgroundColor: theme.warningColor || theme.accentColor }
                  ]} />
                  <Text style={[
                    styles.previewText,
                    {
                      color: theme.textColor + '99',
                      fontSize: theme.font.size.xs,
                      marginLeft: theme.spacing.small / 2,
                    }
                  ]}>
                    Preview Mode
                  </Text>
                </View>
              )}

              {/* Save button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: hasUnsavedChanges ? theme.primaryColor : theme.textColor + '20',
                    borderRadius: theme.effects.borderRadius,
                    paddingHorizontal: theme.spacing.large,
                    paddingVertical: theme.spacing.medium,
                  }
                ]}
                onPress={handleSave}
                disabled={!hasUnsavedChanges}
              >
                <Text style={[
                  styles.saveButtonText,
                  {
                    color: hasUnsavedChanges ? theme.backgroundColor : theme.textColor + '60',
                    fontSize: theme.font.size.medium,
                    fontWeight: '600',
                  }
                ]}>
                  {hasUnsavedChanges ? 'Apply Changes' : 'No Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Exit confirmation modal */}
      <Modal
        visible={showExitConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleExitCancel}
      >
        <View style={styles.confirmationOverlay}>
          <View style={[
            styles.confirmationDialog,
            {
              backgroundColor: theme.surfaceColor || theme.backgroundColor,
              borderRadius: theme.effects.borderRadius,
              padding: theme.spacing.large,
            }
          ]}>
            <Icon name="warning" size="xl" color={theme.warningColor || theme.accentColor} style={styles.warningIcon} />
            
            <Text style={[
              styles.confirmationTitle,
              {
                color: theme.textColor,
                fontSize: theme.font.size.large,
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: theme.spacing.small,
              }
            ]}>
              Discard Changes?
            </Text>
            
            <Text style={[
              styles.confirmationMessage,
              {
                color: theme.textColor + '99',
                fontSize: theme.font.size.medium,
                textAlign: 'center',
                marginBottom: theme.spacing.large,
              }
            ]}>
              You have unsaved changes that will be lost if you close the customization panel.
            </Text>

            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={[
                  styles.confirmationButton,
                  styles.cancelButton,
                  {
                    backgroundColor: theme.textColor + '10',
                    borderRadius: theme.effects.borderRadius,
                    paddingHorizontal: theme.spacing.large,
                    paddingVertical: theme.spacing.medium,
                  }
                ]}
                onPress={handleExitCancel}
              >
                <Text style={[
                  styles.cancelButtonText,
                  {
                    color: theme.textColor,
                    fontSize: theme.font.size.medium,
                    fontWeight: '600',
                  }
                ]}>
                  Keep Editing
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmationButton,
                  styles.discardButton,
                  {
                    backgroundColor: theme.errorColor || theme.accentColor,
                    borderRadius: theme.effects.borderRadius,
                    paddingHorizontal: theme.spacing.large,
                    paddingVertical: theme.spacing.medium,
                  }
                ]}
                onPress={handleExitConfirm}
              >
                <Text style={[
                  styles.discardButtonText,
                  {
                    color: theme.backgroundColor,
                    fontSize: theme.font.size.medium,
                    fontWeight: '600',
                  }
                ]}>
                  Discard
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  undoRedoContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resetButtonText: {
    fontWeight: '600',
  },
  tabNavigation: {
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  tabButtonText: {
    textAlign: 'center',
    lineHeight: 14,
  },
  content: {
    flex: 1,
  },
  footer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewText: {
    fontStyle: 'italic',
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    textAlign: 'center',
  },

  // Confirmation modal styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationDialog: {
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  warningIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  confirmationTitle: {
    // Dynamic styles applied inline
  },
  confirmationMessage: {
    lineHeight: 22,
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmationButton: {
    flex: 1,
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
  cancelButton: {
    // Dynamic styles applied inline
  },
  discardButton: {
    // Dynamic styles applied inline
  },
  cancelButtonText: {
    // Dynamic styles applied inline
  },
  discardButtonText: {
    // Dynamic styles applied inline
  },
});

export default CustomizationPanel;