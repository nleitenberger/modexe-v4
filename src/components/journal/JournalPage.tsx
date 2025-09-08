import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
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

  const handlePagePress = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
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
                lineHeight: page.content.textStyle.lineHeight,
                textAlign: page.content.textStyle.textAlign,
              },
            ]}
            value={localText}
            onChangeText={handleTextChange}
            onBlur={handleTextSubmit}
            multiline
            autoFocus
            placeholder="Start writing..."
            placeholderTextColor="#999"
          />
        ) : (
          <TouchableOpacity
            style={styles.textDisplay}
            onPress={handlePagePress}
            activeOpacity={1}
          >
            {localText ? (
              <Text
                style={[
                  styles.displayText,
                  {
                    fontSize: page.content.textStyle.fontSize,
                    color: page.content.textStyle.color,
                    lineHeight: page.content.textStyle.lineHeight,
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
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
  },
  textDisplay: {
    flex: 1,
    paddingVertical: 4,
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