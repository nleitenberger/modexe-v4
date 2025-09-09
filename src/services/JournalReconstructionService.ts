import { Journal, JournalPage, RichTextContent, PageSize } from '../types/journal.types';
import { SharedContentItem } from '../types/modspace.types';

/**
 * Service to reconstruct Journal objects from SharedContentItem data
 * In a real application, this would fetch from a backend API
 */
export class JournalReconstructionService {
  /**
   * Reconstructs a Journal object from shared content item data
   * This is a mock implementation - in reality, you'd fetch from an API
   */
  static reconstructJournalFromSharedEntry(entry: SharedContentItem): Journal {
    if (entry.type !== 'journal') {
      throw new Error('Cannot reconstruct journal from non-journal content');
    }

    // Create journal pages from the shared entry data
    const pages: JournalPage[] = [];
    
    // If we have specific page numbers, create those pages
    if (entry.pageNumbers && entry.pageNumbers.length > 0) {
      entry.pageNumbers.forEach((pageNumber, index) => {
        const content: RichTextContent = {
          text: index === 0 ? entry.excerpt || '' : '', // Put content in first page
          formatting: [], // Default empty formatting
          textStyle: {
            fontSize: 16,
            fontFamily: 'system',
            lineHeight: 1.4,
            textAlign: 'left',
            color: '#000000',
          },
        };

        const page: JournalPage = {
          id: `${entry.id}-page-${pageNumber}`,
          pageNumber,
          content,
          stickers: [], // No stickers in shared data
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        };

        pages.push(page);
      });
    } else {
      // Create at least one page with the content
      const content: RichTextContent = {
        text: entry.excerpt || '',
        formatting: [], // Default empty formatting
        textStyle: {
          fontSize: 16,
          fontFamily: 'system',
          lineHeight: 1.4,
          textAlign: 'left',
          color: '#000000',
        },
      };

      const page: JournalPage = {
        id: `${entry.id}-page-1`,
        pageNumber: 1,
        content,
        stickers: [],
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
      };

      pages.push(page);
    }

    // Reconstruct the full Journal object
    const now = new Date();
    const createdAt = entry.createdAt ? new Date(entry.createdAt) : now;
    const updatedAt = entry.createdAt ? new Date(entry.createdAt) : now;
    
    // Validate dates and fallback to current date if invalid
    const validCreatedAt = isNaN(createdAt.getTime()) ? now : createdAt;
    const validUpdatedAt = isNaN(updatedAt.getTime()) ? now : updatedAt;
    
    const journal: Journal = {
      id: entry.journalId || entry.id,
      title: entry.title,
      pages,
      pageSize: PageSize.JOURNAL, // Default page size
      createdAt: validCreatedAt,
      updatedAt: validUpdatedAt,
      metadata: {
        totalWords: this.countWords(entry.excerpt || ''),
        totalPages: pages.length,
      },
    };

    return journal;
  }

  /**
   * Alternative method that creates a new journal based on existing shared entry
   * This creates a "Edit as Copy" experience
   */
  static createJournalCopyFromSharedEntry(entry: SharedContentItem): Journal {
    const originalJournal = this.reconstructJournalFromSharedEntry(entry);
    
    // Create a new ID and update title to indicate it's a copy
    const copyJournal: Journal = {
      ...originalJournal,
      id: `journal-copy-${Date.now()}`,
      title: `Copy of ${originalJournal.title}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return copyJournal;
  }

  /**
   * Checks if we can reconstruct a journal from the given shared entry
   */
  static canReconstructJournal(entry: SharedContentItem): boolean {
    return entry.type === 'journal' && (
      Boolean(entry.journalId) || 
      Boolean(entry.excerpt) ||
      Boolean(entry.pageNumbers)
    );
  }

  /**
   * Simple word counting utility
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Validates that the journal has minimum required data
   */
  static validateReconstructedJournal(journal: Journal): boolean {
    return Boolean(
      journal.id &&
      journal.title &&
      journal.pages &&
      journal.pages.length > 0 &&
      journal.createdAt &&
      journal.updatedAt
    );
  }
}

export default JournalReconstructionService;