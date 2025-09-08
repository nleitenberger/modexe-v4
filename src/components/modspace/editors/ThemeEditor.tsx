import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { DEFAULT_THEMES } from '../../../types/modspace.types';
import Icon from '../../common/Icon';

const ThemeEditor: React.FC = () => {
  const { 
    currentTheme, 
    availableThemes, 
    setPreviewTheme, 
    previewTheme,
    createCustomTheme,
    saveCustomTheme 
  } = useTheme();

  const theme = previewTheme || currentTheme;

  const handleThemeSelect = (selectedTheme: any) => {
    setPreviewTheme(selectedTheme);
  };

  const handleCreateCustomTheme = () => {
    const customTheme = createCustomTheme(currentTheme, {
      name: `Custom Theme ${Date.now()}`,
      primaryColor: '#FF6B35',
    });
    
    setPreviewTheme(customTheme);
  };

  const renderThemePreset = (themeKey: string, themeData: any) => {
    const isSelected = (previewTheme?.id || currentTheme.id) === themeData.id;
    
    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themePreset,
          {
            backgroundColor: themeData.backgroundColor,
            borderColor: isSelected ? theme.primaryColor : themeData.textColor + '30',
            borderWidth: isSelected ? 3 : 1,
          }
        ]}
        onPress={() => handleThemeSelect(themeData)}
      >
        {/* Theme preview colors */}
        <View style={styles.colorPreview}>
          <View style={[styles.colorSwatch, { backgroundColor: themeData.primaryColor }]} />
          <View style={[styles.colorSwatch, { backgroundColor: themeData.secondaryColor }]} />
          <View style={[styles.colorSwatch, { backgroundColor: themeData.accentColor }]} />
        </View>
        
        {/* Theme name */}
        <Text style={[
          styles.themeName,
          {
            color: themeData.textColor,
            fontSize: theme.font.size.small,
            fontWeight: '600',
          }
        ]}>
          {themeData.name}
        </Text>

        {/* Selected indicator */}
        {isSelected && (
          <View style={[
            styles.selectedIndicator,
            { backgroundColor: theme.primaryColor }
          ]}>
            <Icon name="check" size="xs" color={theme.backgroundColor} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          {
            color: theme.textColor,
            fontSize: theme.font.size.large,
            fontWeight: '700',
          }
        ]}>
          Choose a Theme
        </Text>
        <Text style={[
          styles.sectionDescription,
          {
            color: theme.textColor + '99',
            fontSize: theme.font.size.small,
          }
        ]}>
          Select from our curated theme presets or create your own custom theme
        </Text>
      </View>

      {/* Theme Presets */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: theme.textColor,
            fontSize: theme.font.size.medium,
            fontWeight: '600',
            marginBottom: theme.spacing.medium,
          }
        ]}>
          Preset Themes
        </Text>

        <View style={styles.themesGrid}>
          {Object.entries(DEFAULT_THEMES).map(([key, themeData]) =>
            renderThemePreset(key, themeData)
          )}
        </View>
      </View>

      {/* Custom Themes */}
      <View style={styles.section}>
        <View style={styles.subsectionHeader}>
          <Text style={[
            styles.subsectionTitle,
            {
              color: theme.textColor,
              fontSize: theme.font.size.medium,
              fontWeight: '600',
            }
          ]}>
            Custom Themes
          </Text>
          
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: theme.primaryColor,
                borderRadius: theme.effects.borderRadius,
                paddingHorizontal: theme.spacing.medium,
                paddingVertical: theme.spacing.small,
              }
            ]}
            onPress={handleCreateCustomTheme}
          >
            <Icon name="plus" size="xs" color={theme.backgroundColor} style={{ marginRight: 4 }} />
            <Text style={[
              styles.createButtonText,
              {
                color: theme.backgroundColor,
                fontSize: theme.font.size.xs,
                fontWeight: '600',
              }
            ]}>
              Create Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom themes list */}
        <View style={styles.themesGrid}>
          {Object.entries(availableThemes)
            .filter(([key]) => !Object.keys(DEFAULT_THEMES).includes(key))
            .map(([key, themeData]) => renderThemePreset(key, themeData))
          }
        </View>

        {Object.keys(availableThemes).filter(key => !Object.keys(DEFAULT_THEMES).includes(key)).length === 0 && (
          <View style={[
            styles.emptyState,
            {
              backgroundColor: theme.surfaceColor || theme.backgroundColor,
              borderRadius: theme.effects.borderRadius,
              padding: theme.spacing.large,
            }
          ]}>
            <Icon name="palette" size="xl" color={theme.textColor + '40'} style={{ marginBottom: theme.spacing.medium }} />
            <Text style={[
              styles.emptyStateText,
              {
                color: theme.textColor + '80',
                fontSize: theme.font.size.medium,
                textAlign: 'center',
                marginBottom: theme.spacing.small,
              }
            ]}>
              No Custom Themes Yet
            </Text>
            <Text style={[
              styles.emptyStateSubtext,
              {
                color: theme.textColor + '60',
                fontSize: theme.font.size.small,
                textAlign: 'center',
              }
            ]}>
              Create your first custom theme to get started
            </Text>
          </View>
        )}
      </View>

      {/* Theme Info */}
      {(previewTheme || currentTheme) && (
        <View style={styles.section}>
          <Text style={[
            styles.subsectionTitle,
            {
              color: theme.textColor,
              fontSize: theme.font.size.medium,
              fontWeight: '600',
              marginBottom: theme.spacing.medium,
            }
          ]}>
            Current Theme Details
          </Text>
          
          <View style={[
            styles.themeDetails,
            {
              backgroundColor: theme.surfaceColor || theme.backgroundColor,
              borderRadius: theme.effects.borderRadius,
              padding: theme.spacing.medium,
            }
          ]}>
            <Text style={[
              styles.themeDetailsName,
              {
                color: theme.textColor,
                fontSize: theme.font.size.medium,
                fontWeight: '700',
                marginBottom: theme.spacing.small,
              }
            ]}>
              {theme.name}
            </Text>
            
            <View style={styles.colorDetails}>
              <View style={styles.colorDetailItem}>
                <Text style={[
                  styles.colorLabel,
                  {
                    color: theme.textColor + '99',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  Primary
                </Text>
                <View style={[
                  styles.colorSwatch,
                  styles.detailColorSwatch,
                  { backgroundColor: theme.primaryColor }
                ]} />
                <Text style={[
                  styles.colorValue,
                  {
                    color: theme.textColor + '80',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  {theme.primaryColor}
                </Text>
              </View>

              <View style={styles.colorDetailItem}>
                <Text style={[
                  styles.colorLabel,
                  {
                    color: theme.textColor + '99',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  Secondary
                </Text>
                <View style={[
                  styles.colorSwatch,
                  styles.detailColorSwatch,
                  { backgroundColor: theme.secondaryColor }
                ]} />
                <Text style={[
                  styles.colorValue,
                  {
                    color: theme.textColor + '80',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  {theme.secondaryColor}
                </Text>
              </View>

              <View style={styles.colorDetailItem}>
                <Text style={[
                  styles.colorLabel,
                  {
                    color: theme.textColor + '99',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  Accent
                </Text>
                <View style={[
                  styles.colorSwatch,
                  styles.detailColorSwatch,
                  { backgroundColor: theme.accentColor }
                ]} />
                <Text style={[
                  styles.colorValue,
                  {
                    color: theme.textColor + '80',
                    fontSize: theme.font.size.xs,
                  }
                ]}>
                  {theme.accentColor}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    lineHeight: 20,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
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
  createButtonText: {
    fontWeight: '600',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themePreset: {
    width: '47%',
    minWidth: 140,
    aspectRatio: 1.2,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  themeName: {
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontWeight: '600',
  },
  emptyStateSubtext: {
    // Dynamic styles applied inline
  },
  themeDetails: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeDetailsName: {
    fontWeight: '700',
  },
  colorDetails: {
    gap: 12,
  },
  colorDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorLabel: {
    minWidth: 60,
    fontWeight: '500',
  },
  detailColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  colorValue: {
    fontFamily: 'monospace',
    fontWeight: '500',
  },
});

export default ThemeEditor;