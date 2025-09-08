import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { StickerInstance } from '../../types/sticker.types';
import { RootState } from '../../store';
import { updateSticker } from '../../store/journalSlice';
import { selectSticker } from '../../store/stickerSlice';

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
  const isSelected = selectedSticker?.id === sticker.id;

  const handleStickerSelect = () => {
    dispatch(selectSticker(sticker));
  };

  const handleUpdatePosition = (x: number, y: number) => {
    dispatch(updateSticker({
      stickerId: sticker.id,
      updates: {
        position: { x, y },
      },
    }));
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      translateX.value = sticker.position.x + event.translationX;
      translateY.value = sticker.position.y + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(sticker.scale);
      runOnJS(handleUpdatePosition)(translateX.value, translateY.value);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleStickerSelect)();
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${sticker.rotation}deg` },
    ],
    zIndex: sticker.zIndex,
  }));

  // Find the sticker emoji from constants
  const availableStickers = useSelector((state: RootState) => state.sticker.availableStickers);
  const stickerData = availableStickers
    .flatMap(category => category.stickers)
    .find(s => s.id === sticker.stickerId) || { emoji: '😊' };

  const composed = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.stickerContainer,
          styles.sticker,
          isSelected && styles.selectedSticker,
          animatedStyle,
        ]}
      >
        <Text style={styles.stickerText}>{stickerData.emoji}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  stickerContainer: {
    position: 'absolute',
  },
  sticker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  selectedSticker: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  stickerText: {
    fontSize: 28,
    textAlign: 'center',
  },
});

export default DraggableSticker;