import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconName = 
  // Navigation
  | 'user' | 'discover' | 'settings' | 'question' | 'construction'
  // Journal & Writing
  | 'book' | 'edit' | 'post' | 'palette' | 'check' | 'calendar' 
  // Social & Sharing
  | 'heart' | 'camera' | 'share' | 'globe' | 'lock' | 'active' | 'public' | 'private'
  // Social Platforms
  | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'website' | 'link'
  // Actions
  | 'new-entry' | 'customize' | 'media' | 'close' | 'rocket'
  // Stickers/Emotions
  | 'smile' | 'tree' | 'flower' | 'sun' | 'moon' | 'star' | 'lightning' | 'arrow-right' | 'warning' | 'fire';

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  style?: any;
}

const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

const Icon: React.FC<IconProps> = ({ name, size = 'md', color = '#333', style }) => {
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];
  const getIconPath = (iconName: IconName): React.ReactElement => {
    switch (iconName) {
      // Navigation Icons
      case 'user':
        return (
          <>
            <Circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'discover':
        return (
          <>
            <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="12" cy="10" r="3" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                  fill="none" stroke={color} strokeWidth="1.5"/>
          </>
        );
      
      case 'settings':
        return (
          <>
            <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" 
                  fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'question':
        return (
          <>
            <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m0 4h.01" 
                  fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </>
        );
      
      case 'construction':
        return (
          <>
            <Path d="M9.5 2l8 8-2 2-8-8 2-2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
            <Path d="M6.5 6L2 10.5 13.5 22 18 17.5 6.5 6z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
          </>
        );

      // Journal & Writing Icons
      case 'book':
        return (
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15zM6.5 2H20v11H6.5a1 1 0 0 1 0-2H18V4H6.5a1.5 1.5 0 0 0 0 3" 
                fill={color}/>
        );
      
      case 'edit':
        return (
          <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.5-9.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" 
                fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'post':
        return (
          <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4m4-4v12" 
                fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'palette':
        return (
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.55-.22-1.05-.59-1.41-.36-.36-.59-.86-.59-1.41 0-1.1.9-2 2-2h2.76C19.24 15.16 22 12.92 22 10c0-5.52-4.48-10-10-10zM7.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-4c-.83 0-1.5-.67-1.5-1.5S9.67 7 10.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3 0c-.83 0-1.5-.67-1.5-1.5S12.67 7 13.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" 
                fill={color}/>
        );
      
      case 'check':
        return (
          <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'calendar':
        return (
          <>
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M16 2v4M8 2v4M3 10h18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        );

      // Social & Sharing Icons
      case 'heart':
        return (
          <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                fill={color}/>
        );
      
      case 'camera':
        return (
          <>
            <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" 
                  fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="12" cy="13" r="4" fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'share':
        return (
          <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-16-4l8-4 8 4" 
                fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'globe':
        return (
          <>
            <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M8 12h8M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" 
                  fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'lock':
        return (
          <>
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        );
      
      case 'active':
        return (
          <Circle cx="12" cy="12" r="6" fill={color}/>
        );

      // Social Platform Icons
      case 'instagram':
        return (
          <>
            <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="17.5" cy="6.5" r="1.5" fill={color}/>
          </>
        );
      
      case 'twitter':
        return (
          <Path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" 
                fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'tiktok':
        return (
          <Path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'youtube':
        return (
          <>
            <Path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" 
                  fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill={color}/>
          </>
        );
      
      case 'website':
        return (
          <>
            <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" 
                  fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'link':
        return (
          <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" 
                fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );

      // Action Icons
      case 'new-entry':
        return (
          <Path d="M12 5v14m-7-7h14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'customize':
        return (
          <>
            <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" 
                  fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'media':
        return (
          <>
            <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke={color} strokeWidth="2"/>
            <Circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
            <Path d="M21 15l-5-5L5 21" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </>
        );

      // Sticker/Emotion Icons (simplified)
      case 'smile':
        return (
          <>
            <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        );
      
      case 'tree':
        return (
          <Path d="M12 22V8M8 6a4 4 0 0 0 8 0c0-2-2-4-4-4s-4 2-4 4zM12 8c0-2 2-4 4-4s4 2 4 4-2 4-4 4M12 8c0-2-2-4-4-4S4 6 4 8s2 4 4 4" 
                fill="none" stroke={color} strokeWidth="2"/>
        );
      
      case 'flower':
        return (
          <>
            <Circle cx="12" cy="12" r="2" fill={color}/>
            <Path d="M12 2a3 3 0 0 0-3 3c0 1.5 1.35 3 3 3s3-1.5 3-3a3 3 0 0 0-3-3zM12 16a3 3 0 0 0-3 3c0 1.5 1.35 3 3 3s3-1.5 3-3a3 3 0 0 0-3-3zM3 12c0-1.66 1.34-3 3-3 1.5 0 3 1.35 3 3s-1.5 3-3 3c-1.66 0-3-1.34-3-3zM15 12c0-1.66 1.34-3 3-3 1.5 0 3 1.35 3 3s-1.5 3-3 3c-1.66 0-3-1.34-3-3z" 
                  fill="none" stroke={color} strokeWidth="2"/>
          </>
        );
      
      case 'sun':
        return (
          <>
            <Circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
                  fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        );
      
      case 'moon':
        return (
          <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke={color} strokeWidth="2"/>
        );
      
      case 'star':
        return (
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                fill={color}/>
        );
      
      case 'lightning':
        return (
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color}/>
        );
      
      case 'arrow-right':
        return (
          <Path d="M5 12h14m-7-7l7 7-7 7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      
      case 'warning':
        return (
          <>
            <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" 
                  fill="none" stroke={color} strokeWidth="2"/>
            <Path d="M12 9v4M12 17h.01" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        );
      
      case 'fire':
        return (
          <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 2 7.5a4.5 4.5 0 0 1-9 0c0-1.38.5-2.5 1-3.5z" 
                fill={color}/>
        );

      case 'close':
        return (
          <Path d="M18 6L6 18M6 6L18 18" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round"/>
        );

      case 'rocket':
        return (
          <Path d="M4.5 16.5c-1.5 1.232-1.5 3.5-1.5 3.5s2.268 0 3.5-1.5c.478-.32 1.5 0 2.5 0s1.5-.5 1.5-.5-1.232-2.268-3.5-3.5c-.478-.32-2.5-1.5-2.5 1.5zm2.12-1.5L18 3.5c.5-.5.5-1 0-1.5s-1-.5-1.5 0L5 13.38c-.5.5-.38 1.12 0 1.5s1-.5 1.62-.88z" 
                fill={color}/>
        );

      case 'public':
        return (
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" 
                fill={color}/>
        );

      case 'private':
        return (
          <Path d="M12 1C8.31 1 5.07 3.55 5.07 7.89V10H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V12c0-1.1-.9-2-2-2h-1.07V7.89C18.93 3.55 15.69 1 12 1zm6 21H6V12h12v10zm-8-14.89C10 5.13 10.9 3 12 3s2 2.13 2 4.89V10h-4V7.89z" 
                fill={color}/>
        );
      
      default:
        return <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/>;
    }
  };

  return (
    <View style={[styles.iconContainer, style]}>
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
        {getIconPath(name)}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Icon;