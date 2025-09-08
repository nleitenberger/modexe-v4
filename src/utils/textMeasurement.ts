import { TextStyle } from '../types/journal.types';
import { TextMeasurement, WordInfo } from '../types/text.types';

export class TextMeasurer {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  constructor() {
    // For React Native, we'll use a different approach since HTMLCanvasElement isn't available
    // This is a placeholder for the web implementation
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
    }
  }

  /**
   * Measures text dimensions using React Native's built-in text measurement
   * Note: This is a simplified version. In a real app, you'd use platform-specific text measurement
   */
  async measureText(text: string, textStyle: TextStyle, maxWidth?: number): Promise<TextMeasurement> {
    // For React Native, we need to use the platform's text measurement
    // This is a simplified estimation based on average character widths
    const averageCharWidth = this.estimateCharWidth(textStyle.fontSize);
    const lineHeight = textStyle.lineHeight;
    
    if (!maxWidth) {
      return {
        width: text.length * averageCharWidth,
        height: lineHeight,
        lines: 1,
      };
    }

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = word.length * averageCharWidth;
      const spaceWidth = averageCharWidth;
      
      if (currentWidth + wordWidth + (currentLine ? spaceWidth : 0) <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
        currentWidth += wordWidth + (currentLine.length > word.length ? spaceWidth : 0);
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
          currentWidth = wordWidth;
        } else {
          // Word is too long for the line, break it
          lines.push(word);
          currentLine = '';
          currentWidth = 0;
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return {
      width: Math.min(maxWidth, Math.max(...lines.map(line => line.length * averageCharWidth))),
      height: lines.length * lineHeight,
      lines: lines.length,
    };
  }

  /**
   * Measures individual words and returns their dimensions
   */
  measureWords(words: string[], textStyle: TextStyle): WordInfo[] {
    const averageCharWidth = this.estimateCharWidth(textStyle.fontSize);
    
    return words.map((word, index) => ({
      text: word,
      width: word.length * averageCharWidth,
      startIndex: index,
      endIndex: index,
    }));
  }

  /**
   * Estimates character width based on font size
   * This is a rough approximation for demo purposes
   */
  private estimateCharWidth(fontSize: number): number {
    return fontSize * 0.6; // Approximate character width ratio
  }

  /**
   * Gets line height from text style
   */
  getLineHeight(textStyle: TextStyle): number {
    return textStyle.lineHeight;
  }
}

// Singleton instance
export const textMeasurer = new TextMeasurer();