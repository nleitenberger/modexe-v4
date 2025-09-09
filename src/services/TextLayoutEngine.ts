import {
  TextLine,
  TextSegment,
  LineSegment,
  Obstacle,
  Rectangle,
  TextLayoutResult,
  CursorPosition,
  WordInfo,
  FittedText,
} from '../types/text.types';
import { TextStyle } from '../types/journal.types';
import { StickerInstance } from '../types/sticker.types';
import { textMeasurer } from '../utils/textMeasurement';
import { rectanglesOverlap, expandRectangle } from '../utils/geometry';

export class TextLayoutEngine {
  private textStyle: TextStyle;
  private pageWidth: number;
  private pageHeight: number;

  constructor(textStyle: TextStyle, pageWidth: number, pageHeight: number = 1000) {
    this.textStyle = textStyle;
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
  }

  /**
   * Main method to calculate text flow around obstacles (stickers)
   */
  async calculateTextFlow(text: string, obstacles: Obstacle[]): Promise<TextLayoutResult> {
    const words = this.tokenizeText(text);
    const wordInfos = textMeasurer.measureWords(words, this.textStyle);
    const lineHeight = textMeasurer.getLineHeight(this.textStyle);

    const lines: TextLine[] = [];
    let currentY = 0;
    let wordIndex = 0;
    let lineIndex = 0;

    while (wordIndex < wordInfos.length && currentY < this.pageHeight) {
      const lineObstacles = this.getObstaclesForLine(obstacles, currentY, lineHeight);
      const availableSegments = this.getAvailableLineSegments(currentY, lineObstacles);
      
      const fittedText = this.fitWordsToLineSegments(
        wordInfos.slice(wordIndex), 
        availableSegments
      );

      if (fittedText.words.length === 0 && availableSegments.length > 0) {
        // No words fit, move to next line
        currentY += lineHeight;
        lineIndex++;
        continue;
      }

      if (fittedText.words.length === 0) {
        // No space available, text overflows
        break;
      }

      const line = this.createTextLine(
        fittedText.words,
        currentY,
        lineHeight,
        lineIndex,
        availableSegments
      );

      lines.push(line);
      wordIndex += fittedText.words.length;
      currentY += lineHeight;
      lineIndex++;
    }

    return {
      lines,
      totalHeight: currentY,
      overflow: wordIndex < wordInfos.length,
      wordCount: wordIndex,
    };
  }

  /**
   * Tokenize text into words
   */
  private tokenizeText(text: string): string[] {
    return text.trim().split(/\s+/).filter(word => word.length > 0);
  }

  /**
   * Get obstacles that intersect with a specific line
   */
  private getObstaclesForLine(obstacles: Obstacle[], lineY: number, lineHeight: number): Obstacle[] {
    const lineRect: Rectangle = {
      x: 0,
      y: lineY,
      width: this.pageWidth,
      height: lineHeight,
    };

    const intersectingObstacles = obstacles.filter(obstacle => {
      const expandedObstacle = expandRectangle(obstacle.bounds, obstacle.margin);
      return rectanglesOverlap(lineRect, expandedObstacle);
    });

    return intersectingObstacles;
  }

  /**
   * Calculate available segments on a line, considering obstacles
   */
  getAvailableLineSegments(lineY: number, obstacles: Obstacle[]): LineSegment[] {
    const segments: LineSegment[] = [];
    const lineHeight = textMeasurer.getLineHeight(this.textStyle);

    // Start with the full line
    let currentX = 0;
    const lineEnd = this.pageWidth;

    // Sort obstacles by x position
    const sortedObstacles = obstacles
      .map(obstacle => expandRectangle(obstacle.bounds, obstacle.margin))
      .sort((a, b) => a.x - b.x);

    for (const obstacle of sortedObstacles) {
      // Add segment before obstacle
      if (obstacle.x > currentX) {
        segments.push({
          startX: currentX,
          endX: obstacle.x,
          width: obstacle.x - currentX,
          isAvailable: true,
        });
      }

      // Update current position to after obstacle
      currentX = Math.max(currentX, obstacle.x + obstacle.width);
    }

    // Add final segment after last obstacle
    if (currentX < lineEnd) {
      segments.push({
        startX: currentX,
        endX: lineEnd,
        width: lineEnd - currentX,
        isAvailable: true,
      });
    }

    return segments.filter(segment => segment.width > 0);
  }

  /**
   * Fit words into available line segments
   */
  fitWordsToLineSegments(words: WordInfo[], segments: LineSegment[]): FittedText {
    const fittedWords: WordInfo[] = [];
    const overflow: WordInfo[] = [];
    let wordIndex = 0;

    for (const segment of segments) {
      let segmentWidth = 0;
      const segmentWords: WordInfo[] = [];

      while (wordIndex < words.length) {
        const word = words[wordIndex];
        const spaceWidth = segmentWords.length > 0 ? this.getSpaceWidth() : 0;
        const totalWidth = segmentWidth + spaceWidth + word.width;

        if (totalWidth <= segment.width) {
          segmentWords.push(word);
          segmentWidth = totalWidth;
          wordIndex++;
        } else {
          break;
        }
      }

      fittedWords.push(...segmentWords);

      if (wordIndex >= words.length) {
        break;
      }
    }

    // Add remaining words to overflow
    overflow.push(...words.slice(wordIndex));

    return {
      words: fittedWords,
      segment: segments[0] || { startX: 0, endX: this.pageWidth, width: this.pageWidth, isAvailable: true },
      overflow,
    };
  }

  /**
   * Create a TextLine object from fitted words
   */
  private createTextLine(
    words: WordInfo[],
    yPosition: number,
    lineHeight: number,
    lineIndex: number,
    segments: LineSegment[]
  ): TextLine {
    const textSegments: TextSegment[] = [];
    let wordIndex = 0;

    for (const segment of segments) {
      const segmentWords: WordInfo[] = [];
      let segmentWidth = 0;

      // Collect words that fit in this segment
      while (wordIndex < words.length) {
        const word = words[wordIndex];
        const spaceWidth = segmentWords.length > 0 ? this.getSpaceWidth() : 0;
        const totalWidth = segmentWidth + spaceWidth + word.width;

        if (totalWidth <= segment.width) {
          segmentWords.push(word);
          segmentWidth = totalWidth;
          wordIndex++;
        } else {
          break;
        }
      }

      if (segmentWords.length > 0) {
        const segmentText = segmentWords.map(w => w.text).join(' ');
        textSegments.push({
          text: segmentText,
          startX: segment.startX,
          endX: segment.startX + segmentWidth,
          width: segmentWidth,
          wordIndices: {
            start: segmentWords[0].startIndex,
            end: segmentWords[segmentWords.length - 1].endIndex,
          },
        });
      }

      if (wordIndex >= words.length) {
        break;
      }
    }

    const fullText = words.map(w => w.text).join(' ');

    return {
      text: fullText,
      segments: textSegments,
      lineHeight,
      yPosition,
      lineIndex,
    };
  }

  /**
   * Get cursor position from coordinates
   */
  getCursorPositionFromCoordinates(x: number, y: number, lines: TextLine[]): CursorPosition {
    // Find the line
    const lineIndex = Math.floor(y / textMeasurer.getLineHeight(this.textStyle));
    const line = lines[lineIndex] || lines[lines.length - 1];

    if (!line) {
      return { lineIndex: 0, segmentIndex: 0, charIndex: 0, x: 0, y: 0 };
    }

    // Find the segment
    let segmentIndex = 0;
    for (let i = 0; i < line.segments.length; i++) {
      const segment = line.segments[i];
      if (x >= segment.startX && x <= segment.endX) {
        segmentIndex = i;
        break;
      }
    }

    const segment = line.segments[segmentIndex] || line.segments[0];
    if (!segment) {
      return { lineIndex, segmentIndex: 0, charIndex: 0, x: 0, y: line.yPosition };
    }

    // Estimate character position within segment
    const relativeX = x - segment.startX;
    const averageCharWidth = segment.width / segment.text.length;
    const charIndex = Math.round(relativeX / averageCharWidth);

    return {
      lineIndex,
      segmentIndex,
      charIndex: Math.max(0, Math.min(charIndex, segment.text.length)),
      x: segment.startX + charIndex * averageCharWidth,
      y: line.yPosition,
    };
  }

  /**
   * Convert stickers to obstacles
   */
  static stickersToObstacles(stickers: StickerInstance[], pageId: string, containerBounds?: { x: number; y: number }): Obstacle[] {
    const offsetX = containerBounds?.x || 0;
    const offsetY = containerBounds?.y || 0;
    
    return stickers
      .filter(sticker => sticker.pageId === pageId)
      .map(sticker => {
        // Account for sticker scaling and rotation
        const baseSize = 40; // Base sticker size from DraggableSticker
        const actualWidth = baseSize * sticker.scale;
        const actualHeight = baseSize * sticker.scale;
        
        return {
          id: sticker.id,
          bounds: {
            x: sticker.position.x - offsetX,
            y: sticker.position.y - offsetY,
            width: actualWidth,
            height: actualHeight,
          },
          type: 'sticker' as const,
          margin: 12, // Increased margin for better text spacing
        };
      });
  }

  /**
   * Estimate space width
   */
  private getSpaceWidth(): number {
    // More accurate space width calculation based on font size
    return this.textStyle.fontSize * 0.25; // Typical space character width
  }

}