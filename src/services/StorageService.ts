import AsyncStorage from '@react-native-async-storage/async-storage';
import { Journal } from '../types/journal.types';

// Type for serialized journal data (with string dates)
type SerializedJournal = Omit<Journal, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEYS = {
  CURRENT_JOURNAL: 'current_journal',
  JOURNAL_LIST: 'journal_list',
} as const;

export class StorageService {
  /**
   * Save current journal to storage
   */
  static async saveJournal(journal: Journal): Promise<void> {
    try {
      const journalData: SerializedJournal = {
        ...journal,
        createdAt: journal.createdAt.toISOString(),
        updatedAt: journal.updatedAt.toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_JOURNAL, JSON.stringify(journalData));
    } catch (error) {
      console.error('Error saving journal:', error);
      throw error;
    }
  }

  /**
   * Load current journal from storage
   */
  static async loadJournal(): Promise<Journal | null> {
    try {
      const journalData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_JOURNAL);
      if (!journalData) {
        return null;
      }

      const parsed: SerializedJournal = JSON.parse(journalData);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
    } catch (error) {
      console.error('Error loading journal:', error);
      return null;
    }
  }

  /**
   * Clear current journal from storage
   */
  static async clearJournal(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_JOURNAL);
    } catch (error) {
      console.error('Error clearing journal:', error);
      throw error;
    }
  }

  /**
   * Save journal to the list of saved journals
   */
  static async saveToJournalList(journal: Journal): Promise<void> {
    try {
      const existingListData = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_LIST);
      const journalList: SerializedJournal[] = existingListData ? JSON.parse(existingListData) : [];

      // Update existing journal or add new one
      const existingIndex = journalList.findIndex(j => j.id === journal.id);
      const journalData: SerializedJournal = {
        ...journal,
        createdAt: journal.createdAt.toISOString(),
        updatedAt: journal.updatedAt.toISOString(),
      };

      if (existingIndex >= 0) {
        journalList[existingIndex] = journalData;
      } else {
        journalList.push(journalData);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_LIST, JSON.stringify(journalList));
    } catch (error) {
      console.error('Error saving to journal list:', error);
      throw error;
    }
  }

  /**
   * Load list of saved journals
   */
  static async loadJournalList(): Promise<Journal[]> {
    try {
      const journalListData = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_LIST);
      if (!journalListData) {
        return [];
      }

      const parsed: SerializedJournal[] = JSON.parse(journalListData);
      return parsed.map((journal: SerializedJournal) => ({
        ...journal,
        createdAt: new Date(journal.createdAt),
        updatedAt: new Date(journal.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading journal list:', error);
      return [];
    }
  }

  /**
   * Delete a journal from the list
   */
  static async deleteJournal(journalId: string): Promise<void> {
    try {
      const existingListData = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_LIST);
      const journalList: SerializedJournal[] = existingListData ? JSON.parse(existingListData) : [];

      const filteredList = journalList.filter(j => j.id !== journalId);
      await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_LIST, JSON.stringify(filteredList));

      // If this was the current journal, clear it
      const currentJournal = await this.loadJournal();
      if (currentJournal?.id === journalId) {
        await this.clearJournal();
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      throw error;
    }
  }

  /**
   * Auto-save functionality
   */
  static async autoSave(journal: Journal): Promise<void> {
    try {
      await Promise.all([
        this.saveJournal(journal),
        this.saveToJournalList(journal),
      ]);
    } catch (error) {
      console.error('Error in auto-save:', error);
    }
  }
}