/**
 * Layer management constants for journal page rendering
 */

// Z-index ranges for different layers
export const TEXT_LAYER_Z_INDEX = 1000000000;
export const INITIAL_STICKER_Z_INDEX = TEXT_LAYER_Z_INDEX + 1; // Start above text
export const BACKGROUND_LAYER_MAX = TEXT_LAYER_Z_INDEX - 1;
export const FOREGROUND_LAYER_MIN = TEXT_LAYER_Z_INDEX + 1;

// Layer type enumeration
export enum LayerType {
  BACKGROUND = 'background', // Behind text
  TEXT = 'text',            // Text layer
  FOREGROUND = 'foreground'  // Above text
}

/**
 * Determine which layer a sticker belongs to based on its z-index
 */
export const getStickerLayer = (zIndex: number): LayerType => {
  if (zIndex < TEXT_LAYER_Z_INDEX) {
    return LayerType.BACKGROUND;
  }
  return LayerType.FOREGROUND;
};

/**
 * Get the next available z-index for a sticker layer
 */
export const getNextZIndex = (stickers: Array<{ zIndex: number }>, layer: LayerType): number => {
  const layerStickers = stickers.filter(sticker => 
    getStickerLayer(sticker.zIndex) === layer
  );

  if (layer === LayerType.BACKGROUND) {
    // For background, find the highest z-index below text layer
    const maxZ = Math.max(0, ...layerStickers.map(s => s.zIndex));
    return Math.min(maxZ + 1, BACKGROUND_LAYER_MAX);
  } else {
    // For foreground, find the highest z-index above text layer
    const maxZ = Math.max(FOREGROUND_LAYER_MIN - 1, ...layerStickers.map(s => s.zIndex));
    return maxZ + 1;
  }
};

/**
 * Move sticker to front within its current layer
 */
export const bringToFrontInLayer = (stickers: Array<{ zIndex: number }>, currentZIndex: number): number => {
  const currentLayer = getStickerLayer(currentZIndex);
  return getNextZIndex(stickers, currentLayer);
};

/**
 * Move sticker to back within its current layer
 */
export const sendToBackInLayer = (stickers: Array<{ zIndex: number }>, currentZIndex: number): number => {
  const currentLayer = getStickerLayer(currentZIndex);
  const layerStickers = stickers.filter(sticker => 
    getStickerLayer(sticker.zIndex) === currentLayer && sticker.zIndex !== currentZIndex
  );

  if (currentLayer === LayerType.BACKGROUND) {
    // For background, find the lowest z-index
    const minZ = Math.min(1, ...layerStickers.map(s => s.zIndex));
    return Math.max(1, minZ - 1);
  } else {
    // For foreground, find the lowest z-index above text layer
    const minZ = Math.min(FOREGROUND_LAYER_MIN, ...layerStickers.map(s => s.zIndex));
    return Math.max(FOREGROUND_LAYER_MIN, minZ - 1);
  }
};

/**
 * Move sticker to the opposite layer (background <-> foreground)
 */
export const moveToOppositeLayer = (stickers: Array<{ zIndex: number }>, currentZIndex: number): number => {
  const currentLayer = getStickerLayer(currentZIndex);
  const targetLayer = currentLayer === LayerType.BACKGROUND ? LayerType.FOREGROUND : LayerType.BACKGROUND;
  return getNextZIndex(stickers, targetLayer);
};