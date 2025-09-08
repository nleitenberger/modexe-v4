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
  isPaletteExpanded: boolean;
  activeCategoryId: string | null;
}

export interface DragState {
  isDragging: boolean;
  startPosition: Position;
  currentPosition: Position;
  offset: Position;
}