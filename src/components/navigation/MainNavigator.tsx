import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useOrientation } from '../../utils/useOrientation';
import JournalEditor from '../journal/JournalEditor';
import ModSpaceProfile from '../modspace/ModSpaceProfile';
import Icon, { IconName } from '../common/Icon';

// Minimalistic SVG icons
const TabIcons: Record<string, IconName> = {
  modspace: 'user',
  discover: 'discover',
  settings: 'settings',
};

export type MainTabParamList = {
  ModSpace: undefined;
  Discover: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  JournalEditor: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Tab Navigator Component
const TabNavigator: React.FC = () => {
  const { isPortrait } = useOrientation();

  return (
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
    </Tab.Navigator>
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

export default MainNavigator;
