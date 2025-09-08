import React from 'react';
import { LayoutType, SharedContentItem } from '../../types/modspace.types';
import GridLayout from './layouts/GridLayout';
import TimelineLayout from './layouts/TimelineLayout';
import MagazineLayout from './layouts/MagazineLayout';
import MinimalLayout from './layouts/MinimalLayout';
import CreativeLayout from './layouts/CreativeLayout';

interface LayoutRendererProps {
  layout: LayoutType;
  content: SharedContentItem[];
  onEntryPress?: (entry: SharedContentItem) => void;
  onEntryLongPress?: (entry: SharedContentItem) => void;
  onEntryEdit?: (entry: SharedContentItem) => void;
  onEntryDelete?: (entry: SharedContentItem) => void;
  onEntryFullscreen?: (entry: SharedContentItem) => void;
}

const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  layout,
  content,
  onEntryPress,
  onEntryLongPress,
  onEntryEdit,
  onEntryDelete,
  onEntryFullscreen,
}) => {
  // Handle case where layout might not be available
  if (!layout) {
    return null;
  }
  // Convert SharedContentItem to SharedJournalEntry format for compatibility
  const convertedEntries = content.map(item => {
    // Safely convert createdAt to a valid Date object
    const createValidDate = (dateValue: any): Date => {
      try {
        if (dateValue instanceof Date) {
          return isNaN(dateValue.getTime()) ? new Date() : dateValue;
        }
        if (typeof dateValue === 'string') {
          const parsed = new Date(dateValue);
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        }
        // If dateValue is invalid or null, return current date
        return new Date();
      } catch (error) {
        console.warn('Error creating date from:', dateValue, error);
        return new Date();
      }
    };

    return {
      id: item.id,
      journalId: item.type === 'journal' ? item.journalId || '' : item.id,
      journalTitle: item.title, // Map title to journalTitle
      pages: item.type === 'journal' ? item.pageNumbers || [1] : [1], // Use pageNumbers as pages
      title: item.title,
      excerpt: item.excerpt || '',
      thumbnail: item.type === 'media' ? item.thumbnail : undefined,
      shareDate: createValidDate(item.createdAt), // Safely convert createdAt to shareDate
      visibility: item.isPublic ? 'public' as const : 'private' as const,
      likes: item.likes,
      views: item.views,
      comments: [], // Initialize empty comments array
      tags: item.tags,
      // Additional props for media items (for custom handling in layouts)
      ...(item.type === 'media' && {
        mediaType: item.mediaType,
        url: item.url,
        dimensions: item.dimensions,
      }),
    };
  });

  // Helper to convert back from SharedJournalEntry to SharedContentItem for callbacks
  const createCallbackWrapper = (callback?: (entry: SharedContentItem) => void) => {
    if (!callback) return undefined;
    return (journalEntry: any) => {
      // Find the original content item
      const originalEntry = content.find(item => item.id === journalEntry.id);
      if (originalEntry) {
        callback(originalEntry);
      }
    };
  };

  const commonProps = {
    entries: convertedEntries,
    config: layout.config,
    onEntryPress: createCallbackWrapper(onEntryPress),
    onEntryLongPress: createCallbackWrapper(onEntryLongPress),
    onEntryEdit: createCallbackWrapper(onEntryEdit),
    onEntryDelete: createCallbackWrapper(onEntryDelete),
    onEntryFullscreen: createCallbackWrapper(onEntryFullscreen),
  };

  switch (layout.id) {
    case 'grid':
      return <GridLayout {...commonProps} />;
    case 'timeline':
      return <TimelineLayout {...commonProps} />;
    case 'magazine':
      return <MagazineLayout {...commonProps} />;
    case 'minimal':
      return <MinimalLayout {...commonProps} />;
    case 'creative':
      return <CreativeLayout {...commonProps} />;
    default:
      // Fallback to grid layout
      return <GridLayout {...commonProps} />;
  }
};

export default LayoutRenderer;