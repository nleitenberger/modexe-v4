import { PageSize, PageDimensions } from '../types/journal.types';

// Page size configurations with different aspect ratios and styling
export const PAGE_SIZE_CONFIGS: Record<PageSize, PageDimensions> = {
  [PageSize.POCKETBOOK]: {
    aspectRatio: 0.75, // 3:4 ratio - compact, phone-friendly
    minHeight: 400,
    maxHeight: 500, 
    maxWidth: 320,
    padding: {
      horizontal: 16,
      vertical: 20,
    },
  },
  [PageSize.JOURNAL]: {
    aspectRatio: 0.8, // 4:5 ratio - standard notebook
    minHeight: 500,
    maxHeight: 650,
    maxWidth: 400,
    padding: {
      horizontal: 20,
      vertical: 24,
    },
  },
  [PageSize.A4]: {
    aspectRatio: 0.77, // 8.5:11 ratio - standard letter/A4
    minHeight: 600,
    maxHeight: 800,
    maxWidth: 450,
    padding: {
      horizontal: 24,
      vertical: 32,
    },
  },
};

// Get page configuration for a given size
export const getPageConfig = (pageSize: PageSize): PageDimensions => {
  return PAGE_SIZE_CONFIGS[pageSize];
};

// Calculate responsive dimensions based on screen size and page preference
export const calculatePageDimensions = (
  pageSize: PageSize,
  screenWidth: number,
  screenHeight: number,
  isPortrait: boolean
) => {
  const config = getPageConfig(pageSize);
  
  if (isPortrait) {
    // Single page layout - use maxWidth constraint
    const availableWidth = Math.min(screenWidth - 32, config.maxWidth); // Account for screen margins
    const calculatedHeight = Math.min(
      Math.max(config.minHeight, availableWidth / config.aspectRatio),
      config.maxHeight
    );
    
    return {
      width: availableWidth,
      height: calculatedHeight,
      padding: config.padding,
    };
  } else {
    // Dual page layout - use available space efficiently while maintaining visual differences
    const screenMargin = 32; // Screen margins
    const pageGap = 12; // Gap between pages
    const maxScreenHeight = screenHeight - 120; // Leave space for toolbars and padding
    
    // Calculate available width for both pages combined
    const totalAvailableWidth = screenWidth - screenMargin;
    const availablePageWidth = (totalAvailableWidth - pageGap) / 2;
    
    // Use the available width but let each page size determine its own height based on aspect ratio
    // This creates visual differences through proportions rather than width
    const pageWidth = availablePageWidth;
    
    const calculatedHeight = Math.min(
      Math.max(config.minHeight, pageWidth / config.aspectRatio),
      maxScreenHeight
    );
    
    return {
      width: pageWidth,
      height: calculatedHeight,
      padding: config.padding,
    };
  }
};

// Get display name for page size
export const getPageSizeDisplayName = (pageSize: PageSize): string => {
  switch (pageSize) {
    case PageSize.POCKETBOOK:
      return 'Pocketbook';
    case PageSize.JOURNAL:
      return 'Journal';
    case PageSize.A4:
      return 'A4 Letter';
    default:
      return 'Journal';
  }
};

// Get description for page size
export const getPageSizeDescription = (pageSize: PageSize): string => {
  switch (pageSize) {
    case PageSize.POCKETBOOK:
      return 'Compact size, perfect for mobile';
    case PageSize.JOURNAL:
      return 'Standard notebook size';
    case PageSize.A4:
      return 'Full letter/A4 page size';
    default:
      return 'Standard notebook size';
  }
};