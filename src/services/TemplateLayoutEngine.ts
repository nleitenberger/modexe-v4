import { Dimensions } from 'react-native';
import { EntryPosition, LayoutTemplateType, EntryDisplayMode } from '../types/modspace.types';

const { width: screenWidth } = Dimensions.get('window');

export interface TemplateLayoutOptions {
  template: LayoutTemplateType;
  entryOrder: string[];
  entryDisplayStyles: { [entryId: string]: EntryDisplayMode };
  isPortrait?: boolean;
  containerWidth?: number;
  containerHeight?: number;
}

export class TemplateLayoutEngine {
  private static readonly SPACING = 16;
  private static readonly CARD_PADDING = 12;

  /**
   * Get effective container width and calculate spacing scale
   */
  private static getContainerDimensions(containerWidth?: number, containerHeight?: number) {
    const effectiveWidth = containerWidth || screenWidth;
    const effectiveHeight = containerHeight || 600;
    
    // Scale spacing for preview containers
    const spacingScale = containerWidth ? Math.min(containerWidth / screenWidth, 1) : 1;
    const effectiveSpacing = Math.max(this.SPACING * spacingScale, 4);
    
    return {
      width: effectiveWidth,
      height: effectiveHeight,
      spacing: effectiveSpacing,
    };
  }

  /**
   * Calculate entry positions based on template and settings
   */
  static calculateLayout(options: TemplateLayoutOptions): EntryPosition[] {
    const { template, entryOrder, entryDisplayStyles, isPortrait = true, containerWidth, containerHeight } = options;
    
    switch (template) {
      case 'magazine':
        return this.calculateMagazineLayout(entryOrder, entryDisplayStyles, isPortrait, containerWidth, containerHeight);
      case 'grid':
        return this.calculateGridLayout(entryOrder, entryDisplayStyles, isPortrait, containerWidth, containerHeight);
      case 'timeline':
        return this.calculateTimelineLayout(entryOrder, entryDisplayStyles, isPortrait, containerWidth, containerHeight);
      case 'masonry':
        return this.calculateMasonryLayout(entryOrder, entryDisplayStyles, isPortrait, containerWidth, containerHeight);
      case 'hero':
        return this.calculateHeroLayout(entryOrder, entryDisplayStyles, isPortrait, containerWidth, containerHeight);
      default:
        return this.calculateGridLayout(entryOrder, entryDisplayStyles, isPortrait, containerWidth, containerHeight);
    }
  }

  /**
   * Magazine Layout: Featured entry at top + 2-column grid below
   */
  private static calculateMagazineLayout(
    entryOrder: string[],
    displayStyles: { [entryId: string]: EntryDisplayMode },
    isPortrait: boolean,
    containerWidth?: number,
    containerHeight?: number
  ): EntryPosition[] {
    const positions: EntryPosition[] = [];
    const { width, spacing } = this.getContainerDimensions(containerWidth, containerHeight);
    const availableWidth = width - (spacing * 2);
    
    let currentY = spacing;
    
    entryOrder.forEach((entryId, index) => {
      const displayMode = displayStyles[entryId] || 'card';
      
      if (index === 0) {
        // Featured entry (full width)
        const featuredHeight = this.getCardHeight(displayMode, availableWidth, true, containerWidth);
        positions.push({
          entryId,
          x: spacing,
          y: currentY,
          width: availableWidth,
          height: featuredHeight,
          zIndex: index,
        });
        currentY += featuredHeight + spacing;
      } else {
        // Grid entries (2 columns in portrait, 3 in landscape)
        const columns = isPortrait ? 2 : 3;
        const cardWidth = (availableWidth - (spacing * (columns - 1))) / columns;
        const cardHeight = this.getCardHeight(displayMode, cardWidth, false, containerWidth);
        const col = (index - 1) % columns;
        const row = Math.floor((index - 1) / columns);
        
        positions.push({
          entryId,
          x: spacing + col * (cardWidth + spacing),
          y: currentY + row * (cardHeight + spacing),
          width: cardWidth,
          height: cardHeight,
          zIndex: index,
        });
      }
    });
    
    return positions;
  }

  /**
   * Grid Layout: Uniform grid layout (2 or 3 columns based on orientation)
   */
  private static calculateGridLayout(
    entryOrder: string[],
    displayStyles: { [entryId: string]: EntryDisplayMode },
    isPortrait: boolean,
    containerWidth?: number,
    containerHeight?: number
  ): EntryPosition[] {
    const positions: EntryPosition[] = [];
    const columns = isPortrait ? 2 : 3;
    const { width, spacing } = this.getContainerDimensions(containerWidth, containerHeight);
    const availableWidth = width - (spacing * 2);
    const cardWidth = (availableWidth - (spacing * (columns - 1))) / columns;
    
    entryOrder.forEach((entryId, index) => {
      const displayMode = displayStyles[entryId] || 'card';
      const cardHeight = this.getCardHeight(displayMode, cardWidth, false, containerWidth);
      
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      positions.push({
        entryId,
        x: spacing + col * (cardWidth + spacing),
        y: spacing + row * (cardHeight + spacing),
        width: cardWidth,
        height: cardHeight,
        zIndex: index,
      });
    });
    
    return positions;
  }

  /**
   * Timeline Layout: Single column vertical list with consistent spacing
   */
  private static calculateTimelineLayout(
    entryOrder: string[],
    displayStyles: { [entryId: string]: EntryDisplayMode },
    isPortrait: boolean,
    containerWidth?: number,
    containerHeight?: number
  ): EntryPosition[] {
    const positions: EntryPosition[] = [];
    const { width, spacing } = this.getContainerDimensions(containerWidth, containerHeight);
    const availableWidth = width - (spacing * 2);
    
    let currentY = spacing;
    
    entryOrder.forEach((entryId, index) => {
      const displayMode = displayStyles[entryId] || 'card';
      const cardHeight = this.getCardHeight(displayMode, availableWidth, true, containerWidth);
      
      positions.push({
        entryId,
        x: spacing,
        y: currentY,
        width: availableWidth,
        height: cardHeight,
        zIndex: index,
      });
      
      currentY += cardHeight + spacing;
    });
    
    return positions;
  }

  /**
   * Masonry Layout: Pinterest-style staggered layout
   */
  private static calculateMasonryLayout(
    entryOrder: string[],
    displayStyles: { [entryId: string]: EntryDisplayMode },
    isPortrait: boolean,
    containerWidth?: number,
    containerHeight?: number
  ): EntryPosition[] {
    const positions: EntryPosition[] = [];
    const columns = isPortrait ? 2 : 3;
    const { width, spacing } = this.getContainerDimensions(containerWidth, containerHeight);
    const availableWidth = width - (spacing * 2);
    const cardWidth = (availableWidth - (spacing * (columns - 1))) / columns;
    
    // Track the Y position of each column
    const columnHeights: number[] = new Array(columns).fill(spacing);
    
    entryOrder.forEach((entryId, index) => {
      const displayMode = displayStyles[entryId] || 'card';
      
      // Add some height variation for masonry effect (deterministic based on index)
      const baseHeight = this.getCardHeight(displayMode, cardWidth, false, containerWidth);
      // Use index-based variation for consistent preview
      const heightVariation = ((index % 3) - 1) * 30; // -30, 0, +30 pattern
      const cardHeight = Math.max(baseHeight + heightVariation, baseHeight * 0.7);
      
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      positions.push({
        entryId,
        x: spacing + shortestColumnIndex * (cardWidth + spacing),
        y: columnHeights[shortestColumnIndex],
        width: cardWidth,
        height: cardHeight,
        zIndex: index,
      });
      
      // Update column height
      columnHeights[shortestColumnIndex] += cardHeight + spacing;
    });
    
    return positions;
  }

  /**
   * Hero Layout: One large hero + smaller cards below
   */
  private static calculateHeroLayout(
    entryOrder: string[],
    displayStyles: { [entryId: string]: EntryDisplayMode },
    isPortrait: boolean,
    containerWidth?: number,
    containerHeight?: number
  ): EntryPosition[] {
    const positions: EntryPosition[] = [];
    const { width, spacing } = this.getContainerDimensions(containerWidth, containerHeight);
    const availableWidth = width - (spacing * 2);
    
    let currentY = spacing;
    
    entryOrder.forEach((entryId, index) => {
      const displayMode = displayStyles[entryId] || 'card';
      
      if (index === 0) {
        // Hero entry (full width, extra height)
        const heroHeight = this.getCardHeight('featured', availableWidth, true, containerWidth);
        positions.push({
          entryId,
          x: spacing,
          y: currentY,
          width: availableWidth,
          height: heroHeight,
          zIndex: index,
        });
        currentY += heroHeight + spacing;
      } else {
        // Smaller cards (3 columns)
        const columns = isPortrait ? 2 : 3;
        const cardWidth = (availableWidth - (spacing * (columns - 1))) / columns;
        const cardHeight = this.getCardHeight('compact', cardWidth, false, containerWidth);
        
        const col = (index - 1) % columns;
        const row = Math.floor((index - 1) / columns);
        
        positions.push({
          entryId,
          x: spacing + col * (cardWidth + spacing),
          y: currentY + row * (cardHeight + spacing),
          width: cardWidth,
          height: cardHeight,
          zIndex: index,
        });
      }
    });
    
    return positions;
  }

  /**
   * Calculate card height based on display mode and dimensions
   */
  private static getCardHeight(
    displayMode: EntryDisplayMode,
    cardWidth: number,
    isFullWidth: boolean,
    containerWidth?: number
  ): number {
    const baseHeight = cardWidth * 0.75; // 4:3 aspect ratio base
    
    // Scale heights for preview containers
    const heightScale = containerWidth ? Math.min(containerWidth / screenWidth, 1) : 1;
    
    let calculatedHeight: number;
    switch (displayMode) {
      case 'compact':
        calculatedHeight = Math.max(60 * heightScale, baseHeight * 0.4); // Minimal height
        break;
      case 'card':
        calculatedHeight = Math.max(120 * heightScale, baseHeight); // Standard card height
        break;
      case 'featured':
        calculatedHeight = Math.max(200 * heightScale, baseHeight * 1.4); // Larger featured height
        break;
      default:
        calculatedHeight = Math.max(120 * heightScale, baseHeight);
    }
    
    return calculatedHeight;
  }

  /**
   * Get template display information
   */
  static getTemplateInfo(template: LayoutTemplateType) {
    const templateInfo = {
      magazine: {
        name: 'Magazine',
        description: 'Featured entry at top + grid below',
        icon: 'book',
      },
      grid: {
        name: 'Grid',
        description: 'Uniform columns (2 portrait, 3 landscape)',
        icon: 'media',
      },
      timeline: {
        name: 'Timeline',
        description: 'Single vertical column layout',
        icon: 'calendar',
      },
      masonry: {
        name: 'Masonry',
        description: 'Staggered heights like Pinterest',
        icon: 'settings',
      },
      hero: {
        name: 'Hero',
        description: 'Large hero + compact cards below',
        icon: 'edit',
      },
    };

    return templateInfo[template];
  }
}