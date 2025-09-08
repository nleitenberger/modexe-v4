import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SharedJournalEntry, LayoutConfig, AdvancedLayoutConfig } from '../../../types/modspace.types';
import { TemplateLayoutEngine } from '../../../services/TemplateLayoutEngine';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrientation } from '../../../utils/useOrientation';
import JournalEntryCard from '../cards/JournalEntryCard';

interface CreativeLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig | AdvancedLayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
  isAdvancedMode?: boolean;
  selectedEntries?: string[];
  onEntrySelect?: (entryId: string, multiSelect?: boolean) => void;
}

const { height: screenHeight } = Dimensions.get('window');

const CreativeLayout: React.FC<CreativeLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress,
  isAdvancedMode = false,
  selectedEntries = [],
  onEntrySelect,
}) => {
  const { currentTheme } = useTheme();
  const { isPortrait } = useOrientation();

  // Check if we have advanced layout configuration
  const advancedConfig = config as AdvancedLayoutConfig;
  const hasAdvancedConfig = advancedConfig?.isAdvancedMode && advancedConfig?.template;

  // Calculate positions using TemplateLayoutEngine if advanced mode, or fallback to simple grid
  let layoutPositions = [];
  
  if (hasAdvancedConfig && advancedConfig.template && advancedConfig.entryOrder) {
    // Use template-based layout from advanced configuration
    layoutPositions = TemplateLayoutEngine.calculateLayout({
      template: advancedConfig.template,
      entryOrder: advancedConfig.entryOrder,
      entryDisplayStyles: advancedConfig.entryDisplayStyles || {},
      isPortrait,
    });
  } else if (config.customPositions && config.customPositions.length > 0) {
    // Use existing custom positions (backward compatibility)
    layoutPositions = config.customPositions;
  } else {
    // Fallback to default grid layout
    const defaultEntryOrder = entries.map(e => e.id);
    layoutPositions = TemplateLayoutEngine.calculateLayout({
      template: 'grid',
      entryOrder: defaultEntryOrder,
      entryDisplayStyles: {},
      isPortrait,
    });
  }

  // Get the card configuration based on display mode
  const getCardConfig = (entryId: string) => {
    const displayMode = advancedConfig?.entryDisplayStyles?.[entryId] || 'card';
    
    return {
      cardStyle: (displayMode === 'compact' ? 'minimal' : 'elevated') as 'minimal' | 'elevated' | 'flat' | 'outlined',
      showCaptions: displayMode !== 'compact',
      showStats: displayMode === 'featured',
      showDates: displayMode === 'featured',
      aspectRatio: (displayMode === 'featured' ? 'landscape' : 'dynamic') as 'square' | 'portrait' | 'landscape' | 'dynamic',
    };
  };

  // Calculate container height based on positions
  const containerHeight = layoutPositions.length > 0 
    ? Math.max(...layoutPositions.map(pos => pos.y + pos.height)) + 20
    : screenHeight * 0.6;

  const handleEntryPress = (entry: SharedJournalEntry) => {
    if (isAdvancedMode && onEntrySelect) {
      onEntrySelect(entry.id, false);
    } else {
      onEntryPress?.(entry);
    }
  };

  const handleEntryLongPress = (entry: SharedJournalEntry) => {
    if (isAdvancedMode && onEntrySelect) {
      onEntrySelect(entry.id, true);
    } else {
      onEntryLongPress?.(entry);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { minHeight: containerHeight }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.layoutContainer, { height: containerHeight }]}>
        {layoutPositions.map((position) => {
          const entry = entries.find(e => e.id === position.entryId);
          if (!entry) return null;

          const isSelected = selectedEntries.includes(entry.id);
          const cardConfig = getCardConfig(entry.id);

          return (
            <TouchableOpacity
              key={entry.id}
              style={[
                styles.entryContainer,
                {
                  left: position.x,
                  top: position.y,
                  width: position.width,
                  height: position.height,
                  zIndex: position.zIndex,
                  borderWidth: isSelected && isAdvancedMode ? 3 : 0,
                  borderColor: isSelected ? currentTheme.primaryColor : 'transparent',
                  borderRadius: currentTheme.effects?.borderRadius || 8,
                  shadowColor: isSelected ? currentTheme.primaryColor : currentTheme.shadows?.color || '#000',
                  shadowOffset: {
                    width: currentTheme.shadows?.offset?.x || 0,
                    height: currentTheme.shadows?.offset?.y || 2,
                  },
                  shadowOpacity: isSelected ? 0.3 : (currentTheme.shadows?.opacity || 0.1),
                  shadowRadius: currentTheme.shadows?.blur || 4,
                  elevation: isSelected ? 8 : 3,
                }
              ]}
              onPress={() => handleEntryPress(entry)}
              onLongPress={() => handleEntryLongPress(entry)}
              activeOpacity={0.8}
            >
              <JournalEntryCard
                entry={entry}
                config={{
                  ...config,
                  ...cardConfig,
                }}
                theme={currentTheme}
                width={position.width}
                aspectRatio={cardConfig.aspectRatio as any}
              />
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
  contentContainer: {
    paddingVertical: 20,
  },
  layoutContainer: {
    position: 'relative',
    width: '100%',
  },
  entryContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default CreativeLayout;