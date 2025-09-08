import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { ThemeConfig, DEFAULT_THEMES } from '../types/modspace.types';
import { updateModSpaceTheme } from '../store/modspaceSlice';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  availableThemes: Record<string, ThemeConfig>;
  isLoading: boolean;
  error: string | null;
  
  // Theme Management
  setTheme: (theme: ThemeConfig) => Promise<void>;
  resetTheme: () => Promise<void>;
  createCustomTheme: (baseTheme: ThemeConfig, customizations: Partial<ThemeConfig>) => ThemeConfig;
  saveCustomTheme: (theme: ThemeConfig) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  
  // Theme History for Undo/Redo
  themeHistory: ThemeConfig[];
  canUndo: boolean;
  canRedo: boolean;
  undoTheme: () => void;
  redoTheme: () => void;
  
  // Theme Preview
  previewTheme: ThemeConfig | null;
  setPreviewTheme: (theme: ThemeConfig | null) => void;
  applyPreviewTheme: () => Promise<void>;
  
  // Import/Export
  exportTheme: (theme: ThemeConfig) => string;
  importTheme: (themeData: string) => Promise<ThemeConfig | null>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@modexe_theme';
const CUSTOM_THEMES_STORAGE_KEY = '@modexe_custom_themes';
const THEME_HISTORY_STORAGE_KEY = '@modexe_theme_history';
const MAX_HISTORY_LENGTH = 10;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEMES.light);
  const [availableThemes, setAvailableThemes] = useState<Record<string, ThemeConfig>>(DEFAULT_THEMES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [themeHistory, setThemeHistory] = useState<ThemeConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);

  // Load theme from storage on mount
  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load current theme
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        const theme: ThemeConfig = JSON.parse(storedTheme);
        setCurrentTheme(theme);
        dispatch(updateModSpaceTheme(theme));
      }

      // Load custom themes
      const customThemesData = await AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
      if (customThemesData) {
        const customThemes: Record<string, ThemeConfig> = JSON.parse(customThemesData);
        setAvailableThemes(prev => ({ ...prev, ...customThemes }));
      }

      // Load theme history
      const historyData = await AsyncStorage.getItem(THEME_HISTORY_STORAGE_KEY);
      if (historyData) {
        const history: ThemeConfig[] = JSON.parse(historyData);
        setThemeHistory(history);
        setHistoryIndex(history.length - 1);
      }

    } catch (err) {
      console.error('Error loading theme from storage:', err);
      setError('Failed to load theme settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemeToStorage = async (theme: ThemeConfig) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (err) {
      console.error('Error saving theme to storage:', err);
      throw new Error('Failed to save theme');
    }
  };

  const addToHistory = (theme: ThemeConfig) => {
    setThemeHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), theme];
      const trimmedHistory = newHistory.slice(-MAX_HISTORY_LENGTH);
      
      AsyncStorage.setItem(THEME_HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory))
        .catch(err => console.error('Error saving theme history:', err));
      
      return trimmedHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_LENGTH - 1));
  };

  const setTheme = async (theme: ThemeConfig): Promise<void> => {
    try {
      setError(null);
      
      // Add current theme to history before changing
      if (currentTheme.id !== theme.id) {
        addToHistory(currentTheme);
      }
      
      setCurrentTheme(theme);
      dispatch(updateModSpaceTheme(theme));
      await saveThemeToStorage(theme);
      
    } catch (err) {
      console.error('Error setting theme:', err);
      setError('Failed to apply theme');
      throw err;
    }
  };

  const resetTheme = async (): Promise<void> => {
    try {
      const defaultTheme = DEFAULT_THEMES.light;
      await setTheme(defaultTheme);
    } catch (err) {
      console.error('Error resetting theme:', err);
      setError('Failed to reset theme');
      throw err;
    }
  };

  const createCustomTheme = (
    baseTheme: ThemeConfig, 
    customizations: Partial<ThemeConfig>
  ): ThemeConfig => {
    const customTheme: ThemeConfig = {
      ...baseTheme,
      ...customizations,
      id: customizations.id || `custom_${Date.now()}`,
      name: customizations.name || `Custom Theme ${Date.now()}`,
    };
    
    return customTheme;
  };

  const saveCustomTheme = async (theme: ThemeConfig): Promise<void> => {
    try {
      if (!theme.id) {
        throw new Error('Theme must have an ID');
      }

      const customThemes = { ...availableThemes };
      customThemes[theme.id] = theme;
      
      setAvailableThemes(customThemes);
      
      // Save only custom themes (not default ones)
      const customOnly = Object.fromEntries(
        Object.entries(customThemes).filter(([key]) => 
          !Object.keys(DEFAULT_THEMES).includes(key)
        )
      );
      
      await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customOnly));
      
    } catch (err) {
      console.error('Error saving custom theme:', err);
      setError('Failed to save custom theme');
      throw err;
    }
  };

  const deleteCustomTheme = async (themeId: string): Promise<void> => {
    try {
      // Don't allow deletion of default themes
      if (Object.keys(DEFAULT_THEMES).includes(themeId)) {
        throw new Error('Cannot delete default themes');
      }

      const updatedThemes = { ...availableThemes };
      delete updatedThemes[themeId];
      
      setAvailableThemes(updatedThemes);
      
      // Update storage
      const customOnly = Object.fromEntries(
        Object.entries(updatedThemes).filter(([key]) => 
          !Object.keys(DEFAULT_THEMES).includes(key)
        )
      );
      
      await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customOnly));
      
      // Switch to default theme if deleted theme was current
      if (currentTheme.id === themeId) {
        await setTheme(DEFAULT_THEMES.light);
      }
      
    } catch (err) {
      console.error('Error deleting custom theme:', err);
      setError('Failed to delete theme');
      throw err;
    }
  };

  const undoTheme = () => {
    if (canUndo) {
      const previousIndex = historyIndex - 1;
      const previousTheme = themeHistory[previousIndex];
      
      setCurrentTheme(previousTheme);
      dispatch(updateModSpaceTheme(previousTheme));
      setHistoryIndex(previousIndex);
      
      // Save to storage without adding to history
      saveThemeToStorage(previousTheme).catch(console.error);
    }
  };

  const redoTheme = () => {
    if (canRedo) {
      const nextIndex = historyIndex + 1;
      const nextTheme = themeHistory[nextIndex];
      
      setCurrentTheme(nextTheme);
      dispatch(updateModSpaceTheme(nextTheme));
      setHistoryIndex(nextIndex);
      
      // Save to storage without adding to history
      saveThemeToStorage(nextTheme).catch(console.error);
    }
  };

  const applyPreviewTheme = async (): Promise<void> => {
    if (previewTheme) {
      await setTheme(previewTheme);
      setPreviewTheme(null);
    }
  };

  const exportTheme = (theme: ThemeConfig): string => {
    try {
      const exportData = {
        version: '1.0',
        theme: theme,
        exportDate: new Date().toISOString(),
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (err) {
      console.error('Error exporting theme:', err);
      throw new Error('Failed to export theme');
    }
  };

  const importTheme = async (themeData: string): Promise<ThemeConfig | null> => {
    try {
      const importData = JSON.parse(themeData);
      
      if (!importData.theme || !importData.version) {
        throw new Error('Invalid theme data format');
      }
      
      const theme: ThemeConfig = importData.theme;
      
      // Generate new ID to avoid conflicts
      const importedTheme = {
        ...theme,
        id: `imported_${Date.now()}`,
        name: `${theme.name} (Imported)`,
      };
      
      await saveCustomTheme(importedTheme);
      return importedTheme;
      
    } catch (err) {
      console.error('Error importing theme:', err);
      setError('Failed to import theme - invalid format');
      return null;
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < themeHistory.length - 1;

  const contextValue: ThemeContextType = {
    currentTheme: previewTheme || currentTheme,
    availableThemes,
    isLoading,
    error,
    
    setTheme,
    resetTheme,
    createCustomTheme,
    saveCustomTheme,
    deleteCustomTheme,
    
    themeHistory,
    canUndo,
    canRedo,
    undoTheme,
    redoTheme,
    
    previewTheme,
    setPreviewTheme,
    applyPreviewTheme,
    
    exportTheme,
    importTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;