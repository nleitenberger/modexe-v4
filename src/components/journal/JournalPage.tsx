import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { JournalPage } from '../../types/journal.types';
import { updatePageContent } from '../../store/journalSlice';
import { selectSticker } from '../../store/stickerSlice';
import { updateHandwritingStrokes } from '../../store/journalSlice';
import TextWithStickers from './TextWithStickers';
import DraggableSticker from '../stickers/DraggableSticker';
import HandwritingCanvas from './HandwritingCanvas';
import { TEXT_LAYER_Z_INDEX, HANDWRITING_LAYER_Z_INDEX } from '../../constants/layers';
import { HandwritingCanvasRef } from '../../types/handwriting.types';

interface JournalPageComponentProps {
  page: JournalPage;
  width: number;
  isLeftPage: boolean;
}

const JournalPageComponent: React.FC<JournalPageComponentProps> = ({
  page,
  width,
  isLeftPage,
}) => {
  const dispatch = useDispatch();
  const isTransforming = useSelector((state: RootState) => state.sticker.isTransforming);
  const handwritingState = useSelector((state: RootState) => state.handwriting);
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(page.content.text);
  const handwritingRef = useRef<HandwritingCanvasRef>(null);

  // Keep local text in sync with page content
  useEffect(() => {
    setLocalText(page.content.text);
  }, [page.content.text]);

  const handleEditingStart = () => {
    setIsEditing(true);
  };

  const handleEditingEnd = () => {
    handleTextSubmit();
  };

  const handleTextChange = (text: string) => {
    setLocalText(text);
  };

  const handleTextSubmit = () => {
    dispatch(updatePageContent({
      pageId: page.id,
      content: {
        ...page.content,
        text: localText,
      },
    }));
    setIsEditing(false);
  };

  const handlePageTap = () => {
    if (isTransforming) return;
    // Deselect any selected stickers when tapping on empty page area
    dispatch(selectSticker(null));
  };

  const handleHandwritingStrokesChange = (strokes: any[]) => {
    // Convert PencilKit strokes to our HandwritingStroke format and update Redux
    // This is a simplified implementation - in practice you'd need proper conversion
    dispatch(updateHandwritingStrokes({
      pageId: page.id,
      strokes: page.handwritingStrokes // Keep existing for now
    }));
  };

  return (
    <TouchableWithoutFeedback onPress={handlePageTap}>
  <View style={[styles.page, { backgroundColor: page.backgroundColor }]} pointerEvents={isTransforming ? 'box-none' : 'auto'}>
        {/* Page number */}
        <Text style={[styles.pageNumber, isLeftPage ? styles.leftPageNumber : styles.rightPageNumber]}>
          {page.pageNumber + 1}
        </Text>

        {/* Content area - Layered rendering: Background stickers -> Text -> Foreground stickers */}
        <View style={styles.contentArea}>
        {/* Layer 1: Background stickers (behind text) */}
        {page.stickers
          .filter(sticker => sticker.zIndex < TEXT_LAYER_Z_INDEX)
          .map((sticker) => (
            <DraggableSticker
              key={sticker.id}
              sticker={sticker}
              pageWidth={width}
            />
          ))}

        {/* Layer 2: Text layer */}
        <View style={styles.textLayer}>
          <TextWithStickers
            page={page}
            width={width - 48} // Account for page padding
            height={(page as any).height || 600} // Use dynamic height based on page size
            isEditing={isEditing}
            text={localText}
            onTextChange={handleTextChange}
            onEditingStart={handleEditingStart}
            onEditingEnd={handleEditingEnd}
          />
        </View>

        {/* Layer 3: Handwriting layer (above text, below foreground stickers) */}
        <HandwritingCanvas
          ref={handwritingRef}
          width={width - 48} // Match text area width
          height={(page as any).height || 600}
          isVisible={true}
          isInteractive={handwritingState.isHandwritingMode && !isTransforming}
          initialStrokes={page.handwritingStrokes}
          selectedTool={handwritingState.selectedTool}
          selectedColor={handwritingState.selectedColor}
          strokeWidth={handwritingState.strokeWidth}
          onStrokesChange={handleHandwritingStrokesChange}
        />

        {/* Layer 4: Foreground stickers (above handwriting) */}
        {page.stickers
          .filter(sticker => sticker.zIndex >= HANDWRITING_LAYER_Z_INDEX + 500)
          .map((sticker) => (
            <DraggableSticker
              key={sticker.id}
              sticker={sticker}
              pageWidth={width}
            />
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  pageNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    position: 'absolute',
    top: 8,
    zIndex: 10,
  },
  leftPageNumber: {
    textAlign: 'left',
    left: 24,
  },
  rightPageNumber: {
    textAlign: 'right',
    right: 24,
  },
  contentArea: {
    flex: 1,
    position: 'relative',
    marginTop: 16,
  },
  textLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: TEXT_LAYER_Z_INDEX,
  },
});

export default JournalPageComponent;