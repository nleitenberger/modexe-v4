import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useOrientation } from '../../utils/useOrientation';
import { useTheme } from '../../contexts/ThemeContext';
import JournalEditor from '../journal/JournalEditor';
import ModSpaceProfile from '../modspace/ModSpaceProfile';
import Icon, { IconName } from '../common/Icon';

// Placeholder component for future screens
const PlaceholderScreen: React.FC = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    }}>
      <Icon name="construction" size="xl" color="#666" style={{ marginBottom: 8 }} />
      <Text style={{ fontSize: 18, color: '#666' }}>
        Coming Soon!
      </Text>
    </View>
  );
};

// Minimalistic SVG icons
const TabIcons: Record<string, IconName> = {
  modspace: 'user',
  discover: 'discover',
  settings: 'settings',
  fab: 'plus',
};

export type MainTabParamList = {
  ModSpace: undefined;
  Discover: undefined;
  Settings: undefined;
  FAB?: undefined; // Optional - only shown in landscape
};

export type RootStackParamList = {
  MainTabs: undefined;
  JournalEditor: undefined;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Animated Menu Button Component (same as portrait FAB)
interface MenuButtonProps {
  icon: 'edit' | 'media' | 'customize';
  onPress: () => void;
  delay: number;
  isExpanded: boolean;
  theme: any;
  position: number;
  isDark: boolean;
}

const LandscapeMenuButton: React.FC<MenuButtonProps> = ({ 
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
      // Expand vertically upward (same as portrait)
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

  const buttonStyles = createLandscapeMenuButtonStyles(theme, isDark);

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

// Simple FAB Tab Component - just shows empty screen
const FABTabComponent: React.FC = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <Text style={{ fontSize: 16, color: '#666' }}>
        Tap the FAB button below to get started
      </Text>
    </View>
  );
};

// Themed styles for landscape FAB
const createLandscapeFABStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuContainer: {
      alignItems: 'center',
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primaryColor || '#007AFF',
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

// Themed styles for landscape menu buttons  
const createLandscapeMenuButtonStyles = (theme: any, isDark: boolean) => {
  return StyleSheet.create({
    menuButton: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.secondaryColor || theme.primaryColor || '#007AFF',
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

// Themed styles for landscape FAB overlay
const createLandscapeFABOverlayStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      top: 0,
      pointerEvents: 'box-none',
      zIndex: 99999,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuContainer: {
      position: 'absolute',
      bottom: 10, // Move down very close to tab bar
      right: 140, // Move even further left to perfectly center above the FAB tab
      alignItems: 'center',
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primaryColor || '#007AFF',
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
      zIndex: 99998,
    },
  });
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Landscape FAB Overlay Component
const LandscapeFABOverlay: React.FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  const { currentTheme } = useTheme();
  const navigation = useNavigation();

  // Helper function to detect if theme is dark
  const isDarkTheme = (theme: any) => {
    const bgColor = theme.backgroundColor || '#FFFFFF';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  // Animation values
  const rotation = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
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
  }, [isVisible]);

  const handleMenuItemPress = (callback: () => void) => {
    onClose();
    callback();
  };

  const handleJournalEntry = () => {
    navigation.navigate('JournalEditor' as never);
  };

  const handleMediaEntry = () => {
    Alert.alert('Media Entry', 'Coming soon!');
  };

  const handleCustomize = () => {
    navigation.navigate('ModSpace' as never);
  };

  const mainButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const styles = createLandscapeFABOverlayStyles(currentTheme);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <AnimatedTouchableOpacity
        style={[styles.backdrop, backdropAnimatedStyle]}
        onPress={onClose}
        activeOpacity={1}
      >
        <Animated.View style={[styles.blurOverlay, backdropAnimatedStyle]} />
      </AnimatedTouchableOpacity>

      {/* Menu Items Container - positioned over tab bar */}
      <View style={styles.menuContainer}>
        {/* Journal Entry Button */}
        <LandscapeMenuButton
          key="journal-entry"
          icon="edit"
          onPress={() => handleMenuItemPress(handleJournalEntry)}
          delay={0}
          isExpanded={isVisible}
          theme={currentTheme}
          position={2}
          isDark={isDarkTheme(currentTheme)}
        />

        {/* Media Entry Button */}
        <LandscapeMenuButton
          key="media-entry"
          icon="media"
          onPress={() => handleMenuItemPress(handleMediaEntry)}
          delay={50}
          isExpanded={isVisible}
          theme={currentTheme}
          position={1}
          isDark={isDarkTheme(currentTheme)}
        />

        {/* Customize Button */}
        <LandscapeMenuButton
          key="customize"
          icon="customize"
          onPress={() => handleMenuItemPress(handleCustomize)}
          delay={100}
          isExpanded={isVisible}
          theme={currentTheme}
          position={0}
          isDark={isDarkTheme(currentTheme)}
        />

        {/* Main FAB Button */}
        <AnimatedTouchableOpacity
          style={[styles.fabButton, mainButtonAnimatedStyle]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Icon name="plus" size="lg" color="#FFFFFF" />
        </AnimatedTouchableOpacity>
      </View>
    </View>
  );
};

// Tab Navigator Component
const TabNavigator: React.FC = () => {
  const { isPortrait, isLandscape } = useOrientation();
  const { currentTheme } = useTheme();
  const [showLandscapeFAB, setShowLandscapeFAB] = useState(false);

  // Close landscape FAB menu when orientation changes to portrait
  React.useEffect(() => {
    if (isPortrait && showLandscapeFAB) {
      setShowLandscapeFAB(false);
    }
  }, [isPortrait, showLandscapeFAB]);

  return (
    <>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const iconName = TabIcons[route.name] || 'question';

          return (
            <Icon
              name={iconName}
              size="lg"
              color={focused ? color : '#999'}
              style={{ opacity: focused ? 1 : 0.7 }}
            />
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: isPortrait ? 85 : 65,
          paddingBottom: isPortrait ? 20 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
      initialRouteName="ModSpace"
    >
      <Tab.Screen 
        name="ModSpace" 
        component={ModSpaceProfile}
        options={{
          title: 'ModSpace',
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={PlaceholderScreen}
        options={{
          title: 'Discover',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={PlaceholderScreen}
        options={{
          title: 'Settings',
        }}
      />
      {isLandscape && (
        <Tab.Screen 
          name="FAB" 
          component={FABTabComponent}
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <TouchableOpacity
                onPress={() => setShowLandscapeFAB(true)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: currentTheme.primaryColor || '#007AFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: focused ? 6 : 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: focused ? 3 : 2 },
                  shadowOpacity: focused ? 0.27 : 0.25,
                  shadowRadius: focused ? 4.65 : 4,
                  opacity: focused ? 1 : 0.8,
                }}
              >
                <Icon name="plus" size="lg" color="#FFFFFF" />
              </TouchableOpacity>
            ),
          }}
        />
      )}
    </Tab.Navigator>
    
    {/* Landscape FAB Overlay */}
    {isLandscape && (
      <LandscapeFABOverlay 
        isVisible={showLandscapeFAB}
        onClose={() => setShowLandscapeFAB(false)}
      />
    )}
  </>
  );
};

// Main Navigator with Stack
const MainNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="MainTabs"
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
        />
        <Stack.Screen 
          name="JournalEditor" 
          component={JournalEditor}
          options={{
            headerShown: true,
            headerTitle: 'Journal Editor',
            headerTintColor: '#007AFF',
            headerStyle: {
              backgroundColor: '#f8f8f8',
              shadowColor: 'transparent',
              elevation: 0,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
