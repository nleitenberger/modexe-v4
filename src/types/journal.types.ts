import { StickerInstance } from './sticker.types';
import { HandwritingStroke } from './handwriting.types';

export enum PageSize {
  POCKETBOOK = 'pocketbook',
  JOURNAL = 'journal', 
  A4 = 'a4'
}

export interface PageDimensions {
  aspectRatio: number;
  minHeight: number;
  maxHeight: number;
  maxWidth: number;
  padding: {
    horizontal: number;
    vertical: number;
  };
}

export interface Journal {
  id: string;
  title: string;
  pages: JournalPage[];
  pageSize: PageSize;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalWords?: number;
    totalPages?: number;
  };
}

export interface JournalPage {
  id: string;
  pageNumber: number;
  content: RichTextContent;
  stickers: StickerInstance[];
  handwritingStrokes: HandwritingStroke[];
  backgroundColor: string;
  textColor: string;
}

export interface RichTextContent {
  text: string;
  formatting: TextFormatting[];
  textStyle: TextStyle;
}

export interface TextFormatting {
  start: number;
  end: number;
  type: 'bold' | 'italic' | 'underline' | 'color';
  value?: string; // For color values
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
}

export interface JournalSpread {
  leftPage: JournalPage | null;
  rightPage: JournalPage | null;
  spreadIndex: number;
}

export interface JournalState {
  currentJournal: Journal | null;
  currentSpreadIndex: number;
  currentPageIndex: number;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  originalSharedEntryId: string | null; // Track the original shared entry if editing
}