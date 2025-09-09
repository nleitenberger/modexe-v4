import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { StickerInstance } from '../../types/sticker.types';
import { RootState } from '../../store';
import { updateSticker } from '../../store/journalSlice';
import { selectSticker, setIsTransforming as setIsTransformingAction } from '../../store/stickerSlice';
import LayerContextMenu from './LayerContextMenu';
import ResizeHandles from './ResizeHandles';

interface DraggableStickerProps {
  sticker: StickerInstance;
  pageWidth: number;
}

const DraggableSticker: React.FC<DraggableStickerProps> = ({ sticker, pageWidth }) => {
  const dispatch = useDispatch();
  const selectedSticker = useSelector((state: RootState) => state.sticker.selectedSticker);
  
  const translateX = useSharedValue(sticker.position.x);
  const translateY = useSharedValue(sticker.position.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);
  const isSelected = selectedSticker?.id === sticker.id;

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Transform state for gestures
  const savedScale = useSharedValue(sticker.scale);
  const savedRotation = useSharedValue(sticker.rotation);
  
  // Transformation state for resize handles
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformPreview, setTransformPreview] = useState({
    scale: sticker.scale,
    rotation: sticker.rotation,
  });

  // Ref for simultaneous gesture handling
  const stickerPanRef = useRef(null);

  // Update shared values when sticker props change
  React.useEffect(() => {
    translateX.value = sticker.position.x;
    translateY.value = sticker.position.y;
    scale.value = sticker.scale;
    rotation.value = sticker.rotation;
    savedScale.value = sticker.scale;
    savedRotation.value = sticker.rotation;
  }, [sticker.position.x, sticker.position.y, sticker.scale, sticker.rotation]);

  const handleStickerSelect = () => {
    // Toggle selection: tap to select, tap again to deselect
    if (isSelected) {
      dispatch(selectSticker(null)); // Deselect
    } else {
      // Sync animated values with current sticker position before selecting
      translateX.value = sticker.position.x;
      translateY.value = sticker.position.y;
      dispatch(selectSticker(sticker)); // Select
    }
  };

  const handleUpdatePosition = (x: number, y: number) => {
    dispatch(updateSticker({
      stickerId: sticker.id,
      updates: {
        position: { x, y },
      },
    }));
  };

  const handleUpdateTransform = (newScale: number, newRotation: number) => {
    dispatch(updateSticker({
      stickerId: sticker.id,
      updates: {
        scale: Math.max(0.3, Math.min(3, newScale)), // Limit scale between 0.3x and 3x
        rotation: newRotation % 360, // Keep rotation in 0-360 range
      },
    }));
  };

  const handleLongPress = () => {
    // Calculate menu position relative to screen
    setMenuPosition({ x: sticker.position.x + 20, y: sticker.position.y + 20 });
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };

  // ResizeHandles callbacks
  const handleTransformStart = () => {
    setIsTransforming(true);
    // Disable main gesture handler during transform
  dispatch(setIsTransformingAction(true));
  };

  const handleTransformUpdate = (newScale: number, newRotation: number, aspectLocked?: boolean) => {
    // Apply constraints
    const constrainedScale = Math.max(0.3, Math.min(3.0, newScale));
    const normalizedRotation = ((newRotation % 360) + 360) % 360;

    // Update animated values for real-time preview
    scale.value = constrainedScale;
    rotation.value = normalizedRotation;

    // Update Redux store for live sticker update
    handleUpdateTransform(constrainedScale, normalizedRotation);
  };

  const handleTransformEnd = (finalScale: number, finalRotation: number) => {
    setIsTransforming(false);
    dispatch(setIsTransformingAction(false));

    // Apply final transformation to Redux store
    const constrainedScale = Math.max(0.3, Math.min(3.0, finalScale));
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;

    handleUpdateTransform(constrainedScale, normalizedRotation);
    scale.value = constrainedScale;
    rotation.value = normalizedRotation;
    setTransformPreview({
      scale: constrainedScale,
      rotation: normalizedRotation,
    });
  };

  // Old gesture system removed - now using unified PanResponder

  // Multi-touch state management
  const initialTouches = useRef<{ [key: string]: any }>({});
  const initialDistance = useRef(0);
  const initialAngle = useRef(0);
  const isMultiTouch = useRef(false);
  
  // Gesture state management to prevent tap termination
  const isDragging = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const gestureStartTime = useRef(0);

  // Helper functions for multi-touch calculations
  const getDistance = (touch1: any, touch2: any) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (touch1: any, touch2: any) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.atan2(dy, dx);
  };

  // Unified gesture handler using PanResponder for ALL touches
  const unifiedTouchHandler = PanResponder.create({
    onStartShouldSetPanResponder: () => !isTransforming, // Drag starts when not using handles
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Start pan if user moved enough and not transforming via handles
      return !isTransforming && (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3);
    },
  onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => isTransforming, // While transforming, capture to prevent scroll
    onPanResponderTerminationRequest: () => !isDragging.current && !isTransforming,
    onShouldBlockNativeResponder: () => true, // Prefer blocking native scroll when interacting with stickers
    
    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      gestureStartTime.current = Date.now();
      isDragging.current = false;
      
      // Clear any existing long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      if (touches.length >= 2) {
        // Multi-touch: pinch and rotation
        if (!isSelected) {
          handleStickerSelect();
        }
        
  isMultiTouch.current = true;
  dispatch(setIsTransformingAction(true));
        
        // Store initial touch positions
        touches.forEach((touch, index) => {
          initialTouches.current[index] = { ...touch };
        });
        
        // Store initial distance and angle
        initialDistance.current = getDistance(touches[0], touches[1]);
        initialAngle.current = getAngle(touches[0], touches[1]);
        savedScale.value = scale.value;
        savedRotation.value = rotation.value;
      } else {
        // Single touch: setup for potential tap, drag, or long press
        isMultiTouch.current = false;
        
  // Store initial position for dragging
  translateX.value = sticker.position.x;
  translateY.value = sticker.position.y;
  // Subtle visual feedback proportional to current scale
  scale.value = withSpring(sticker.scale * 1.05);
        
        // Start long press timer
        longPressTimer.current = setTimeout(() => {
          if (!isDragging.current) {
            handleLongPress();
          }
        }, 800);
      }
    },
    
    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      
      // Cancel long press timer if movement is detected
      if (longPressTimer.current && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5)) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        isDragging.current = true;
      }
      
      if (touches.length >= 2 && isMultiTouch.current) {
        // Multi-touch: handle pinch and rotation
        const currentDistance = getDistance(touches[0], touches[1]);
        const currentAngle = getAngle(touches[0], touches[1]);
        
        // Handle pinch (scale)
        if (initialDistance.current > 0) {
          const scaleRatio = currentDistance / initialDistance.current;
          const newScale = savedScale.value * scaleRatio;
          const clampedScale = Math.max(0.3, Math.min(3, newScale));
          scale.value = clampedScale;
        }
        
        // Handle rotation
        const angleDelta = currentAngle - initialAngle.current;
        const angleDegrees = (angleDelta * 180) / Math.PI;
        rotation.value = savedRotation.value + angleDegrees;
      } else if (touches.length === 1 && !isMultiTouch.current) {
        // Single touch: handle dragging
        translateX.value = sticker.position.x + gestureState.dx;
        translateY.value = sticker.position.y + gestureState.dy;
      }
    },
    
    onPanResponderRelease: () => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      if (isMultiTouch.current) {
        // Multi-touch release
        handleUpdateTransform(scale.value, rotation.value);
        isMultiTouch.current = false;
  initialTouches.current = {};
  dispatch(setIsTransformingAction(false));
      } else {
        // Single touch release
  scale.value = withSpring(sticker.scale); // Remove visual feedback
        
        if (isDragging.current) {
          // Was dragging - update position
          handleUpdatePosition(translateX.value, translateY.value);
        } else {
          // Was a tap - handle selection/deselection
          const gestureTime = Date.now() - gestureStartTime.current;
          if (gestureTime < 300) { // Quick tap
            handleStickerSelect();
          }
        }
      }
      
      // Reset gesture state
      isDragging.current = false;
    },
    
    onPanResponderTerminate: () => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      if (isMultiTouch.current) {
        handleUpdateTransform(scale.value, rotation.value);
        isMultiTouch.current = false;
  initialTouches.current = {};
  dispatch(setIsTransformingAction(false));
      } else {
        scale.value = withSpring(sticker.scale);
        if (isDragging.current) {
          handleUpdatePosition(translateX.value, translateY.value);
        }
      }
      
      // Reset gesture state
      isDragging.current = false;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    zIndex: sticker.zIndex,
  }));

  // Animated style for selection indicator
  const selectionStyle = useAnimatedStyle(() => ({
    opacity: isSelected ? 1 : 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    zIndex: sticker.zIndex + 1, // Above the sticker
  }));

  // Find the sticker metadata from constants
  const availableStickers = useSelector((state: RootState) => state.sticker.availableStickers);
  const stickerData = availableStickers
    .flatMap(category => category.stickers)
    .find(s => s.id === sticker.stickerId) || { emoji: '😊', size: { width: 64, height: 64 } };
  const baseSize = Math.max(48, Math.min(96, stickerData.size?.width || 64));

  // Using nested gesture detectors instead of composed gesture

  // Render selection indicator (visual only - gestures work on main sticker)
  const renderSelectionIndicator = () => {
    if (!isSelected) return null;

    return (
      <Animated.View style={[styles.selectionContainer, selectionStyle]} pointerEvents="none">
        {/* Visual hint text only */}
        <View style={styles.gestureHint}>
          <Text style={styles.hintText}>Pinch • Rotate • Drag</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Resize handles for selected sticker - must be above sticker */}
      <ResizeHandles
        sticker={sticker}
        isSelected={isSelected}
        onTransformStart={handleTransformStart}
        onTransformUpdate={handleTransformUpdate}
        onTransformEnd={handleTransformEnd}
        containerSize={{ width: pageWidth, height: 600 }} // Approximate page height
        animatedPosition={{ x: translateX, y: translateY }}
        animatedScale={scale}
        animatedRotation={rotation}
        baseSize={baseSize}
        stickerPanRef={stickerPanRef}
      />

      {/* Unified touch handler for all gestures */}
      <Animated.View
        ref={stickerPanRef}
        style={[
          styles.stickerContainer,
          { width: baseSize, height: baseSize, borderRadius: baseSize / 2, zIndex: sticker.zIndex },
          animatedStyle,
        ]}
        {...(isTransforming ? {} : unifiedTouchHandler.panHandlers)}
        pointerEvents={isTransforming ? 'auto' : 'auto'}
      >
        <Text style={[styles.stickerText, { fontSize: Math.round(baseSize * 0.7) }]}>{stickerData.emoji}</Text>
      </Animated.View>

      {/* Selection indicator with gesture hints - only show when selected */}
      {isSelected && renderSelectionIndicator()}

      {/* Context menu for layer operations */}
      <LayerContextMenu
        visible={showContextMenu}
        sticker={sticker}
        position={menuPosition}
        onClose={handleCloseContextMenu}
      />
    </>
  );
};

const styles = StyleSheet.create({
  stickerContainer: {
    position: 'absolute',
  },
  sticker: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  // Selection indicator styles
  selectionContainer: {
    position: 'absolute',
    width: 70, // Larger than sticker for gesture area
    height: 70,
    marginLeft: -15, // Center on sticker
    marginTop: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureHint: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  stickerText: {
    textAlign: 'center',
  },
});

export default DraggableSticker;