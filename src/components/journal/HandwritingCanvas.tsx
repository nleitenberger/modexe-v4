import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HandwritingStroke, HandwritingCanvasRef, DrawingTool, HandwritingPoint } from '../../types/handwriting.types';
import { HANDWRITING_LAYER_Z_INDEX } from '../../constants/layers';
import { generateUniqueId } from '../../utils/uniqueId';

interface HandwritingCanvasProps {
  width: number;
  height: number;
  isVisible: boolean;
  isInteractive: boolean;
  initialStrokes?: HandwritingStroke[];
  selectedTool?: DrawingTool;
  selectedColor?: string;
  strokeWidth?: number;
  onStrokesChange?: (strokes: HandwritingStroke[]) => void;
}

const HandwritingCanvas = forwardRef<HandwritingCanvasRef, HandwritingCanvasProps>(
  (
    {
      width,
      height,
      isVisible,
      isInteractive,
      initialStrokes = [],
      selectedTool = DrawingTool.PEN,
      selectedColor = '#000000',
      strokeWidth = 2,
      onStrokesChange,
    },
    ref
  ) => {
    const [currentStrokes, setCurrentStrokes] = useState<HandwritingStroke[]>(initialStrokes);
    const [currentPath, setCurrentPath] = useState<HandwritingPoint[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Convert points to SVG path string
    const pointsToSVGPath = (points: HandwritingPoint[]): string => {
      if (points.length === 0) return '';
      
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
      return path;
    };

    // Handle touch events
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => isInteractive,
      onMoveShouldSetPanResponder: () => isInteractive,
      onStartShouldSetPanResponderCapture: () => isInteractive,
      onMoveShouldSetPanResponderCapture: () => isInteractive,

      onPanResponderGrant: (event) => {
        if (!isInteractive) return;
        
        const { locationX, locationY } = event.nativeEvent;
        const newPoint: HandwritingPoint = {
          x: locationX,
          y: locationY,
          pressure: (event.nativeEvent as any).force || 1,
        };
        
        setCurrentPath([newPoint]);
        setIsDrawing(true);
      },

      onPanResponderMove: (event) => {
        if (!isInteractive || !isDrawing) return;
        
        const { locationX, locationY } = event.nativeEvent;
        const newPoint: HandwritingPoint = {
          x: locationX,
          y: locationY,
          pressure: (event.nativeEvent as any).force || 1,
        };
        
        setCurrentPath(prev => [...prev, newPoint]);
      },

      onPanResponderRelease: () => {
        if (!isInteractive || !isDrawing || currentPath.length === 0) return;
        
        const newStroke: HandwritingStroke = {
          id: generateUniqueId(),
          points: currentPath,
          tool: selectedTool,
          color: selectedColor,
          strokeWidth: strokeWidth,
          timestamp: new Date(),
        };
        
        const updatedStrokes = [...currentStrokes, newStroke];
        setCurrentStrokes(updatedStrokes);
        setCurrentPath([]);
        setIsDrawing(false);
        
        if (onStrokesChange) {
          onStrokesChange(updatedStrokes);
        }
      },
    });

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      undo: async () => {
        if (currentStrokes.length > 0) {
          const newStrokes = currentStrokes.slice(0, -1);
          setCurrentStrokes(newStrokes);
          if (onStrokesChange) {
            onStrokesChange(newStrokes);
          }
        }
      },

      redo: async () => {
        // Simple redo - would need more complex undo/redo stack for full implementation
      },

      clear: async () => {
        setCurrentStrokes([]);
        setCurrentPath([]);
        if (onStrokesChange) {
          onStrokesChange([]);
        }
      },

      save: async (): Promise<string> => {
        // Would need to implement SVG to base64 conversion
        return '';
      },

      getStrokes: () => {
        return currentStrokes;
      },

      setStrokes: (strokes: HandwritingStroke[]) => {
        setCurrentStrokes(strokes);
      },
    }));

    if (!isVisible) {
      return null;
    }

    return (
      <View 
        style={[
          styles.container, 
          { 
            width, 
            height,
            zIndex: HANDWRITING_LAYER_Z_INDEX,
            pointerEvents: isInteractive ? 'auto' : 'none'
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={height} style={styles.canvas}>
          {/* Render completed strokes */}
          {currentStrokes.map((stroke) => (
            <Path
              key={stroke.id}
              d={pointsToSVGPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          
          {/* Render current drawing path */}
          {currentPath.length > 0 && (
            <Path
              d={pointsToSVGPath(currentPath)}
              stroke={selectedColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

HandwritingCanvas.displayName = 'HandwritingCanvas';

export default HandwritingCanvas;