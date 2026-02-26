# Pill Splitter

Interactive canvas application for splitting and manipulating pill shapes with precise geometric calculations and drag-and-drop interactions.

![alt text](<./public/pill-splitter.png>)

## Technical Implementation Highlights

- **2D AABB Collision Detection**: Axis-aligned bounding box intersection tests to detect cursor-to-pill collisions for splitting operations
- **Adaptive Border-Radius Preservation**: Smart corner-radius calculations that preserve appropriate rounded corners on split segments based on their position
- **Dual-Mode Interaction Model**: Distinguishes between canvas interactions (draw/split) and pill interactions (drag) via event propagation control
- **Canvas-Style Drawing**: Drag-to-create pills with real-time preview; click/drag to split at cursor position; drag pills to reposition
- **Constraint-Based Validation**: Enforces minimum part size (20px) during splits, with automatic position adjustment fallback when constraints unmet
- **Global Cursor Tracking**: Real-time crosshair overlay synchronized with mouse movement via global event listeners
- **Strong Type Safety**: Fully typed Pill interface with spread operator immutability patterns using React hooks (useState, useCallback, useMemo)
- **Build Tooling**: Vite 7 for fast dev server (HMR), TypeScript 5.8 for strict type checking, Tailwind CSS 4 for styling

## Development

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Type check and build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.tsx          # Main application logic and canvas rendering
├── main.tsx         # React entry point
├── index.css        # Global styles
└── vite-env.d.ts    # Vite environment types
```
