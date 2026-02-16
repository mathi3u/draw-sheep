# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dessine-moi un mouton** — A web app inspired by [gradient.horse](http://gradient.horse) and Le Petit Prince. Users draw sheep (moutons) with separate body parts (body, hind legs, front legs), then release them to run across the screen alongside other users' sheep.

### Core Interactions
- **Draw**: Modal with canvas to freehand-draw a sheep (body, hind legs, front legs as separate layers)
- **Run**: Sheep parade across the screen left-to-right, legs animate
- **Click/tap**: Makes a sheep jump
- **Double-click/tap**: Removes a sheep permanently
- **Sheep Amnesty**: Button to restore all removed sheep

### Theme
Le Petit Prince — starry night sky with moon, desert/planet surface as ground. No gradient background (unlike gradient.horse).

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Drawing**: Raw HTML Canvas API (no canvas libraries)
- **Storage**: localStorage for now (online persistence TBD)
- **Deployment**: Local dev first, Netlify later

## Commands

```bash
npm run dev          # Start dev server (find available port first)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run test -- --run src/path/to/file.test.ts  # Single test file
npm run lint         # ESLint
```

## Architecture

### Drawing System
Each sheep drawing consists of 3 canvas layers drawn separately by the user:
1. **Body** — main shape
2. **Hind legs** — back legs (animate together)
3. **Front legs** — front legs (animate together)

Each layer is stored as an array of strokes. A stroke = `{ points: [{x, y}], color: string, size: number }`. Layers are composited at render time with legs animating (alternating vertical offset) to simulate running.

### Sheep Data Model
```typescript
interface SheepDrawing {
  id: string
  body: Stroke[]
  hindLegs: Stroke[]
  frontLegs: Stroke[]
  createdAt: number
  removed: boolean  // soft-delete for amnesty feature
}
```

### Animation Loop
- Single `requestAnimationFrame` loop renders the scene
- Background: starry night sky, moon, desert ground
- Each sheep moves left-to-right at a base speed + slight random variance
- When a sheep exits right edge, it re-enters from the left
- Legs alternate vertical offset on a timer to simulate walking/running
- Jump = temporary upward arc on the sheep's zHeight
- Hit detection: check click position against each sheep's bounding box

### Component Structure
- `app/page.tsx` — Main scene with canvas + draw button
- `components/SheepCanvas.tsx` — The full-screen animation canvas
- `components/DrawModal.tsx` — Drawing interface modal (canvas + tools)
- `components/InfoModal.tsx` — Explainer page
- `lib/sheep-store.ts` — localStorage read/write for sheep data
- `lib/animation.ts` — requestAnimationFrame loop, sheep movement, leg animation
- `lib/drawing.ts` — Freehand drawing utilities (stroke capture, undo, clear)
- `lib/hit-detection.ts` — Click-to-sheep collision detection

### Drawing Modal Tools
- Layer selector: Body / Hind Legs / Front Legs (color-coded circles like gradient.horse)
- Brush size slider
- Undo button (per-layer stroke stack)
- Clear button
- "Lache ton mouton !" submit button

### Key Constraints
- Max ~50 sheep on screen at once (performance)
- Sheep face right (draw facing right)
- Canvas drawing uses pointer events (works on touch + mouse)
- Sheep are drawn at a fixed size in the modal, scaled proportionally on the main canvas
