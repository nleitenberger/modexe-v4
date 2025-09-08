import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, PanResponder, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SharedJournalEntry, LayoutConfig, EntryPosition } from '../../../types/modspace.types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrientation } from '../../../utils/useOrientation';
import JournalEntryCard from '../cards/JournalEntryCard';
import Icon from '../../common/Icon';

interface CreativeLayoutProps {
  entries: SharedJournalEntry[];
  config: LayoutConfig;
  onEntryPress?: (entry: SharedJournalEntry) => void;
  onEntryLongPress?: (entry: SharedJournalEntry) => void;
  onPositionChange?: (positions: EntryPosition[]) => void;
  isEditMode?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CreativeLayout: React.FC<CreativeLayoutProps> = ({ 
  entries, 
  config, 
  onEntryPress, 
  onEntryLongPress,
  onPositionChange,
  isEditMode = false,
}) => {
  const { currentTheme } = useTheme();
  const { isPortrait } = useOrientation();

  const [entryPositions, setEntryPositions] = useState<EntryPosition[]>(
    config.customPositions || []
  );

  const defaultCardWidth = isPortrait ? screenWidth * 0.4 : screenWidth * 0.25;
  const defaultCardHeight = defaultCardWidth * 1.2;

  // Initialize positions for new entries
  const initializePositions = () => {
    const newPositions: EntryPosition[] = [];
    const existingPositions = new Map(
      entryPositions.map(pos => [pos.entryId, pos])
    );

    entries.forEach((entry, index) => {
      const existingPos = existingPositions.get(entry.id);
      
      if (existingPos) {
        newPositions.push(existingPos);
      } else {
        // Create default position for new entries
        const row = Math.floor(index / 3);
        const col = index % 3;
        const spacing = 20;
        
        newPositions.push({
          entryId: entry.id,
          x: col * (defaultCardWidth + spacing) + spacing,
          y: row * (defaultCardHeight + spacing) + spacing,
          width: defaultCardWidth,
          height: defaultCardHeight,
          zIndex: index,
        });
      }
    });

    return newPositions;
  };

  const positions = initializePositions();

  const updatePosition = (entryId: string, newPosition: Partial<EntryPosition>) => {
    const updatedPositions = positions.map(pos => 
      pos.entryId === entryId ? { ...pos, ...newPosition } : pos
    );
    setEntryPositions(updatedPositions);
    onPositionChange?.(updatedPositions);
  };

  const bringToFront = (entryId: string) => {
    const maxZIndex = Math.max(...positions.map(pos => pos.zIndex));
    updatePosition(entryId, { zIndex: maxZIndex + 1 });
  };

  const DraggableEntryCard: React.FC<{
    entry: SharedJournalEntry;
    position: EntryPosition;
  }> = ({ entry, position }) => {
    const translateX = useSharedValue(position.x);
    const translateY = useSharedValue(position.y);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
        context.startY = translateY.value;
        scale.value = withSpring(isEditMode ? 1.05 : 1);
        opacity.value = withSpring(isEditMode ? 0.9 : 1);
        
        // Bring to front
        runOnJS(bringToFront)(entry.id);
      },
      onActive: (event, context: any) => {
        if (isEditMode) {
          translateX.value = context.startX + event.translationX;
          translateY.value = context.startY + event.translationY;
        }
      },
      onEnd: (event) => {
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
        
        if (isEditMode) {
          // Snap to grid (optional)
          const gridSize = 20;
          const snappedX = Math.round(translateX.value / gridSize) * gridSize;
          const snappedY = Math.round(translateY.value / gridSize) * gridSize;
          
          // Ensure within bounds
          const maxX = screenWidth - position.width;
          const maxY = screenHeight - position.height;
          const finalX = Math.max(0, Math.min(maxX, snappedX));
          const finalY = Math.max(0, Math.min(maxY, snappedY));
          
          translateX.value = withSpring(finalX);
          translateY.value = withSpring(finalY);
          
          // Update position
          runOnJS(updatePosition)(entry.id, {
            x: finalX,
            y: finalY,
          });
        } else {
          // If not in edit mode, handle as normal tap
          if (Math.abs(event.translationX) < 10 && Math.abs(event.translationY) < 10) {
            runOnJS(() => onEntryPress?.(entry))();
          }
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
          ...(position.rotation ? [{ rotate: `${position.rotation}deg` }] : []),
        ],
        opacity: opacity.value,
        zIndex: position.zIndex,
      };
    });

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.draggableCard,
            animatedStyle,
            {
              width: position.width,
              height: position.height,
            }
          ]}
        >
          <JournalEntryCard
            entry={entry}
            config={config}
            theme={currentTheme}
            width={position.width}
            aspectRatio="dynamic"
            onPress={isEditMode ? undefined : () => onEntryPress?.(entry)}
            onLongPress={() => onEntryLongPress?.(entry)}
          />
          
          {/* Edit mode indicators */}
          {isEditMode && (
            <>
              {/* Drag handle */}
              <View style={[
                styles.dragHandle,
                {
                  backgroundColor: currentTheme.primaryColor,
                }
              ]}>
                <Icon name="drag" size="xs" color={currentTheme.backgroundColor} />
              </View>
              
              {/* Resize handle */}
              <View style={[
                styles.resizeHandle,
                {
                  backgroundColor: currentTheme.secondaryColor,
                }
              ]}>
                <Icon name="resize" size="xs" color={currentTheme.backgroundColor} />
              </View>
            </>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderGridBackground = () => {
    if (!isEditMode) return null;

    const gridSize = 20;
    const gridLines = [];
    
    // Vertical lines
    for (let x = 0; x < screenWidth; x += gridSize) {
      gridLines.push(
        <View
          key={`v-${x}`}
          style={[
            styles.gridLine,
            {
              left: x,
              width: 1,
              height: '100%',
              backgroundColor: currentTheme.textColor + '10',
            }
          ]}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y < screenHeight; y += gridSize) {
      gridLines.push(
        <View
          key={`h-${y}`}
          style={[
            styles.gridLine,
            {
              top: y,
              height: 1,
              width: '100%',
              backgroundColor: currentTheme.textColor + '10',
            }
          ]}
        />
      );
    }

    return (
      <View style={styles.gridBackground}>
        {gridLines}
      </View>
    );
  };

  // Calculate canvas size based on positions
  const getCanvasSize = () => {
    if (positions.length === 0) {
      return { width: screenWidth, height: screenHeight };
    }

    const maxX = Math.max(...positions.map(pos => pos.x + pos.width));
    const maxY = Math.max(...positions.map(pos => pos.y + pos.height));
    
    return {
      width: Math.max(screenWidth, maxX + 40),
      height: Math.max(screenHeight, maxY + 40),
    };
  };

  const canvasSize = getCanvasSize();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Edit mode header */}
      {isEditMode && (
        <View style={[
          styles.editModeHeader,
          {
            backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
            borderBottomColor: currentTheme.textColor + '20',
            padding: currentTheme.spacing.medium,
          }
        ]}>
          <View style={styles.editModeInfo}>
            <Icon name="drag" size="sm" color={currentTheme.primaryColor} />
            <Text style={[
              styles.editModeText,
              {
                color: currentTheme.textColor,
                fontSize: currentTheme.font.size.small,
                marginLeft: currentTheme.spacing.small,
              }
            ]}>
              Drag entries to rearrange • Long press for options
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: canvasSize.width,
            height: canvasSize.height,
          }
        ]}
        showsVerticalScrollIndicator={isEditMode}
        showsHorizontalScrollIndicator={isEditMode}
        scrollEnabled={true}
        maximumZoomScale={isEditMode ? 2 : 1}
        minimumZoomScale={0.5}
      >
        {/* Grid background */}
        {renderGridBackground()}
        
        {/* Canvas */}
        <View style={[
          styles.canvas,
          {
            width: canvasSize.width,
            height: canvasSize.height,
          }
        ]}>
          {entries.length > 0 ? (
            positions.map((position) => {
              const entry = entries.find(e => e.id === position.entryId);
              if (!entry) return null;
              
              return (
                <DraggableEntryCard
                  key={entry.id}
                  entry={entry}
                  position={position}
                />
              );
            })
          ) : (
            <View style={styles.emptyState}>
              {/* Empty state will be handled by parent component */}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit mode toolbar */}
      {isEditMode && (
        <View style={[
          styles.editModeToolbar,
          {
            backgroundColor: currentTheme.surfaceColor || currentTheme.backgroundColor,
            borderTopColor: currentTheme.textColor + '20',
            padding: currentTheme.spacing.medium,
          }
        ]}>
          <Text style={[
            styles.toolbarText,
            {
              color: currentTheme.textColor + '99',
              fontSize: currentTheme.font.size.xs,
            }
          ]}>
            {entries.length} entries • Snap to grid enabled
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editModeHeader: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editModeText: {
    flex: 1,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
  },
  canvas: {
    position: 'relative',
    zIndex: 1,
  },
  draggableCard: {
    position: 'absolute',
  },
  dragHandle: {
    position: 'absolute',
    top: -12,
    left: -12,
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
  resizeHandle: {
    position: 'absolute',
    bottom: -12,
    right: -12,
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
  editModeToolbar: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolbarText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    minHeight: 200,
  },
});

export default CreativeLayout;