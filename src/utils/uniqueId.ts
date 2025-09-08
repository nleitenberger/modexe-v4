/**
 * Utility functions for generating unique identifiers
 */

/**
 * Generates a cryptographically secure random string
 * Uses browser crypto API when available, falls back to Math.random
 */
const generateRandomString = (length: number = 12): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  // Use crypto API if available (recommended)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * Generates a unique ID with timestamp and random component
 * Format: {prefix}-{timestamp}-{randomString}
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
  const timestamp = Date.now().toString(36); // Base36 for shorter strings
  const randomPart = generateRandomString(8);
  return `${prefix}-${timestamp}-${randomPart}`;
};

/**
 * Generates a unique journal ID
 */
export const generateJournalId = (): string => {
  return generateUniqueId('journal');
};

/**
 * Generates a unique shared entry ID
 */
export const generateSharedEntryId = (): string => {
  return generateUniqueId('shared');
};

/**
 * Generates a unique page ID
 */
export const generatePageId = (pageNumber: number): string => {
  return generateUniqueId(`page-${pageNumber}`);
};

/**
 * Generates a unique content block ID
 */
export const generateContentBlockId = (type: string): string => {
  return generateUniqueId(`${type}-block`);
};

/**
 * Validates if a string is a properly formatted unique ID
 */
export const isValidUniqueId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // Check format: prefix-timestamp-randomString
  const parts = id.split('-');
  return parts.length >= 3 && parts.every(part => part.length > 0);
};