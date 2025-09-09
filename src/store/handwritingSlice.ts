import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HandwritingState, DrawingTool, HandwritingStroke } from '../types/handwriting.types';

const initialState: HandwritingState = {
  isHandwritingMode: false,
  selectedTool: DrawingTool.PEN,
  selectedColor: '#000000',
  strokeWidth: 2,
  opacity: 1,
  rulerVisible: false,
  undoStack: [],
  redoStack: [],
};

const handwritingSlice = createSlice({
  name: 'handwriting',
  initialState,
  reducers: {
    toggleHandwritingMode: (state) => {
      state.isHandwritingMode = !state.isHandwritingMode;
    },
    
    setHandwritingMode: (state, action: PayloadAction<boolean>) => {
      state.isHandwritingMode = action.payload;
    },
    
    setSelectedTool: (state, action: PayloadAction<DrawingTool>) => {
      state.selectedTool = action.payload;
    },
    
    setSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload;
    },
    
    setStrokeWidth: (state, action: PayloadAction<number>) => {
      state.strokeWidth = action.payload;
    },
    
    setOpacity: (state, action: PayloadAction<number>) => {
      state.opacity = action.payload;
    },
    
    toggleRuler: (state) => {
      state.rulerVisible = !state.rulerVisible;
    },
    
    addToUndoStack: (state, action: PayloadAction<HandwritingStroke[]>) => {
      state.undoStack.push(action.payload);
      // Limit undo stack size
      if (state.undoStack.length > 50) {
        state.undoStack.shift();
      }
      // Clear redo stack when new action is performed
      state.redoStack = [];
    },
    
    undo: (state) => {
      if (state.undoStack.length > 0) {
        const lastState = state.undoStack.pop();
        if (lastState) {
          state.redoStack.push(lastState);
        }
      }
    },
    
    redo: (state) => {
      if (state.redoStack.length > 0) {
        const redoState = state.redoStack.pop();
        if (redoState) {
          state.undoStack.push(redoState);
        }
      }
    },
    
    clearUndoRedo: (state) => {
      state.undoStack = [];
      state.redoStack = [];
    },
    
    resetHandwritingState: () => initialState,
  },
});

export const {
  toggleHandwritingMode,
  setHandwritingMode,
  setSelectedTool,
  setSelectedColor,
  setStrokeWidth,
  setOpacity,
  toggleRuler,
  addToUndoStack,
  undo,
  redo,
  clearUndoRedo,
  resetHandwritingState,
} = handwritingSlice.actions;

export default handwritingSlice.reducer;