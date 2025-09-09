import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { StickerInstance } from '../../types/sticker.types';
import { 
  sendStickerToFront, 
  sendStickerToBack, 
  sendStickerBehindText, 
  sendStickerAboveText 
} from '../../store/journalSlice';
import { getStickerLayer, LayerType } from '../../constants/layers';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LayerContextMenuProps {
  visible: boolean;
  sticker: StickerInstance | null;
  position: { x: number; y: number };
  onClose: () => void;
}

const LayerContextMenu: React.FC<LayerContextMenuProps> = ({
  visible,
  sticker,
  position,
  onClose,
}) => {
  const dispatch = useDispatch();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.8, { duration: 150 });
    }
  }, [visible]);

  const animatedBackdrop = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedMenu = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!sticker) return null;

  const currentLayer = getStickerLayer(sticker.zIndex);
  const isBackground = currentLayer === LayerType.BACKGROUND;
  const isForeground = currentLayer === LayerType.FOREGROUND;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const menuOptions = [
    {
      title: 'Bring to Front',
      subtitle: 'Move to top of all stickers',
      onPress: () => handleAction(() => dispatch(sendStickerToFront(sticker.id))),
    },
    {
      title: 'Send to Back', 
      subtitle: 'Move to bottom of all stickers',
      onPress: () => handleAction(() => dispatch(sendStickerToBack(sticker.id))),
    },
    {
      title: isBackground ? 'Move Above Text' : 'Move Behind Text',
      subtitle: isBackground 
        ? 'Place sticker in front of text'
        : 'Place sticker behind text',
      onPress: () => handleAction(() => {
        if (isBackground) {
          dispatch(sendStickerAboveText(sticker.id));
        } else {
          dispatch(sendStickerBehindText(sticker.id));
        }
      }),
      isLayerToggle: true,
    },
  ];

  // Calculate menu position to keep it on screen
  const menuWidth = 240;
  const menuHeight = 180;
  const padding = 20;

  let menuX = position.x - menuWidth / 2;
  let menuY = position.y - menuHeight - 50;

  // Adjust horizontal position
  if (menuX < padding) menuX = padding;
  if (menuX + menuWidth > screenWidth - padding) {
    menuX = screenWidth - menuWidth - padding;
  }

  // Adjust vertical position
  if (menuY < padding) {
    menuY = position.y + 50; // Show below sticker instead
  }
  if (menuY + menuHeight > screenHeight - padding) {
    menuY = screenHeight - menuHeight - padding;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdrop]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Menu */}
      <Animated.View
        style={[
          styles.menu,
          {
            left: menuX,
            top: menuY,
          },
          animatedMenu,
        ]}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Layer Options</Text>
          <Text style={styles.menuSubtitle}>
            Currently: {isBackground ? 'Behind Text' : 'Above Text'}
          </Text>
        </View>

        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuOption,
              option.isLayerToggle && styles.layerToggleOption,
            ]}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backdropTouchable: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    width: 240,
    minHeight: 180,
  },
  menuHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  layerToggleOption: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
});

export default LayerContextMenu;