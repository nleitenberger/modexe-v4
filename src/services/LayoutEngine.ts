import { SharedJournalEntry, LayoutConfig, LayoutType, EntryPosition } from '../types/modspace.types';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface LayoutCalculation {
  type: 'grid' | 'timeline' | 'magazine' | 'minimal' | 'creative';
  positions: EntryPosition[];
  canvasSize: { width: number; height: number };
  metadata: {
    columns?: number;
    totalHeight: number;
    featuredEntries?: string[];
    dateGroups?: { [key: string]: string[] };
  };
}

export interface CollisionDetection {
  hasCollision: boolean;
  collidingEntries: string[];
  suggestions: EntryPosition[];
}

export class LayoutEngine {
  
  /**
   * Calculate layout positions for entries based on layout type
   */
  static calculateLayout(
    entries: SharedJournalEntry[],
    layoutType: LayoutType,
    isPortrait: boolean = true
  ): LayoutCalculation {
    switch (layoutType.id) {
      case 'grid':
        return this.calculateGridLayout(entries, layoutType.config, isPortrait);
      case 'timeline':
        return this.calculateTimelineLayout(entries, layoutType.config, isPortrait);
      case 'magazine':
        return this.calculateMagazineLayout(entries, layoutType.config, isPortrait);
      case 'minimal':
        return this.calculateMinimalLayout(entries, layoutType.config, isPortrait);
      case 'creative':
        return this.calculateCreativeLayout(entries, layoutType.config, isPortrait);
      default:
        return this.calculateGridLayout(entries, layoutType.config, isPortrait);
    }
  }

  /**
   * Grid layout calculation
   */
  private static calculateGridLayout(
    entries: SharedJournalEntry[],
    config: LayoutConfig,
    isPortrait: boolean
  ): LayoutCalculation {
    const columns = isPortrait ? Math.min(config.columns || 2, 2) : (config.columns || 3);
    const spacing = config.spacing || 8;
    const availableWidth = screenWidth - (spacing * (columns + 1));
    const itemWidth = availableWidth / columns;

    const positions: EntryPosition[] = [];
    const columnHeights = Array(columns).fill(spacing);

    entries.forEach((entry, index) => {
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Calculate height based on aspect ratio and content
      let height = this.calculateEntryHeight(entry, itemWidth, config);
      
      if (config.aspectRatio === 'square') {
        height = itemWidth;
      } else if (config.aspectRatio === 'portrait') {
        height = itemWidth * 1.4;
      } else if (config.aspectRatio === 'landscape') {
        height = itemWidth * 0.7;
      }

      const position: EntryPosition = {
        entryId: entry.id,
        x: spacing + (shortestColumnIndex * (itemWidth + spacing)),
        y: columnHeights[shortestColumnIndex],
        width: itemWidth,
        height: height,
        zIndex: index,
      };

      positions.push(position);
      columnHeights[shortestColumnIndex] += height + spacing;
    });

    const maxHeight = Math.max(...columnHeights);

    return {
      type: 'grid',
      positions,
      canvasSize: { width: screenWidth, height: maxHeight + spacing },
      metadata: {
        columns,
        totalHeight: maxHeight,
      },
    };
  }

  /**
   * Timeline layout calculation
   */
  private static calculateTimelineLayout(
    entries: SharedJournalEntry[],
    config: LayoutConfig,
    isPortrait: boolean
  ): LayoutCalculation {
    const spacing = config.spacing || 16;
    const padding = 44; // Space for timeline elements
    const itemWidth = screenWidth - (spacing * 2) - padding;

    const positions: EntryPosition[] = [];
    const dateGroups: { [key: string]: string[] } = {};
    let currentY = spacing * 2;

    // Group entries by date
    const groupedEntries = this.groupEntriesByDate(entries);
    const dateGroupKeys = Object.keys(groupedEntries);

    dateGroupKeys.forEach((dateKey, groupIndex) => {
      const entriesForDate = groupedEntries[dateKey];
      dateGroups[dateKey] = entriesForDate.map(e => e.id);

      // Add space for date header
      currentY += 60;

      entriesForDate.forEach((entry) => {
        const height = this.calculateEntryHeight(entry, itemWidth, config);

        const position: EntryPosition = {
          entryId: entry.id,
          x: spacing + padding,
          y: currentY,
          width: itemWidth,
          height: height,
          zIndex: groupIndex * 100 + entriesForDate.indexOf(entry),
        };

        positions.push(position);
        currentY += height + spacing + 40; // Extra space for timeline elements
      });

      // Add space between date groups
      if (groupIndex < dateGroupKeys.length - 1) {
        currentY += spacing;
      }
    });

    return {
      type: 'timeline',
      positions,
      canvasSize: { width: screenWidth, height: currentY + spacing },
      metadata: {
        totalHeight: currentY,
        dateGroups,
      },
    };
  }

  /**
   * Magazine layout calculation (masonry with featured entries)
   */
  private static calculateMagazineLayout(
    entries: SharedJournalEntry[],
    config: LayoutConfig,
    isPortrait: boolean
  ): LayoutCalculation {
    const columns = isPortrait ? Math.min(config.columns || 2, 2) : (config.columns || 3);
    const spacing = config.spacing || 12;
    const availableWidth = screenWidth - (spacing * (columns + 1));
    const itemWidth = availableWidth / columns;

    const positions: EntryPosition[] = [];
    const columnHeights = Array(columns).fill(spacing * 3); // Space for magazine header
    const featuredEntries: string[] = [];

    entries.forEach((entry, index) => {
      const isFeatured = index === 0 || (index % 6 === 0 && index > 0);
      if (isFeatured) {
        featuredEntries.push(entry.id);
      }

      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Calculate height with featured entry variations
      let height = this.calculateEntryHeight(entry, itemWidth, config);
      if (isFeatured) {
        height = Math.max(height, itemWidth * 1.3);
      }

      const position: EntryPosition = {
        entryId: entry.id,
        x: spacing + (shortestColumnIndex * (itemWidth + spacing)),
        y: columnHeights[shortestColumnIndex],
        width: itemWidth,
        height: height,
        zIndex: isFeatured ? 1000 + index : index,
      };

      positions.push(position);
      columnHeights[shortestColumnIndex] += height + spacing;
    });

    const maxHeight = Math.max(...columnHeights);

    return {
      type: 'magazine',
      positions,
      canvasSize: { width: screenWidth, height: maxHeight + spacing },
      metadata: {
        columns,
        totalHeight: maxHeight,
        featuredEntries,
      },
    };
  }

  /**
   * Minimal layout calculation
   */
  private static calculateMinimalLayout(
    entries: SharedJournalEntry[],
    config: LayoutConfig,
    isPortrait: boolean
  ): LayoutCalculation {
    const spacing = config.spacing || 24;
    const padding = spacing;
    const itemWidth = screenWidth - (padding * 2);

    const positions: EntryPosition[] = [];
    let currentY = spacing;

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.shareDate).getTime() - new Date(a.shareDate).getTime()
    );

    sortedEntries.forEach((entry, index) => {
      const height = this.calculateMinimalEntryHeight(entry, config);

      const position: EntryPosition = {
        entryId: entry.id,
        x: padding,
        y: currentY,
        width: itemWidth,
        height: height,
        zIndex: index,
      };

      positions.push(position);
      currentY += height;
      
      // Add border spacing except for last item
      if (index < sortedEntries.length - 1) {
        currentY += 1; // Just the border
      }
    });

    return {
      type: 'minimal',
      positions,
      canvasSize: { width: screenWidth, height: currentY + spacing },
      metadata: {
        totalHeight: currentY,
      },
    };
  }

  /**
   * Creative layout calculation (custom positions)
   */
  private static calculateCreativeLayout(
    entries: SharedJournalEntry[],
    config: LayoutConfig,
    isPortrait: boolean
  ): LayoutCalculation {
    const positions: EntryPosition[] = [];
    const defaultCardWidth = isPortrait ? screenWidth * 0.4 : screenWidth * 0.25;
    const defaultCardHeight = defaultCardWidth * 1.2;
    const spacing = 20;

    entries.forEach((entry, index) => {
      // Check if we have custom positions
      const customPosition = config.customPositions?.find(pos => pos.entryId === entry.id);
      
      if (customPosition) {
        positions.push(customPosition);
      } else {
        // Generate default position
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        const position: EntryPosition = {
          entryId: entry.id,
          x: col * (defaultCardWidth + spacing) + spacing,
          y: row * (defaultCardHeight + spacing) + spacing,
          width: defaultCardWidth,
          height: defaultCardHeight,
          zIndex: index,
        };
        
        positions.push(position);
      }
    });

    // Calculate canvas size based on positions
    const maxX = positions.length > 0 ? Math.max(...positions.map(pos => pos.x + pos.width)) : screenWidth;
    const maxY = positions.length > 0 ? Math.max(...positions.map(pos => pos.y + pos.height)) : screenHeight;

    return {
      type: 'creative',
      positions,
      canvasSize: { 
        width: Math.max(screenWidth, maxX + 40), 
        height: Math.max(screenHeight, maxY + 40) 
      },
      metadata: {
        totalHeight: maxY,
      },
    };
  }

  /**
   * Detect collisions between entries in creative layout
   */
  static detectCollisions(positions: EntryPosition[]): CollisionDetection {
    const collidingEntries: string[] = [];
    const suggestions: EntryPosition[] = [];

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i];
        const pos2 = positions[j];

        if (this.doRectanglesOverlap(pos1, pos2)) {
          if (!collidingEntries.includes(pos1.entryId)) {
            collidingEntries.push(pos1.entryId);
          }
          if (!collidingEntries.includes(pos2.entryId)) {
            collidingEntries.push(pos2.entryId);
          }
        }
      }
    }

    // Generate suggestions for resolving collisions
    collidingEntries.forEach(entryId => {
      const position = positions.find(p => p.entryId === entryId);
      if (position) {
        const suggestion = this.findNearestNonCollidingPosition(position, positions);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    });

    return {
      hasCollision: collidingEntries.length > 0,
      collidingEntries,
      suggestions,
    };
  }

  /**
   * Auto-arrange entries to avoid collisions
   */
  static autoArrangeEntries(positions: EntryPosition[], canvasSize: { width: number; height: number }): EntryPosition[] {
    const arranged: EntryPosition[] = [];
    const gridSize = 20;

    // Sort by z-index to maintain layer order
    const sortedPositions = [...positions].sort((a, b) => a.zIndex - b.zIndex);

    sortedPositions.forEach(position => {
      let newPosition = { ...position };
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        const hasCollision = arranged.some(arranged => 
          this.doRectanglesOverlap(newPosition, arranged)
        );

        if (!hasCollision) {
          arranged.push(newPosition);
          break;
        }

        // Try next grid position
        newPosition.x += gridSize;
        if (newPosition.x + newPosition.width > canvasSize.width) {
          newPosition.x = gridSize;
          newPosition.y += gridSize;
        }
        
        attempts++;
      }

      // If we couldn't find a position, just place it anyway
      if (attempts >= maxAttempts) {
        arranged.push(newPosition);
      }
    });

    return arranged;
  }

  /**
   * Snap position to grid
   */
  static snapToGrid(position: EntryPosition, gridSize: number = 20): EntryPosition {
    return {
      ...position,
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }

  // Utility methods

  private static calculateEntryHeight(entry: SharedJournalEntry, width: number, config: LayoutConfig): number {
    let height = width * 0.6; // Base height
    
    // Add space for title
    const titleLines = Math.ceil(entry.title.length / 30);
    height += titleLines * 20;
    
    // Add space for caption if shown
    if (config.showCaptions && entry.excerpt) {
      const captionLines = Math.ceil(entry.excerpt.length / 50);
      height += captionLines * 16;
    }
    
    // Add space for metadata
    let metadataHeight = 20; // Base padding
    if (config.showStats) metadataHeight += 24;
    if (config.showDates) metadataHeight += 20;
    if (entry.tags.length > 0) metadataHeight += 32;
    
    return height + metadataHeight;
  }

  private static calculateMinimalEntryHeight(entry: SharedJournalEntry, config: LayoutConfig): number {
    let height = 80; // Base height for minimal layout
    
    // Add space for title (larger in minimal layout)
    const titleLines = Math.ceil(entry.title.length / 40);
    height += titleLines * 24;
    
    // Add space for excerpt if shown
    if (config.showCaptions && entry.excerpt) {
      const excerptLines = Math.min(3, Math.ceil(entry.excerpt.length / 60));
      height += excerptLines * 20;
    }
    
    // Add space for tags
    if (entry.tags.length > 0) {
      height += 32;
    }
    
    // Add space for stats if shown
    if (config.showStats) {
      height += 40;
    }
    
    return height;
  }

  private static groupEntriesByDate(entries: SharedJournalEntry[]): { [key: string]: SharedJournalEntry[] } {
    const grouped: { [key: string]: SharedJournalEntry[] } = {};
    
    entries
      .sort((a, b) => new Date(b.shareDate).getTime() - new Date(a.shareDate).getTime())
      .forEach(entry => {
        const dateKey = new Date(entry.shareDate).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(entry);
      });
    
    return grouped;
  }

  private static doRectanglesOverlap(rect1: EntryPosition, rect2: EntryPosition): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
  }

  private static findNearestNonCollidingPosition(
    position: EntryPosition, 
    allPositions: EntryPosition[]
  ): EntryPosition | null {
    const gridSize = 20;
    const maxDistance = 200;
    
    for (let distance = gridSize; distance <= maxDistance; distance += gridSize) {
      // Try positions in a spiral pattern
      const candidates = this.getSpiralPositions(position, distance, gridSize);
      
      for (const candidate of candidates) {
        const testPosition = { ...position, x: candidate.x, y: candidate.y };
        
        const hasCollision = allPositions.some(other => 
          other.entryId !== position.entryId && this.doRectanglesOverlap(testPosition, other)
        );
        
        if (!hasCollision) {
          return testPosition;
        }
      }
    }
    
    return null;
  }

  private static getSpiralPositions(center: EntryPosition, maxDistance: number, step: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    
    for (let distance = step; distance <= maxDistance; distance += step) {
      // Top
      positions.push({ x: center.x, y: center.y - distance });
      // Right
      positions.push({ x: center.x + distance, y: center.y });
      // Bottom
      positions.push({ x: center.x, y: center.y + distance });
      // Left
      positions.push({ x: center.x - distance, y: center.y });
      
      // Diagonals
      positions.push({ x: center.x + distance, y: center.y - distance });
      positions.push({ x: center.x + distance, y: center.y + distance });
      positions.push({ x: center.x - distance, y: center.y + distance });
      positions.push({ x: center.x - distance, y: center.y - distance });
    }
    
    return positions;
  }
}

export default LayoutEngine;