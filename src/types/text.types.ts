export interface TextLine {
  text: string;
  segments: TextSegment[];
  lineHeight: number;
  yPosition: number;
  lineIndex: number;
}

export interface TextSegment {
  text: string;
  startX: number;
  endX: number;
  width: number;
  wordIndices: { start: number; end: number };
}

export interface LineSegment {
  startX: number;
  endX: number;
  width: number;
  isAvailable: boolean;
}

export interface Obstacle {
  id: string;
  bounds: Rectangle;
  type: 'sticker' | 'image' | 'shape';
  margin: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextLayoutResult {
  lines: TextLine[];
  totalHeight: number;
  overflow: boolean;
  wordCount: number;
}

export interface CursorPosition {
  lineIndex: number;
  segmentIndex: number;
  charIndex: number;
  x: number;
  y: number;
}

export interface TextMeasurement {
  width: number;
  height: number;
  lines: number;
}

export interface WordInfo {
  text: string;
  width: number;
  startIndex: number;
  endIndex: number;
}

export interface FittedText {
  words: WordInfo[];
  segment: LineSegment;
  overflow: WordInfo[];
}