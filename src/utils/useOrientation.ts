import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

export interface ScreenDimensions {
  width: number;
  height: number;
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
}

export const useOrientation = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    const orientation: Orientation = width < height ? 'portrait' : 'landscape';
    
    return {
      width,
      height,
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width, height } = window;
      const orientation: Orientation = width < height ? 'portrait' : 'landscape';
      
      setDimensions({
        width,
        height,
        orientation,
        isPortrait: orientation === 'portrait',
        isLandscape: orientation === 'landscape',
      });
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};