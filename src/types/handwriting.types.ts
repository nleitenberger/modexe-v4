/**
 * Handwriting and drawing types for journal pages
 */

export interface HandwritingStroke {
  id: string;
  points: HandwritingPoint[];
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  timestamp: Date;
}

export interface HandwritingPoint {
  x: number;
  y: number;
  pressure?: number; // Apple Pencil pressure sensitivity
  tilt?: {
    x: number;
    y: number;
  };
}

export enum DrawingTool {
  PEN = 'pen',
  PENCIL = 'pencil',
  MARKER = 'marker',
  MONOLINE = 'monoline',
  FOUNTAIN_PEN = 'fountainPen',
  WATERCOLOR = 'watercolor',
  CRAYON = 'crayon',
  ERASER = 'eraser'
}

export interface DrawingToolConfig {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface HandwritingState {
  isHandwritingMode: boolean;
  selectedTool: DrawingTool;
  selectedColor: string;
  strokeWidth: number;
  opacity: number;
  rulerVisible: boolean;
  undoStack: HandwritingStroke[][];
  redoStack: HandwritingStroke[][];
}

export interface HandwritingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  save: () => Promise<string>; // Returns base64 image
  getStrokes: () => HandwritingStroke[];
  setStrokes: (strokes: HandwritingStroke[]) => void;
}