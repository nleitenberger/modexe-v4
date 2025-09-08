import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { JournalPage } from '../../types/journal.types';
import { updatePageContent } from '../../store/journalSlice';
import DraggableSticker from '../stickers/DraggableSticker';

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

  const handlePagePress = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
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
    <TouchableOpacity
      style={[styles.page, { backgroundColor: page.backgroundColor }]}
      onPress={handlePagePress}
      activeOpacity={1}
    >
      {/* Page number */}
      <Text style={[styles.pageNumber, isLeftPage ? styles.leftPageNumber : styles.rightPageNumber]}>
        {page.pageNumber + 1}
      </Text>

      {/* Content area */}
      <View style={styles.contentArea}>
        {isEditing ? (
          <TextInput
            style={[
              styles.textInput,
              {
                fontSize: page.content.textStyle.fontSize,
                color: page.content.textStyle.color,
                lineHeight: page.content.textStyle.fontSize * page.content.textStyle.lineHeight,
                textAlign: page.content.textStyle.textAlign,
              },
            ]}
            value={localText}
            onChangeText={handleTextChange}
            onBlur={handleTextBlur}
            onSubmitEditing={handleTextSubmit}
            multiline
            autoFocus
            placeholder="Start writing your story..."
            placeholderTextColor="#999"
            scrollEnabled={true}
            textAlignVertical="top"
          />
        ) : (
          <TouchableOpacity
            style={styles.textDisplay}
            onPress={handlePagePress}
            activeOpacity={0.7}
          >
            {localText ? (
              <Text
                style={[
                  styles.displayText,
                  {
                    fontSize: page.content.textStyle.fontSize,
                    color: page.content.textStyle.color,
                    lineHeight: page.content.textStyle.fontSize * page.content.textStyle.lineHeight,
                    textAlign: page.content.textStyle.textAlign,
                  },
                ]}
              >
                {localText}
              </Text>
            ) : (
              <Text style={styles.placeholder}>Tap to start writing...</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Stickers */}
        {page.stickers.map((sticker) => (
          <DraggableSticker
            key={sticker.id}
            sticker={sticker}
            pageWidth={width}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: 'relative',
  },
  pageNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 16,
  },
  leftPageNumber: {
    textAlign: 'left',
  },
  rightPageNumber: {
    textAlign: 'right',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    minHeight: 120,
  },
  textDisplay: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 120,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  displayText: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});

export default JournalPageComponent;