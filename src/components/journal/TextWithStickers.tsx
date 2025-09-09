import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { TextLayoutEngine } from '../../services/TextLayoutEngine';
import { TextStyle, JournalPage } from '../../types/journal.types';
import { StickerInstance } from '../../types/sticker.types';

interface TextWithStickersProps {
  page: JournalPage;
  width: number;
  height: number;
  isEditing: boolean;
  text: string;
  onTextChange: (text: string) => void;
  onEditingStart: () => void;
  onEditingEnd: () => void;
}

const TextWithStickers: React.FC<TextWithStickersProps> = ({
  page,
  width,
  height,
  isEditing,
  text,
  onTextChange,
  onEditingStart,
  onEditingEnd,
}) => {
  const [textLayout, setTextLayout] = useState<any>(null);

  // Create TextLayoutEngine instance
  const textLayoutEngine = useMemo(() => {
    return new TextLayoutEngine(page.content.textStyle, width, height);
  }, [page.content.textStyle, width, height]);

  // Calculate text layout when text or stickers change
  useEffect(() => {
    const calculateLayout = async () => {
      if (!text.trim()) {
        setTextLayout(null);
        return;
      }

      try {
        // Convert stickers to obstacles
        const obstacles = TextLayoutEngine.stickersToObstacles(page.stickers, page.id);
        
        // Calculate text flow around obstacles
        const layout = await textLayoutEngine.calculateTextFlow(text, obstacles);
        setTextLayout(layout);
      } catch (error) {
        console.warn('Text layout calculation failed:', error);
        setTextLayout(null);
      }
    };

    calculateLayout();
  }, [text, page.stickers, page.id, textLayoutEngine]);

  // Render text lines with wrapping
  const renderWrappedText = () => {
    if (!textLayout || !textLayout.lines.length) {
      return null;
    }

    return textLayout.lines.map((line: any, lineIndex: number) => (
      <View key={lineIndex} style={[styles.textLine, { top: line.yPosition }]}>
        {line.segments.map((segment: any, segmentIndex: number) => (
          <Text
            key={segmentIndex}
            style={[
              styles.textSegment,
              {
                left: segment.startX,
                fontSize: page.content.textStyle.fontSize,
                color: page.content.textStyle.color,
                lineHeight: page.content.textStyle.lineHeight > 5 
                  ? page.content.textStyle.lineHeight  // Already a pixel value
                  : page.content.textStyle.fontSize * page.content.textStyle.lineHeight, // It's a ratio
              },
            ]}
          >
            {segment.text}
          </Text>
        ))}
      </View>
    ));
  };

  if (isEditing) {
    // In editing mode, show dynamically sized TextInput
    // Fix lineHeight calculation - if it's already a pixel value, use it; if it's a ratio, multiply by fontSize
    const lineHeight = page.content.textStyle.lineHeight > 5 
      ? page.content.textStyle.lineHeight  // Already a pixel value
      : page.content.textStyle.fontSize * page.content.textStyle.lineHeight; // It's a ratio
    const minLines = 3;
    const maxLines = Math.floor(height / lineHeight) - 2; // Leave some space
    const estimatedLines = Math.max(minLines, Math.min(maxLines, text.split('\n').length + 1));
    const dynamicHeight = Math.min(height * 0.8, estimatedLines * lineHeight + 20); // Add padding
    
    return (
      <TextInput
        style={[
          styles.textInput,
          {
            width,
            height: dynamicHeight,
            fontSize: page.content.textStyle.fontSize,
            color: page.content.textStyle.color,
            lineHeight: lineHeight,
            textAlign: page.content.textStyle.textAlign,
          },
        ]}
        value={text}
        onChangeText={onTextChange}
        onBlur={onEditingEnd}
        multiline
        autoFocus
        placeholder="Start writing your story..."
        placeholderTextColor="#999"
        textAlignVertical="top"
        scrollEnabled={true}
        selectionColor="rgba(0, 122, 255, 0.3)"
        cursorColor="#007AFF"
      />
    );
  }

  // In display mode, show wrapped text or placeholder
  return (
    <TouchableOpacity
      style={[styles.textDisplay, { width, height }]}
      onPress={onEditingStart}
      activeOpacity={1}
    >
      {text.trim() ? (
        <View style={styles.wrappedTextContainer}>
          {renderWrappedText()}
        </View>
      ) : (
        <Text style={styles.placeholder}>Tap anywhere to start writing...</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textInput: {
    fontFamily: 'System',
    textAlignVertical: 'top',
    verticalAlign: 'top',
    backgroundColor: 'rgba(0, 122, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    paddingTop: 12,
    marginBottom: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  textDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  wrappedTextContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  textLine: {
    position: 'absolute',
    width: '100%',
    height: 24, // Default line height
  },
  textSegment: {
    position: 'absolute',
    fontFamily: 'System',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'left',
    marginTop: 12,
    paddingLeft: 12,
  },
});

export default TextWithStickers;