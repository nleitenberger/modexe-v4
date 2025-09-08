import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../common/Icon';

const TypographyEditor: React.FC = () => {
  const { currentTheme, setPreviewTheme, createCustomTheme } = useTheme();

  const handleFontChange = (property: string, value: any) => {
    const updatedTheme = createCustomTheme(currentTheme, {
      font: {
        ...currentTheme.font,
        [property]: value,
      },
    });
    setPreviewTheme(updatedTheme);
  };

  const fontFamilies = [
    { id: 'system', name: 'System Default', description: 'Native system font' },
    { id: 'serif', name: 'Serif', description: 'Traditional serif typeface' },
    { id: 'monospace', name: 'Monospace', description: 'Fixed-width coding font' },
  ];

  const fontWeights = [
    { id: 'light', name: 'Light', weight: '300' },
    { id: 'normal', name: 'Regular', weight: '400' },
    { id: 'medium', name: 'Medium', weight: '500' },
    { id: 'semibold', name: 'Semi Bold', weight: '600' },
    { id: 'bold', name: 'Bold', weight: '700' },
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
          Typography Settings
        </Text>
        <Text style={[
          styles.sectionDescription,
          {
            color: currentTheme.textColor + '99',
            fontSize: currentTheme.font.size.small,
          }
        ]}>
          Customize fonts, sizes, and text styling
        </Text>
      </View>

      {/* Preview */}
      <View style={[
        styles.previewSection,
        {
          backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
          borderRadius: currentTheme.effects.borderRadius,
          padding: currentTheme.spacing.large,
        }
      ]}>
        <Text style={[
          styles.previewTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.xlarge,
            fontWeight: currentTheme.font.weight === 'bold' ? '700' : '600',
            fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
            lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.xlarge,
            letterSpacing: currentTheme.font.letterSpacing,
            marginBottom: currentTheme.spacing.medium,
          }
        ]}>
          Sample Journal Title
        </Text>
        
        <Text style={[
          styles.previewText,
          {
            color: currentTheme.textColor + 'CC',
            fontSize: currentTheme.font.size.medium,
            fontFamily: currentTheme.font.family === 'serif' ? 'serif' : 'system',
            lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.medium,
            letterSpacing: currentTheme.font.letterSpacing * 0.5,
          }
        ]}>
          This is how your journal entries will look with the current typography settings. You can see how the font family, weight, and spacing affect readability.
        </Text>
      </View>

      {/* Font Family */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Font Family
        </Text>
        
        <View style={styles.optionsGrid}>
          {fontFamilies.map((font) => (
            <TouchableOpacity
              key={font.id}
              style={[
                styles.option,
                {
                  backgroundColor: currentTheme.font.family === font.id ? currentTheme.primaryColor : currentTheme.surfaceColor || currentTheme.backgroundColor,
                  borderRadius: currentTheme.effects.borderRadius,
                  borderWidth: 1,
                  borderColor: currentTheme.textColor + '30',
                }
              ]}
              onPress={() => handleFontChange('family', font.id)}
            >
              <Text style={[
                styles.optionTitle,
                {
                  color: currentTheme.font.family === font.id ? currentTheme.backgroundColor : currentTheme.textColor,
                  fontSize: currentTheme.font.size.medium,
                  fontWeight: '600',
                  fontFamily: font.id === 'serif' ? 'serif' : font.id === 'monospace' ? 'monospace' : 'system',
                }
              ]}>
                {font.name}
              </Text>
              <Text style={[
                styles.optionDescription,
                {
                  color: currentTheme.font.family === font.id ? currentTheme.backgroundColor + 'CC' : currentTheme.textColor + '80',
                  fontSize: currentTheme.font.size.small,
                }
              ]}>
                {font.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Font Weight */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Font Weight
        </Text>
        
        <View style={styles.weightGrid}>
          {fontWeights.map((weight) => (
            <TouchableOpacity
              key={weight.id}
              style={[
                styles.weightOption,
                {
                  backgroundColor: currentTheme.font.weight === weight.id ? currentTheme.primaryColor : currentTheme.surfaceColor || currentTheme.backgroundColor,
                  borderRadius: currentTheme.effects.borderRadius,
                  borderWidth: 1,
                  borderColor: currentTheme.textColor + '30',
                }
              ]}
              onPress={() => handleFontChange('weight', weight.id)}
            >
              <Text style={[
                styles.weightText,
                {
                  color: currentTheme.font.weight === weight.id ? currentTheme.backgroundColor : currentTheme.textColor,
                  fontSize: currentTheme.font.size.medium,
                  fontWeight: weight.weight as any,
                }
              ]}>
                Aa
              </Text>
              <Text style={[
                styles.weightName,
                {
                  color: currentTheme.font.weight === weight.id ? currentTheme.backgroundColor : currentTheme.textColor,
                  fontSize: currentTheme.font.size.xs,
                  fontWeight: '500',
                }
              ]}>
                {weight.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Font Sizes */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
            marginBottom: currentTheme.spacing.medium,
          }
        ]}>
          Font Sizes
        </Text>
        
        <View style={styles.sliderContainer}>
          <Text style={[
            styles.sliderLabel,
            {
              color: currentTheme.textColor + '99',
              fontSize: currentTheme.font.size.small,
            }
          ]}>
            Base Size: {currentTheme.font.size.medium}px
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={24}
            value={currentTheme.font.size.medium}
            onValueChange={(value) => {
              const scaleFactor = value / currentTheme.font.size.medium;
              handleFontChange('size', {
                xs: Math.round(currentTheme.font.size.xs * scaleFactor),
                small: Math.round(currentTheme.font.size.small * scaleFactor),
                medium: Math.round(value),
                large: Math.round(currentTheme.font.size.large * scaleFactor),
                xlarge: Math.round(currentTheme.font.size.xlarge * scaleFactor),
                xxlarge: Math.round(currentTheme.font.size.xxlarge * scaleFactor),
              });
            }}
            minimumTrackTintColor={currentTheme.primaryColor}
            maximumTrackTintColor={currentTheme.textColor + '30'}
            thumbTintColor={currentTheme.primaryColor}
          />
        </View>
      </View>

      {/* Line Height */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
            marginBottom: currentTheme.spacing.medium,
          }
        ]}>
          Line Height
        </Text>
        
        <View style={styles.sliderContainer}>
          <Text style={[
            styles.sliderLabel,
            {
              color: currentTheme.textColor + '99',
              fontSize: currentTheme.font.size.small,
            }
          ]}>
            Current: {currentTheme.font.lineHeight.toFixed(1)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1.0}
            maximumValue={2.0}
            step={0.1}
            value={currentTheme.font.lineHeight}
            onValueChange={(value) => handleFontChange('lineHeight', value)}
            minimumTrackTintColor={currentTheme.primaryColor}
            maximumTrackTintColor={currentTheme.textColor + '30'}
            thumbTintColor={currentTheme.primaryColor}
          />
        </View>
      </View>

      {/* Letter Spacing */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
            marginBottom: currentTheme.spacing.medium,
          }
        ]}>
          Letter Spacing
        </Text>
        
        <View style={styles.sliderContainer}>
          <Text style={[
            styles.sliderLabel,
            {
              color: currentTheme.textColor + '99',
              fontSize: currentTheme.font.size.small,
            }
          ]}>
            Current: {currentTheme.font.letterSpacing.toFixed(1)}px
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={-2}
            maximumValue={4}
            step={0.1}
            value={currentTheme.font.letterSpacing}
            onValueChange={(value) => handleFontChange('letterSpacing', value)}
            minimumTrackTintColor={currentTheme.primaryColor}
            maximumTrackTintColor={currentTheme.textColor + '30'}
            thumbTintColor={currentTheme.primaryColor}
          />
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
        <Icon name="text" size="xl" color={currentTheme.textColor + '40'} style={{ marginBottom: currentTheme.spacing.medium }} />
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
          Google Fonts Integration Coming Soon
        </Text>
        <Text style={[
          styles.comingSoonText,
          {
            color: currentTheme.textColor + '80',
            fontSize: currentTheme.font.size.small,
            textAlign: 'center',
          }
        ]}>
          Access hundreds of web fonts for even more customization options
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
  previewSection: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewTitle: {
    // Dynamic styles applied inline
  },
  previewText: {
    lineHeight: 24,
  },
  optionsGrid: {
    gap: 12,
  },
  option: {
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
  optionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    // Dynamic styles applied inline
  },
  weightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weightOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
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
  weightText: {
    fontSize: 20,
    marginBottom: 2,
  },
  weightName: {
    fontSize: 10,
  },
  sliderContainer: {
    // Container for sliders
  },
  sliderLabel: {
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
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

export default TypographyEditor;