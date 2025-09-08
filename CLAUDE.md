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

## Recent Updates

### UI/UX Improvements (Latest)

**Icon System Standardization**:
- Implemented semantic icon sizing system (xs=12px, sm=16px, md=20px, lg=24px, xl=32px)
- Replaced hardcoded pixel values with consistent size tokens across all components
- Fixed tab navigation focus effects to prevent jarring size changes
- Updated all icon usage in MainNavigator, JournalToolbar, ModSpaceProfile, and StickerPalette

**ModSpace Layout Enhancements**:
- Integrated user stats (Entries, Views, Followers, Following) into ProfileHeader component
- Moved quick action buttons (New Entry, Share, Customize) below profile stats for better flow
- Removed duplicate large journal action buttons, streamlining the interface
- Made quick action buttons span full width with even distribution using `flex: 1`
- Added responsive layout for shared journal entries (vertical in portrait, 2-column grid in landscape)

**Journal Creation Flow Simplification**:
- Removed title entry modal during journal creation - now creates instantly with auto-generated title
- Added editable title header directly in JournalEditor for inline editing
- Implemented `updateJournalTitle` action in journal slice for real-time title updates
- Streamlined posting flow with simple Public/Private button selection
- Auto-generates post excerpts from current page content and navigates back to ModSpace after posting

**Device Orientation Support**:
- Fixed iPhone orientation detection by changing app.json from `"orientation": "portrait"` to `"orientation": "default"`
- Enabled proper landscape mode functionality for responsive layouts across all device types
- Journal entries now properly adapt layout when device orientation changes

### Journal Editor & Sticker System Enhancements (Latest)

**Navigation & Page Management Reorganization**:
- Moved page navigation controls (Prev, Next, Page Indicator, Add Page) from bottom toolbar to journal header
- Separated page navigation from page creation - dedicated "+" button for adding pages
- Next/Prev buttons now only navigate existing pages, preventing accidental page creation
- Reduced journal title size (20px → 16px) to accommodate navigation controls in header
- Improved mobile responsiveness with better button spacing and sizing

**Bottom Toolbar Redesign**:
- Simplified toolbar to focus on primary actions: "Customize" (left) and "Post" (right)
- Changed sticker palette trigger from icon to "Customize" text button for clarity
- Improved button placement using space-between layout for better visual balance
- Removed navigation clutter from toolbar, creating cleaner interface

**Resizable Sticker Palette System**:
- Converted sticker palette from fixed overlay to full-screen bottom drawer
- Implemented draggable resize functionality using React Native Reanimated 3
- Users can drag the handle to adjust drawer height (30% - 80% of screen)
- Added smooth spring animations with velocity support for natural interactions
- Smart height snapping prevents accidental closure and maintains usable sizes

**Enhanced Sticker Collection & Display**:
- Expanded sticker library with 3 categories: Emotions (4 stickers), Nature (4 stickers), Objects (4 stickers)  
- Optimized sticker display sizing (24px → 18px) for better space utilization
- Increased grid density from 4 to 5 columns for more efficient browsing
- Improved sticker button styling with tighter margins and smaller corner radius
- Fixed sticker initialization timing issues for reliable category loading

**Improved User Experience**:
- Added backdrop dismissal - tap outside drawer to close
- Enhanced visual feedback with prominent drag handle and proper touch areas
- Better error handling with loading states and empty category messages
- Responsive page targeting ensures stickers are placed on currently viewed page
- Maintains consistent functionality across portrait and landscape orientations

### ModSpace Profile Customization System (Latest Major Feature)

**Comprehensive Theme & Layout Customization Engine**: Implemented a complete profile personalization system allowing users to transform their ModSpace appearance with professional-grade customization tools.

**Core Features Implemented**:

**Advanced Theme System**:
- **6 Professional Theme Presets**: Light, Dark, Vintage, Pastel, Bold, and Modern themes with unique color palettes and styling
- **Custom Theme Creation**: Users can create, save, and share custom themes with full color control
- **Real-time Preview**: All changes preview instantly before applying, with smooth transition animations
- **Theme History**: Comprehensive undo/redo system with theme change tracking and rollback capabilities
- **Import/Export**: Complete theme configurations can be exported/imported for community sharing
- **Accessibility Integration**: WCAG contrast checking, color-blind friendly options, and high-contrast mode support

**Layout Engine (5 Distinct Styles)**:
- **Grid Layout**: Pinterest-style masonry grid with responsive column management and aspect ratio control
- **Timeline Layout**: Chronological feed with intelligent date grouping, timeline visualization, and entry metadata
- **Magazine Layout**: Editorial-style layout with featured entries, varied card sizes, and overlay text effects
- **Minimal Layout**: Clean, text-focused design with typography emphasis and reading time calculations
- **Creative Layout**: Drag & drop positioning with collision detection, snap-to-grid, and custom placement controls

**Advanced Customization Controls**:
- **Color System**: Full hex color picker, palette generation, preset color collections, and theme-aware color validation
- **Typography Engine**: Font family selection (system, serif, monospace), weight control, size scaling, line height, and letter spacing
- **Visual Effects**: Shadow configuration (opacity, blur, offset), border radius control, card elevation, and animation settings
- **Animation Controls**: Speed settings (slow/normal/fast), easing types (ease, spring, etc.), and enable/disable toggles

**Technical Architecture**:

**State Management**: 
- React Context API for theme state with optimized re-rendering
- AsyncStorage persistence with automatic cloud backup preparation
- Redux integration for layout preferences and profile settings
- Theme interpolation system for smooth transitions between themes

**Performance Optimizations**:
- Memoized theme calculations to prevent unnecessary re-renders
- Lazy loading of theme assets and custom fonts
- Efficient collision detection algorithms for creative layout positioning
- Virtual scrolling preparation for large journal collections

**User Experience Design**:
- **Tabbed Interface**: Organized into 5 intuitive categories (Themes, Layout, Colors, Typography, Effects)
- **Modal Presentation**: Full-screen customization panel with smooth slide animations
- **Unsaved Changes Protection**: Exit confirmation dialogs and preview mode indicators
- **Live Preview**: All changes apply instantly to the interface for immediate feedback
- **Professional Controls**: Slider components, color pickers, preset galleries, and toggle switches

**Integration Points**:
- Fully integrated with existing ModSpace profile system
- Theme settings automatically persist across app sessions
- Layout changes apply to journal entry displays in real-time
- Color customizations affect all UI components consistently

**File Structure Added**:
```
src/
├── contexts/
│   └── ThemeContext.tsx (Theme state management)
├── services/
│   ├── ThemeEngine.ts (Color generation, accessibility validation)
│   └── LayoutEngine.ts (Positioning algorithms, collision detection)
├── components/modspace/
│   ├── CustomizationPanel.tsx (Main interface)
│   ├── layouts/ (5 layout implementations)
│   │   ├── GridLayout.tsx
│   │   ├── TimelineLayout.tsx
│   │   ├── MagazineLayout.tsx
│   │   ├── MinimalLayout.tsx
│   │   └── CreativeLayout.tsx
│   ├── editors/ (Customization controls)
│   │   ├── ThemeEditor.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── TypographyEditor.tsx
│   │   ├── EffectsEditor.tsx
│   │   └── LayoutEditor.tsx
│   └── cards/
│       └── JournalEntryCard.tsx (Responsive entry display)
```

**Usage**: Users access the full customization system by tapping "Customize" in ModSpace profile, enabling complete visual personalization of their journal space within an intuitive, professional interface.