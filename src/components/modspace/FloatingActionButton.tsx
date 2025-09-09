import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
// Removed blur imports - creating custom effect instead
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../common/Icon';

interface FABProps {
  onJournalEntry: () => void;
  onMediaEntry: () => void;
  onCustomize: () => void;
}

interface MenuButtonProps {
  icon: 'edit' | 'media' | 'customize';
  onPress: () => void;
  delay: number;
  isExpanded: boolean;
  theme: any;
  position: number; // Position index (0, 1, 2)
  isDark: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const MenuButton: React.FC<MenuButtonProps> = ({ 
  icon, 
  onPress, 
  delay, 
  isExpanded, 
  theme, 
  position,
  isDark
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isExpanded) {
      translateY.value = withDelay(
        delay,
        withSpring(-(56 + 16) * (position + 1), {
          damping: 15,
          stiffness: 150,
        })
      );
      scale.value = withDelay(
        delay,
        withSpring(1, {
          damping: 15,
          stiffness: 150,
        })
      );
      opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration: 200,
        })
      );
    } else {
      // Immediately reset to starting values
      translateY.value = 0;
      scale.value = 0;
      opacity.value = 0;
    }
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const buttonStyles = createMenuButtonStyles(theme, isDark);

  return (
    <AnimatedTouchableOpacity
      style={[buttonStyles.menuButton, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={icon} size="md" color="#FFFFFF" />
    </AnimatedTouchableOpacity>
  );
};

const FloatingActionButton = forwardRef<any, FABProps>(({
  onJournalEntry,
  onMediaEntry,
  onCustomize,
}, ref) => {
  const { currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to detect if theme is dark
  const isDarkTheme = (theme: any) => {
    // Check if background is dark by looking at the hex color
    const bgColor = theme.backgroundColor || '#FFFFFF';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; // Dark if brightness is less than 50%
  };

  // Animation values
  const rotation = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  // Expose resetFAB method through ref
  useImperativeHandle(ref, () => ({
    resetFAB: () => {
      setIsExpanded(false);
      rotation.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      backdropOpacity.value = withTiming(0, {
        duration: 150,
      });
    },
  }));

  const toggleFAB = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (newExpandedState) {
      rotation.value = withSpring(45, {
        damping: 15,
        stiffness: 150,
      });
      backdropOpacity.value = withTiming(1, {
        duration: 200,
      });
    } else {
      rotation.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      backdropOpacity.value = withTiming(0, {
        duration: 150,
      });
    }
  };

  const handleMenuItemPress = (callback: () => void) => {
    setIsExpanded(false);
    rotation.value = withSpring(0);
    backdropOpacity.value = withTiming(0);
    callback();
  };

  const mainButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const styles = createStyles(currentTheme, insets);

  return (
    <View style={styles.container}>
      {/* Backdrop with Real Blur Effect */}
      <AnimatedTouchableOpacity
        style={[styles.backdrop, backdropAnimatedStyle]}
        onPress={toggleFAB}
        activeOpacity={1}
      >
        {/* Simulated Blur Effect - Multiple Layers */}
        <Animated.View style={[styles.blurLayer1, backdropAnimatedStyle]} />
        <Animated.View style={[styles.blurLayer2, backdropAnimatedStyle]} />
        <Animated.View style={[styles.blurLayer3, backdropAnimatedStyle]} />
        <Animated.View style={[styles.finalOverlay, backdropAnimatedStyle]} />
      </AnimatedTouchableOpacity>

      {/* Menu Items Container */}
      <View style={styles.menuContainer}>
        {/* Journal Entry Button */}
        <MenuButton
          key="journal-entry"
          icon="edit"
          onPress={() => handleMenuItemPress(onJournalEntry)}
          delay={0}
          isExpanded={isExpanded}
          theme={currentTheme}
          position={2}
          isDark={isDarkTheme(currentTheme)}
        />

        {/* Media Entry Button */}
        <MenuButton
          key="media-entry"
          icon="media"
          onPress={() => handleMenuItemPress(onMediaEntry)}
          delay={50}
          isExpanded={isExpanded}
          theme={currentTheme}
          position={1}
          isDark={isDarkTheme(currentTheme)}
        />

        {/* Customize Button */}
        <MenuButton
          key="customize"
          icon="customize"
          onPress={() => handleMenuItemPress(onCustomize)}
          delay={100}
          isExpanded={isExpanded}
          theme={currentTheme}
          position={0}
          isDark={isDarkTheme(currentTheme)}
        />

        {/* Main FAB Button */}
        <AnimatedTouchableOpacity
          style={[styles.fabButton, mainButtonAnimatedStyle]}
          onPress={toggleFAB}
          activeOpacity={0.8}
        >
          <Icon name="plus" size="lg" color="#FFFFFF" />
        </AnimatedTouchableOpacity>
      </View>
    </View>
  );
});

const createStyles = (theme: any, insets: any) => {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      top: 0,
      pointerEvents: 'box-none',
      zIndex: 10000,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    // Simulated blur effect - Layer 1: Base darkening
    blurLayer1: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    // Layer 2: Subtle texture with very light pattern
    blurLayer2: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 10, 20, 0.15)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    // Layer 3: Depth enhancement
    blurLayer3: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
    },
    // Final overlay: Subtle tint for depth
    finalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    menuContainer: {
      position: 'absolute',
      bottom: 24 + insets.bottom + 80, // Add tab bar height (~80px)
      right: 24,
      alignItems: 'center',
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      zIndex: 9999,
    },
  });
};

const createMenuButtonStyles = (theme: any, isDark: boolean) => {
  return StyleSheet.create({
    menuButton: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.secondaryColor || theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 999,
      // Subtle frosted glass border effect
      borderWidth: 1,
      borderColor: isDark 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.6)',
      // Add subtle backdrop effect to menu buttons
      opacity: 0.95,
    },
  });
};

export default FloatingActionButton;