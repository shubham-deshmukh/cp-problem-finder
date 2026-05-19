# CP Problem Finder - Frontend Setup Guide

## 🚀 Quick Start

### Step 1: Organize Components
To organize all components into their respective directories, run:

```bash
npm run organize
```

This will:
1. Create `src/components` directory
2. Create individual directories for each component (Header, SearchBar, Tag, ProblemTable, FAB)
3. Move component files and CSS into their respective folders
4. Create an `index.ts` barrel export for clean imports
5. Move `types.ts` into components folder
6. Clean up old files from src root

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 4: Build for Production
```bash
npm run build
```

## 📁 Final Directory Structure

After running `npm run organize`, your structure will be:

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.css
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchBar.css
│   │   ├── Tag/
│   │   │   ├── Tag.tsx
│   │   │   └── Tag.css
│   │   ├── ProblemTable/
│   │   │   ├── ProblemTable.tsx
│   │   │   └── ProblemTable.css
│   │   ├── FAB/
│   │   │   ├── FAB.tsx
│   │   │   └── FAB.css
│   │   ├── types.ts
│   │   └── index.ts (barrel export)
│   ├── App.tsx
│   ├── App.css
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   └── assets/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── organize.js
├── cleanup.js
└── index.html
```

## 🎯 Component Structure

Each component follows this pattern:

```
ComponentName/
├── ComponentName.tsx  (Component logic)
└── ComponentName.css  (Component styles)
```

Example imports after organization:

```typescript
// Clean imports from barrel export
import { Header, SearchBar, ProblemTable, FAB } from './components';

// Or direct imports
import { Header } from './components/Header/Header';
import { Tag } from './components/Tag/Tag';
```

## ✨ Features

✅ Clean, modular component structure
✅ Each component in its own directory
✅ Dedicated CSS per component
✅ Barrel exports for clean imports
✅ TypeScript support
✅ Light/Dark theme support
✅ Fully responsive design
✅ Mock data included

## 🔧 Available Scripts

- `npm run organize` - Organize components into directories
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Notes

- The organize script copies files first, then cleans up old files
- All imports have been updated to use the new structure
- Types are now in `components/types.ts`
- Mock data is in `data.ts` (src root)
- Main app orchestration is in `App.tsx`

## 🧪 Testing

After running `npm run organize`:

1. Run `npm install` if needed
2. Run `npm run dev`
3. Check that the app loads without errors
4. Test search functionality
5. Test theme toggle
6. Verify all components render correctly

Enjoy your organized, maintainable React frontend! 🎉
