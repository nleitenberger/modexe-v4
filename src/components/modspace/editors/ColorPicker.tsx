import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../common/Icon';

type ColorType = 'primary' | 'secondary' | 'accent' | 'background' | 'text';
type ThemeColorKey = 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' | 'textColor';

const colorTypeToThemeKey: Record<ColorType, ThemeColorKey> = {
  primary: 'primaryColor',
  secondary: 'secondaryColor',
  accent: 'accentColor',
  background: 'backgroundColor',
  text: 'textColor',
};

const ColorPicker: React.FC = () => {
  const { currentTheme, setPreviewTheme, createCustomTheme } = useTheme();
  const [selectedColorType, setSelectedColorType] = useState<ColorType>('primary');

  const handleColorChange = (colorType: ThemeColorKey, newColor: string) => {
    const updatedTheme = createCustomTheme(currentTheme, {
      [colorType]: newColor,
    });
    setPreviewTheme(updatedTheme);
  };

  const getThemeColor = (colorType: ColorType): string => {
    const themeKey = colorTypeToThemeKey[colorType];
    return currentTheme[themeKey];
  };

  const colorPresets = [
    '#FF6B35', '#007AFF', '#34C759', '#FF9500', '#AF52DE',
    '#FF3B30', '#5856D6', '#32D74B', '#FF9F0A', '#BF5AF2',
    '#8E8E93', '#000000', '#FFFFFF', '#F2F2F7', '#1C1C1E',
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.large,
            fontWeight: '700',
          }
        ]}>
          Customize Colors
        </Text>
        <Text style={[
          styles.sectionDescription,
          {
            color: currentTheme.textColor + '99',
            fontSize: currentTheme.font.size.small,
          }
        ]}>
          Personalize your theme colors
        </Text>
      </View>

      {/* Color Type Selection */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Select Color to Edit
        </Text>
        
        <View style={styles.colorTypeGrid}>
          {(['primary', 'secondary', 'accent', 'background', 'text'] as ColorType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.colorTypeButton,
                {
                  backgroundColor: selectedColorType === type ? currentTheme.primaryColor : currentTheme.surfaceColor || currentTheme.backgroundColor,
                  borderRadius: currentTheme.effects.borderRadius,
                  borderWidth: 1,
                  borderColor: currentTheme.textColor + '30',
                }
              ]}
              onPress={() => setSelectedColorType(type)}
            >
              <View style={[
                styles.colorPreview,
                { backgroundColor: getThemeColor(type) }
              ]} />
              <Text style={[
                styles.colorTypeName,
                {
                  color: selectedColorType === type ? currentTheme.backgroundColor : currentTheme.textColor,
                  fontSize: currentTheme.font.size.small,
                  fontWeight: '500',
                }
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Color Presets */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Quick Colors
        </Text>
        
        <View style={styles.colorPresetGrid}>
          {colorPresets.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorPreset,
                { 
                  backgroundColor: color,
                  borderWidth: color === getThemeColor(selectedColorType) ? 3 : 1,
                  borderColor: color === getThemeColor(selectedColorType) ? currentTheme.primaryColor : currentTheme.textColor + '30',
                }
              ]}
              onPress={() => handleColorChange(colorTypeToThemeKey[selectedColorType], color)}
            />
          ))}
        </View>
      </View>

      {/* Custom Color Input */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Custom Color
        </Text>
        
        <View style={styles.customColorContainer}>
          <TextInput
            style={[
              styles.colorInput,
              {
                backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
                color: currentTheme.textColor,
                borderColor: currentTheme.textColor + '30',
                borderRadius: currentTheme.effects.borderRadius,
              }
            ]}
            value={getThemeColor(selectedColorType)}
            onChangeText={(text) => {
              if (text.startsWith('#') && (text.length === 7 || text.length === 4)) {
                handleColorChange(colorTypeToThemeKey[selectedColorType], text);
              }
            }}
            placeholder="#000000"
            placeholderTextColor={currentTheme.textColor + '60'}
          />
          
          <View style={[
            styles.currentColorPreview,
            { 
              backgroundColor: getThemeColor(selectedColorType),
              borderColor: currentTheme.textColor + '30',
            }
          ]} />
        </View>
      </View>

      {/* Coming Soon */}
      <View style={[
        styles.comingSoon,
        {
          backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
          borderRadius: currentTheme.effects.borderRadius,
          padding: currentTheme.spacing.large,
        }
      ]}>
        <Icon name="palette" size="xl" color={currentTheme.textColor + '40'} style={{ marginBottom: currentTheme.spacing.medium }} />
        <Text style={[
          styles.comingSoonTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: currentTheme.spacing.small,
          }
        ]}>
          More Color Options Coming Soon
        </Text>
        <Text style={[
          styles.comingSoonText,
          {
            color: currentTheme.textColor + '80',
            fontSize: currentTheme.font.size.small,
            textAlign: 'center',
          }
        ]}>
          Gradients, patterns, and advanced color tools are in development
        </Text>
      </View>
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
  subsectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  colorTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorTypeName: {
    fontWeight: '500',
  },
  colorPresetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorPreset: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  currentColorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontWeight: '600',
  },
  comingSoonText: {
    lineHeight: 20,
  },
});

export default ColorPicker;