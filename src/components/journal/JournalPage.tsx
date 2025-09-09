import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { JournalPage } from '../../types/journal.types';
import { updatePageContent } from '../../store/journalSlice';
import DraggableSticker from '../stickers/DraggableSticker';
import TextWithStickers from './TextWithStickers';

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
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(page.content.text);

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

  const handleTextBlur = () => {
    handleTextSubmit();
  };

  return (
    <View style={[styles.page, { backgroundColor: page.backgroundColor }]}>
      {/* Page number */}
      <Text style={[styles.pageNumber, isLeftPage ? styles.leftPageNumber : styles.rightPageNumber]}>
        {page.pageNumber + 1}
      </Text>

      {/* Content area - Full page text editing with sticker wrapping */}
      <View style={styles.contentArea}>
        {/* Text with automatic wrapping around stickers */}
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

        {/* Stickers */}
        {page.stickers.map((sticker) => (
          <DraggableSticker
            key={sticker.id}
            sticker={sticker}
            pageWidth={width}
          />
        ))}
      </View>
    </View>
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
});

export default JournalPageComponent;