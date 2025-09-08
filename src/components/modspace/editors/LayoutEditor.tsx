import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { updateModSpaceLayout } from '../../../store/modspaceSlice';
import { useTheme } from '../../../contexts/ThemeContext';
import { LAYOUT_TEMPLATES } from '../../../types/modspace.types';
import Icon from '../../common/Icon';

const LayoutEditor: React.FC = () => {
  const { currentTheme } = useTheme();
  const dispatch = useDispatch();
  const { currentModSpace } = useSelector((state: RootState) => state.modspace);

  const handleLayoutSelect = (layout: any) => {
    dispatch(updateModSpaceLayout(layout));
  };

  const getLayoutIcon = (layoutId: string) => {
    const icons: Record<string, string> = {
      grid: 'grid',
      timeline: 'timeline',
      magazine: 'magazine',
      minimal: 'minimal',
      creative: 'creative',
    };
    return icons[layoutId] || 'layout';
  };

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
          Choose Layout Style
        </Text>
        <Text style={[
          styles.sectionDescription,
          {
            color: currentTheme.textColor + '99',
            fontSize: currentTheme.font.size.small,
          }
        ]}>
          Select how your journal entries are displayed in your ModSpace
        </Text>
      </View>

      <View style={styles.layoutGrid}>
        {LAYOUT_TEMPLATES.map((layout) => {
          const isSelected = currentModSpace?.layout.id === layout.id;
          
          return (
            <TouchableOpacity
              key={layout.id}
              style={[
                styles.layoutOption,
                {
                  backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
                  borderColor: isSelected ? currentTheme.primaryColor : currentTheme.textColor + '30',
                  borderWidth: isSelected ? 3 : 1,
                  borderRadius: currentTheme.effects.borderRadius,
                }
              ]}
              onPress={() => handleLayoutSelect(layout)}
            >
              <View style={styles.layoutHeader}>
                <Icon 
                  name={getLayoutIcon(layout.id)} 
                  size="xl" 
                  color={isSelected ? currentTheme.primaryColor : currentTheme.textColor + '80'} 
                />
                
                {isSelected && (
                  <View style={[
                    styles.selectedBadge,
                    { backgroundColor: currentTheme.primaryColor }
                  ]}>
                    <Icon name="check" size="xs" color={currentTheme.backgroundColor} />
                  </View>
                )}
              </View>

              <Text style={[
                styles.layoutName,
                {
                  color: currentTheme.textColor,
                  fontSize: currentTheme.font.size.medium,
                  fontWeight: '700',
                }
              ]}>
                {layout.name}
              </Text>

              <Text style={[
                styles.layoutDescription,
                {
                  color: currentTheme.textColor + '99',
                  fontSize: currentTheme.font.size.small,
                }
              ]}>
                {layout.description}
              </Text>

              {/* Layout preview */}
              <View style={styles.layoutPreview}>
                {layout.id === 'grid' && (
                  <View style={styles.gridPreview}>
                    {[...Array(6)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.previewItem,
                          { backgroundColor: currentTheme.primaryColor + '40' }
                        ]}
                      />
                    ))}
                  </View>
                )}
                
                {layout.id === 'timeline' && (
                  <View style={styles.timelinePreview}>
                    {[...Array(3)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.timelineItem,
                          { backgroundColor: currentTheme.primaryColor + '40' }
                        ]}
                      />
                    ))}
                  </View>
                )}

                {layout.id === 'magazine' && (
                  <View style={styles.magazinePreview}>
                    <View style={[
                      styles.magazineItem,
                      styles.magazineFeatured,
                      { backgroundColor: currentTheme.primaryColor + '40' }
                    ]} />
                    <View style={styles.magazineColumn}>
                      <View style={[
                        styles.magazineItem,
                        { backgroundColor: currentTheme.primaryColor + '40' }
                      ]} />
                      <View style={[
                        styles.magazineItem,
                        { backgroundColor: currentTheme.primaryColor + '40' }
                      ]} />
                    </View>
                  </View>
                )}

                {layout.id === 'minimal' && (
                  <View style={styles.minimalPreview}>
                    {[...Array(3)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.minimalItem,
                          { borderBottomColor: currentTheme.textColor + '20' }
                        ]}
                      />
                    ))}
                  </View>
                )}

                {layout.id === 'creative' && (
                  <View style={styles.creativePreview}>
                    <View style={[
                      styles.creativeItem,
                      { 
                        backgroundColor: currentTheme.primaryColor + '40',
                        top: 5,
                        left: 10,
                      }
                    ]} />
                    <View style={[
                      styles.creativeItem,
                      { 
                        backgroundColor: currentTheme.secondaryColor + '40',
                        top: 15,
                        right: 5,
                      }
                    ]} />
                    <View style={[
                      styles.creativeItem,
                      { 
                        backgroundColor: currentTheme.accentColor + '40',
                        bottom: 10,
                        left: 20,
                      }
                    ]} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    lineHeight: 20,
  },
  layoutGrid: {
    gap: 16,
  },
  layoutOption: {
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
  layoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  layoutName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  layoutDescription: {
    lineHeight: 20,
    marginBottom: 16,
  },
  layoutPreview: {
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  // Grid preview
  gridPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    padding: 4,
  },
  previewItem: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },

  // Timeline preview
  timelinePreview: {
    padding: 8,
    gap: 8,
  },
  timelineItem: {
    height: 16,
    borderRadius: 4,
    marginLeft: 12,
  },

  // Magazine preview
  magazinePreview: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  magazineItem: {
    borderRadius: 4,
  },
  magazineFeatured: {
    width: 40,
    height: 72,
  },
  magazineColumn: {
    flex: 1,
    gap: 4,
  },

  // Minimal preview
  minimalPreview: {
    padding: 8,
  },
  minimalItem: {
    height: 20,
    borderBottomWidth: 1,
    marginBottom: 4,
  },

  // Creative preview
  creativePreview: {
    position: 'relative',
  },
  creativeItem: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});

export default LayoutEditor;