# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm start
# or
npx expo start
npx expo start --clear  # Clear cache if needed
```

**Platform-specific builds:**
```bash
npx expo run:ios      # iOS simulator
npx expo run:android  # Android emulator  
npx expo start --web  # Web browser
```

## Project Architecture

**Modexe** is a React Native journalism app built with Expo that combines visual storytelling with social sharing. The app has two primary features: a responsive journal editor and a customizable profile system called "ModSpace".

### Core Concept
- **Journal**: Two-page spread format with drag-and-drop stickers and intelligent text wrapping
- **ModSpace**: Personal profile hub for sharing journal entries with customizable layouts and themes
- **Responsive Design**: Single page in portrait mode, dual-page spread in landscape mode

### State Management - Redux Toolkit

The app uses a centralized Redux store with three main slices:

**`src/store/index.ts`** - Main store configuration with serialization handling for Date objects and complex data structures.

**`src/store/journalSlice.ts`** - Journal management:
- `currentJournal`: Active journal with pages, content, and stickers
- `currentSpreadIndex`: Landscape mode pagination (dual-page spreads)
- `currentPageIndex`: Portrait mode pagination (single pages)
- Actions: `createJournal`, `updatePageContent`, `addSticker`, `updateSticker`, `setCurrentSpread`, `setCurrentPage`, `nextPage`, `prevPage`

**`src/store/stickerSlice.ts`** - Sticker system:
- `availableStickers`: Sticker categories and items
- `placedStickers`: Stickers placed on pages  
- `selectedSticker`: Currently selected sticker for editing
- Drag-and-drop state management with position, scale, rotation, z-index

**`src/store/modspaceSlice.ts`** - Profile system:
- `currentModSpace`: User's profile data and customization
- `sharedContent`: Shared journal entries and media
- Layout templates, themes, privacy settings, social links

### Navigation Architecture

**Stack + Tab Navigation** (`src/components/navigation/MainNavigator.tsx`):
- **ModSpace**: Primary tab - personal profile and content hub (default screen)
- **Discover**: Future social discovery features
- **Settings**: App configuration (placeholder)
- **JournalEditor**: Full-screen stack screen launched from ModSpace

Uses React Navigation with stack navigator as root, bottom tabs for main sections, and orientation-aware styling. ModSpace serves as the central hub for journal creation and sharing.

### Text Layout System

**`src/services/TextLayoutEngine.ts`** - Advanced text wrapping engine:
- Calculates text flow around obstacles (stickers)
- Line-by-line text fitting with available segments
- Handles word breaking, line height, and text positioning
- Converts stickers to geometric obstacles for text avoidance
- Supports cursor positioning and text selection

Key methods:
- `calculateTextFlow()`: Main text layout calculation
- `getAvailableLineSegments()`: Finds text-safe areas around stickers  
- `fitWordsToLineSegments()`: Fits words into available space
- `stickersToObstacles()`: Converts sticker positions to text obstacles

### Responsive Layout System

**`src/utils/useOrientation.ts`** - Device orientation detection hook providing:
- Screen dimensions and orientation state
- `isPortrait`/`isLandscape` boolean flags
- Real-time orientation change handling

**Layout Behavior:**
- **Portrait**: Single page navigation (pages 1, 2, 3, 4...) using `currentPageIndex`
- **Landscape**: Dual-page spread navigation (pages 1-2, 3-4...) using `currentSpreadIndex`
- **Synchronized pagination**: Indices sync automatically when orientation changes
- Dynamic page width calculation based on screen size and orientation

### Component Architecture

**Journal Components:**
- `JournalEditor`: Main container with toolbar and spread view
- `JournalSpread`: Orientation-aware layout handler  
- `JournalPage`: Individual page with inline text editing
- `JournalToolbar`: Navigation, page management, and "Post to ModSpace" functionality
- `StickerPalette`: Expandable sticker selection interface
- `DraggableSticker`: Gesture-handled sticker with transform controls

**ModSpace Components:**
- `ModSpaceProfile`: Main profile container
- `ProfileHeader`: Customizable profile header with avatar, bio, social links
- Layout system supports: Grid, Timeline, Magazine, Minimal, Creative layouts

### Type System

**Core Types:**
- `src/types/journal.types.ts`: Journal, JournalPage, RichTextContent, TextStyle
- `src/types/sticker.types.ts`: StickerInstance, Position, DragState  
- `src/types/modspace.types.ts`: ModSpace, LayoutType, ThemeConfig, SharedJournalEntry
- `src/types/text.types.ts`: TextLayoutResult, TextLine, Obstacle

### Key Technical Decisions

**Gesture Handling**: Uses React Native Reanimated 3 with new Gesture API (not deprecated PanGestureHandler)

**State Serialization**: Custom Redux middleware configuration to handle Date objects and complex nested data structures in journal pages and sticker instances

**Text Wrapping**: Custom geometric algorithm for text-sticker collision detection rather than using existing libraries

**Responsive Design**: Orientation-based component switching rather than CSS media queries

**ModSpace-Centric Architecture**: 
- Journal creation flows through ModSpace with seamless navigation to full-screen editor
- "Post to ModSpace" feature allows sharing journal pages with custom titles, excerpts, and page selection
- Dual pagination system ensures proper page numbering in both portrait (individual pages) and landscape (spreads) modes
- ModSpace displays shared journal entries and serves as the primary app entry point

**Development Notes**:
- Sticker constants removed circular references to prevent stack overflow errors
- Redux store ignores non-serializable paths for Date objects and sticker data
- Navigation uses emoji icons (can be replaced with proper icon library)
- Assets stored in `assets/images/` directory for sticker graphics