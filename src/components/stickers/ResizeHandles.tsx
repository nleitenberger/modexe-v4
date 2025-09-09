import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

import { StickerInstance } from '../../types/sticker.types';

interface ResizeHandlesProps {
  sticker: StickerInstance;
  isSelected: boolean;
  onTransformStart: () => void;
  onTransformUpdate: (scale: number, rotation: number, aspectLocked?: boolean) => void;
  onTransformEnd: (scale: number, rotation: number) => void;
  containerSize: { width: number; height: number };
  animatedPosition?: { x: any; y: any };
  animatedScale?: any;
  animatedRotation?: any;
  baseSize?: number;
  stickerPanRef?: React.RefObject<any>;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  sticker,
  isSelected,
  onTransformStart,
  onTransformUpdate,
  onTransformEnd,
  containerSize,
  animatedPosition,
  animatedScale,
  animatedRotation,
  baseSize = 64,
}) => {
  // Always call hooks first, in the same order
  const highlightScale = useSharedValue(1);
  const rotationIndicatorOpacity = useSharedValue(0);
  
  // Animation styles - always defined
  const animatedHandleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: highlightScale.value }],
  }));

  const rotationHandleStyle = useAnimatedStyle(() => ({
    opacity: rotationIndicatorOpacity.value,
    transform: [{ scale: highlightScale.value }],
  }));

  // Always calculate these values regardless of isSelected
  const handleSize = Math.max(24, Math.round(baseSize * 0.32));
  const handleTouchSize = Math.max(56, Math.round(baseSize * 0.9));
  const rotationHandleDistance = Math.max(48, Math.round(baseSize * 0.7));

  // Ref for simultaneous gesture handling
  const stickerPanRef = React.useRef(null);

  // Animated container style that follows the sticker's real-time position and size
  const containerStyle = useAnimatedStyle(() => {
    const currentX = animatedPosition?.x?.value ?? sticker.position.x;
    const currentY = animatedPosition?.y?.value ?? sticker.position.y;
    const currentScale = animatedScale?.value ?? sticker.scale;
  const stickerWidth = baseSize * currentScale;
  const stickerHeight = baseSize * currentScale;

    return {
      left: currentX - handleTouchSize / 2,
      top: currentY - handleTouchSize / 2,
      width: stickerWidth + handleTouchSize,
      height: stickerHeight + handleTouchSize,
    };
  });

  // Animated styles dependent on current scale
  const selectionBorderStyle = useAnimatedStyle(() => {
    const currentScale = animatedScale?.value ?? sticker.scale;
  const stickerWidth = baseSize * currentScale;
  const stickerHeight = baseSize * currentScale;
    return {
      width: stickerWidth,
      height: stickerHeight,
      left: handleTouchSize / 2,
      top: handleTouchSize / 2,
    };
  });

  const rotationHandlePosStyle = useAnimatedStyle(() => {
    const currentScale = animatedScale?.value ?? sticker.scale;
    const stickerWidth = baseSize * currentScale;
    const halfWidth = stickerWidth / 2;
    return {
      left: halfWidth + handleTouchSize / 2 - handleSize / 2,
      top: -rotationHandleDistance,
      zIndex: 999999,
    };
  });

  // Calculate distance from center for scaling using current animated position
  const calculateScaleFromDistance = (
    gestureX: number,
    gestureY: number
  ): number => {
    const currentX = animatedPosition?.x?.value ?? sticker.position.x;
    const currentY = animatedPosition?.y?.value ?? sticker.position.y;
    const currentScale = animatedScale?.value ?? sticker.scale;
  const currStickerWidth = baseSize * currentScale;
  const currStickerHeight = baseSize * currentScale;
    const centerX = currentX + currStickerWidth / 2;
    const centerY = currentY + currStickerHeight / 2;
    
    const distance = Math.sqrt(
      Math.pow(gestureX - centerX, 2) + Math.pow(gestureY - centerY, 2)
    );
    
    const baseDistance = Math.sqrt(
      (currStickerWidth / 2) * (currStickerWidth / 2) +
      (currStickerHeight / 2) * (currStickerHeight / 2)
    );
    
    return Math.max(0.3, Math.min(3.0, distance / baseDistance));
  };

  // Single gesture handler for all resize operations
  const resizeHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(onTransformStart)();
      highlightScale.value = withSpring(1.2);
    },
    onActive: (event) => {
      const newScale = calculateScaleFromDistance(event.absoluteX, event.absoluteY);
  const currentRotation = animatedRotation?.value ?? sticker.rotation;
  runOnJS(onTransformUpdate)(newScale, currentRotation, true);
    },
    onEnd: () => {
  const currentScale = animatedScale?.value ?? sticker.scale;
  const currentRotation = animatedRotation?.value ?? sticker.rotation;
  runOnJS(onTransformEnd)(currentScale, currentRotation);
      highlightScale.value = withSpring(1);
    },
  });

  // Single gesture handler for rotation
  const rotationHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(onTransformStart)();
      rotationIndicatorOpacity.value = withSpring(1);
    },
    onActive: (event) => {
  const currentX = animatedPosition?.x?.value ?? sticker.position.x;
  const currentY = animatedPosition?.y?.value ?? sticker.position.y;
  const currentScale = animatedScale?.value ?? sticker.scale;
  const currStickerWidth = baseSize * currentScale;
  const currStickerHeight = baseSize * currentScale;
  const centerX = currentX + currStickerWidth / 2;
  const centerY = currentY + currStickerHeight / 2;
      const angle = Math.atan2(
        event.absoluteY - centerY,
        event.absoluteX - centerX
      );
      const degrees = (angle * 180) / Math.PI;
      const snappedAngle = Math.round(degrees / 15) * 15;
  const currentScaleVal = animatedScale?.value ?? sticker.scale;
  runOnJS(onTransformUpdate)(currentScaleVal, snappedAngle);
    },
    onEnd: () => {
  const currentScale = animatedScale?.value ?? sticker.scale;
  const currentRotation = animatedRotation?.value ?? sticker.rotation;
  runOnJS(onTransformEnd)(currentScale, currentRotation);
      rotationIndicatorOpacity.value = withSpring(0);
    },
  });

  // Conditional return after all hooks are called
  if (!isSelected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.handlesContainer,
        containerStyle,
        animatedHandleStyle,
      ]}
      pointerEvents="box-only"
    >
      {/* Rotation handle with simultaneousHandlers for multi-touch */}
      <PanGestureHandler
        onGestureEvent={rotationHandler}
        minDist={0}
        shouldCancelWhenOutside={false}
        hitSlop={32}
        simultaneousHandlers={stickerPanRef}
      >
        <Animated.View style={[styles.rotationHandle, rotationHandlePosStyle, rotationHandleStyle]}>
          <View style={styles.rotationIndicator} />
          <View style={styles.rotationArc} />
          <View style={styles.rotateIconContainer}>
            <Text style={styles.rotateIcon}>⟳</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  handlesContainer: {
    position: 'absolute',
    zIndex: 999999,
  },
  edgeHandle: {
    backgroundColor: '#34C759',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  rotationHandle: {
    position: 'absolute',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  rotationIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  rotationArc: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  sizeIndicator: {
    position: 'absolute',
    bottom: -30,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  rotateIconContainer: {
    position: 'absolute',
    top: 4,
    left: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  rotateIcon: {
    fontSize: 16,
    color: '#FF3B30',
    opacity: 0.7,
    fontWeight: 'bold',
  },
});

export default ResizeHandles;