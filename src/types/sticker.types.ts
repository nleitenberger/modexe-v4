export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: StickerCategory;
  size: { width: number; height: number };
  tags: string[];
}

export interface StickerInstance {
  id: string;
  stickerId: string;
  position: Position;
  rotation: number;
  scale: number;
  zIndex: number;
  pageId: string;
  createdAt: Date;
}

export interface Position {
  x: number;
  y: number;
}

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  stickers: Sticker[];
}

export interface StickerState {
  availableStickers: StickerCategory[];
  placedStickers: StickerInstance[];
  draggedSticker: StickerInstance | null;
  selectedSticker: StickerInstance | null;
  selectedStickers: string[]; // Array of sticker IDs for multi-select
  isPaletteExpanded: boolean;
  activeCategoryId: string | null;
  multiSelectMode: boolean;
  favoriteStickers: string[]; // Array of sticker IDs marked as favorites
  recentStickers: string[]; // Array of recently used sticker IDs
  transformHistory: TransformHistoryEntry[]; // Undo/redo history
  isTransforming?: boolean; // Disable page scroll while true
}

export interface DragState {
  isDragging: boolean;
  startPosition: Position;
  currentPosition: Position;
  offset: Position;
}

export interface TransformHistoryEntry {
  id: string;
  timestamp: Date;
  operation: 'move' | 'resize' | 'rotate' | 'delete' | 'create';
  beforeState: Partial<StickerInstance>;
  afterState: Partial<StickerInstance>;
}

export interface StickerThumbnail {
  id: string;
  stickerId: string;
  pageId: string;
  thumbnail: string; // Base64 encoded thumbnail or emoji
  position: Position;
  scale: number;
  rotation: number;
  isSelected: boolean;
}

export interface BulkOperation {
  type: 'move' | 'resize' | 'rotate' | 'delete' | 'layer' | 'align';
  stickerIds: string[];
  parameters?: {
    position?: Position;
    scale?: number;
    rotation?: number;
    zIndex?: number;
    alignment?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
  };
}

export interface AssetLibraryFilter {
  searchQuery: string;
  category: string | null;
  sortBy: 'name' | 'recent' | 'usage' | 'size';
  showOnlyFavorites: boolean;
  showOnlyOnPage: boolean;
}

export interface StickerUsageStats {
  stickerId: string;
  usageCount: number;
  lastUsed: Date;
  averageSize: number;
  mostUsedRotation: number;
}

export interface ResizeConstraints {
  minScale: number;
  maxScale: number;
  aspectRatioLocked: boolean;
  snapToGrid: boolean;
  gridSize: number;
  rotationSnapAngle: number; // degrees
}