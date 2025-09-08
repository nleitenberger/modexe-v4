import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../common/Icon';

const EffectsEditor: React.FC = () => {
  const { currentTheme, setPreviewTheme, createCustomTheme } = useTheme();

  const handleEffectChange = (property: string, value: any, nested?: string) => {
    let updatedTheme;
    
    if (nested) {
      const currentPropertyValue = currentTheme[property as keyof typeof currentTheme];
      updatedTheme = createCustomTheme(currentTheme, {
        [property]: {
          ...(typeof currentPropertyValue === 'object' && currentPropertyValue !== null ? currentPropertyValue : {}),
          [nested]: value,
        },
      });
    } else {
      updatedTheme = createCustomTheme(currentTheme, {
        [property]: value,
      });
    }
    
    setPreviewTheme(updatedTheme);
  };

  const animationSpeeds = [
    { id: 'slow', name: 'Slow', description: 'Relaxed animations' },
    { id: 'normal', name: 'Normal', description: 'Balanced timing' },
    { id: 'fast', name: 'Fast', description: 'Snappy animations' },
  ];

  const easingTypes = [
    { id: 'ease', name: 'Ease', description: 'Smooth acceleration' },
    { id: 'ease-in', name: 'Ease In', description: 'Slow start' },
    { id: 'ease-out', name: 'Ease Out', description: 'Slow end' },
    { id: 'ease-in-out', name: 'Ease In Out', description: 'Smooth both ends' },
    { id: 'spring', name: 'Spring', description: 'Bouncy motion' },
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
          Visual Effects
        </Text>
        <Text style={[
          styles.sectionDescription,
          {
            color: currentTheme.textColor + '99',
            fontSize: currentTheme.font.size.small,
          }
        ]}>
          Customize shadows, animations, and visual enhancements
        </Text>
      </View>

      {/* Preview Card */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Preview
        </Text>
        
        <View style={[
          styles.previewCard,
          {
            backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
            borderRadius: currentTheme.effects.borderRadius,
            shadowColor: currentTheme.shadows.color,
            shadowOffset: {
              width: currentTheme.shadows.offset.x,
              height: currentTheme.shadows.offset.y,
            },
            shadowOpacity: currentTheme.shadows.enabled ? currentTheme.shadows.opacity : 0,
            shadowRadius: currentTheme.shadows.blur,
            elevation: currentTheme.effects.cardElevation,
          }
        ]}>
          <Text style={[
            styles.previewTitle,
            {
              color: currentTheme.textColor,
              fontSize: currentTheme.font.size.large,
              fontWeight: '600',
              marginBottom: currentTheme.spacing.small,
            }
          ]}>
            Sample Journal Entry
          </Text>
          <Text style={[
            styles.previewText,
            {
              color: currentTheme.textColor + 'CC',
              fontSize: currentTheme.font.size.medium,
              lineHeight: currentTheme.font.lineHeight * currentTheme.font.size.medium,
            }
          ]}>
            This card shows how your current shadow and border radius settings will look.
          </Text>
        </View>
      </View>

      {/* Shadow Settings */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Shadows
        </Text>
        
        {/* Shadow Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[
              styles.settingLabel,
              {
                color: currentTheme.textColor,
                fontSize: currentTheme.font.size.medium,
                fontWeight: '500',
              }
            ]}>
              Enable Shadows
            </Text>
            <Text style={[
              styles.settingDescription,
              {
                color: currentTheme.textColor + '80',
                fontSize: currentTheme.font.size.small,
              }
            ]}>
              Add depth to cards and components
            </Text>
          </View>
          <Switch
            value={currentTheme.shadows.enabled}
            onValueChange={(value) => handleEffectChange('shadows', value, 'enabled')}
            trackColor={{
              false: currentTheme.textColor + '30',
              true: currentTheme.primaryColor + '60'
            }}
            thumbColor={currentTheme.shadows.enabled ? currentTheme.primaryColor : currentTheme.textColor + '80'}
          />
        </View>

        {currentTheme.shadows.enabled && (
          <>
            {/* Shadow Opacity */}
            <View style={styles.sliderContainer}>
              <Text style={[
                styles.sliderLabel,
                {
                  color: currentTheme.textColor + '99',
                  fontSize: currentTheme.font.size.small,
                }
              ]}>
                Shadow Opacity: {(currentTheme.shadows.opacity * 100).toFixed(0)}%
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={currentTheme.shadows.opacity}
                onValueChange={(value) => handleEffectChange('shadows', value, 'opacity')}
                minimumTrackTintColor={currentTheme.primaryColor}
                maximumTrackTintColor={currentTheme.textColor + '30'}
                thumbTintColor={currentTheme.primaryColor}
              />
            </View>

            {/* Shadow Blur */}
            <View style={styles.sliderContainer}>
              <Text style={[
                styles.sliderLabel,
                {
                  color: currentTheme.textColor + '99',
                  fontSize: currentTheme.font.size.small,
                }
              ]}>
                Shadow Blur: {currentTheme.shadows.blur}px
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20}
                step={1}
                value={currentTheme.shadows.blur}
                onValueChange={(value) => handleEffectChange('shadows', value, 'blur')}
                minimumTrackTintColor={currentTheme.primaryColor}
                maximumTrackTintColor={currentTheme.textColor + '30'}
                thumbTintColor={currentTheme.primaryColor}
              />
            </View>
          </>
        )}
      </View>

      {/* Border Radius */}
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
          Border Radius
        </Text>
        
        <View style={styles.sliderContainer}>
          <Text style={[
            styles.sliderLabel,
            {
              color: currentTheme.textColor + '99',
              fontSize: currentTheme.font.size.small,
            }
          ]}>
            Corner Roundness: {currentTheme.effects.borderRadius}px
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={24}
            step={1}
            value={currentTheme.effects.borderRadius}
            onValueChange={(value) => handleEffectChange('effects', value, 'borderRadius')}
            minimumTrackTintColor={currentTheme.primaryColor}
            maximumTrackTintColor={currentTheme.textColor + '30'}
            thumbTintColor={currentTheme.primaryColor}
          />
        </View>
      </View>

      {/* Card Elevation */}
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
          Card Elevation
        </Text>
        
        <View style={styles.sliderContainer}>
          <Text style={[
            styles.sliderLabel,
            {
              color: currentTheme.textColor + '99',
              fontSize: currentTheme.font.size.small,
            }
          ]}>
            Elevation Level: {currentTheme.effects.cardElevation}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={currentTheme.effects.cardElevation}
            onValueChange={(value) => handleEffectChange('effects', value, 'cardElevation')}
            minimumTrackTintColor={currentTheme.primaryColor}
            maximumTrackTintColor={currentTheme.textColor + '30'}
            thumbTintColor={currentTheme.primaryColor}
          />
        </View>
      </View>

      {/* Animation Settings */}
      <View style={styles.section}>
        <Text style={[
          styles.subsectionTitle,
          {
            color: currentTheme.textColor,
            fontSize: currentTheme.font.size.medium,
            fontWeight: '600',
          }
        ]}>
          Animations
        </Text>
        
        {/* Animation Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[
              styles.settingLabel,
              {
                color: currentTheme.textColor,
                fontSize: currentTheme.font.size.medium,
                fontWeight: '500',
              }
            ]}>
              Enable Animations
            </Text>
            <Text style={[
              styles.settingDescription,
              {
                color: currentTheme.textColor + '80',
                fontSize: currentTheme.font.size.small,
              }
            ]}>
              Smooth transitions and interactions
            </Text>
          </View>
          <Switch
            value={currentTheme.effects.animations.enabled}
            onValueChange={(value) => handleEffectChange('effects', { ...currentTheme.effects.animations, enabled: value }, 'animations')}
            trackColor={{
              false: currentTheme.textColor + '30',
              true: currentTheme.primaryColor + '60'
            }}
            thumbColor={currentTheme.effects.animations.enabled ? currentTheme.primaryColor : currentTheme.textColor + '80'}
          />
        </View>

        {currentTheme.effects.animations.enabled && (
          <>
            {/* Animation Speed */}
            <View style={styles.settingSection}>
              <Text style={[
                styles.settingSubtitle,
                {
                  color: currentTheme.textColor + '99',
                  fontSize: currentTheme.font.size.small,
                  fontWeight: '600',
                  marginBottom: currentTheme.spacing.small,
                }
              ]}>
                Animation Speed
              </Text>
              
              <View style={styles.optionsGrid}>
                {animationSpeeds.map((speed) => (
                  <TouchableOpacity
                    key={speed.id}
                    style={[
                      styles.option,
                      {
                        backgroundColor: currentTheme.effects.animations.speed === speed.id ? currentTheme.primaryColor : currentTheme.surfaceColor || currentTheme.backgroundColor,
                        borderRadius: currentTheme.effects.borderRadius,
                        borderWidth: 1,
                        borderColor: currentTheme.textColor + '30',
                      }
                    ]}
                    onPress={() => handleEffectChange('effects', { ...currentTheme.effects.animations, speed: speed.id }, 'animations')}
                  >
                    <Text style={[
                      styles.optionTitle,
                      {
                        color: currentTheme.effects.animations.speed === speed.id ? currentTheme.backgroundColor : currentTheme.textColor,
                        fontSize: currentTheme.font.size.medium,
                        fontWeight: '600',
                      }
                    ]}>
                      {speed.name}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      {
                        color: currentTheme.effects.animations.speed === speed.id ? currentTheme.backgroundColor + 'CC' : currentTheme.textColor + '80',
                        fontSize: currentTheme.font.size.small,
                      }
                    ]}>
                      {speed.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Animation Easing */}
            <View style={styles.settingSection}>
              <Text style={[
                styles.settingSubtitle,
                {
                  color: currentTheme.textColor + '99',
                  fontSize: currentTheme.font.size.small,
                  fontWeight: '600',
                  marginBottom: currentTheme.spacing.small,
                }
              ]}>
                Animation Style
              </Text>
              
              <View style={styles.optionsGrid}>
                {easingTypes.map((easing) => (
                  <TouchableOpacity
                    key={easing.id}
                    style={[
                      styles.option,
                      {
                        backgroundColor: currentTheme.effects.animations.easing === easing.id ? currentTheme.primaryColor : currentTheme.surfaceColor || currentTheme.backgroundColor,
                        borderRadius: currentTheme.effects.borderRadius,
                        borderWidth: 1,
                        borderColor: currentTheme.textColor + '30',
                      }
                    ]}
                    onPress={() => handleEffectChange('effects', { ...currentTheme.effects.animations, easing: easing.id }, 'animations')}
                  >
                    <Text style={[
                      styles.optionTitle,
                      {
                        color: currentTheme.effects.animations.easing === easing.id ? currentTheme.backgroundColor : currentTheme.textColor,
                        fontSize: currentTheme.font.size.small,
                        fontWeight: '600',
                      }
                    ]}>
                      {easing.name}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      {
                        color: currentTheme.effects.animations.easing === easing.id ? currentTheme.backgroundColor + 'CC' : currentTheme.textColor + '80',
                        fontSize: currentTheme.font.size.xs,
                      }
                    ]}>
                      {easing.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
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
          More Effects Coming Soon
        </Text>
        <Text style={[
          styles.comingSoonText,
          {
            color: currentTheme.textColor + '80',
            fontSize: currentTheme.font.size.small,
            textAlign: 'center',
          }
        ]}>
          Blur effects, particle animations, and advanced visual enhancements
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
  previewCard: {
    padding: 20,
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
    fontWeight: '600',
  },
  previewText: {
    lineHeight: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    lineHeight: 18,
  },
  settingSection: {
    marginTop: 16,
  },
  settingSubtitle: {
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  optionsGrid: {
    gap: 8,
  },
  option: {
    padding: 12,
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

export default EffectsEditor;