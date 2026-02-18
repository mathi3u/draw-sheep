# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dessine-moi un mouton** — A web app inspired by [gradient.horse](http://gradient.horse) and Le Petit Prince. Users draw sheep (moutons) with separate body parts (body, hind legs, front legs), then release them to walk across a curved moon surface under a starry night sky. All sheep are shared — everyone sees everyone's sheep.

### Core Interactions
- **Draw**: Modal (auto-opens on page load) with canvas to freehand-draw a sheep in 3 layers
- **Walk**: Sheep walk along the curved moon surface (angle-based movement on a sphere)
- **Click/tap**: Makes a sheep jump
- **Double-click/tap**: Removes a sheep (soft-delete)
- **Sheep Amnesty**: Restores all removed sheep

### Theme
Le Petit Prince — deep navy sky, golden 4-pointed twinkling stars, grey moon surface with craters and flowers. Caveat font (Google Fonts). Stone-shaped SVG buttons inspired by gradient.horse.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Drawing**: Raw HTML Canvas API (no canvas libraries)
- **Database**: Turso (libSQL cloud SQLite) — use `@libsql/client/web` (NOT `@libsql/client`) for Netlify serverless compatibility
- **Deployment**: Netlify (https://draw-sheep.netlify.app)
- **Font**: Caveat via Google Fonts CDN

## Commands

```bash
npm run dev          # Start dev server (find available port first)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run test -- --run src/path/to/file.test.ts  # Single test file
npm run lint         # ESLint
npm run build && npx netlify deploy --prod --dir=.next  # Deploy
```

## Architecture

### Data Flow
Frontend (`page.tsx`) → API routes (`/api/sheep/*`) → Turso DB (`@libsql/client/web`)

### API Routes
- `GET /api/sheep` — Fetch all sheep
- `POST /api/sheep` — Create a new sheep (body as JSON)
- `DELETE /api/sheep/[id]` — Soft-remove a sheep
- `POST /api/sheep/amnesty` — Restore all removed sheep
- `POST /api/sheep/seed` — Seed sample sheep (runs once when DB is empty)

### Drawing System
Each sheep = 3 canvas layers drawn separately:
1. **Body** — main shape
2. **Hind legs** — back legs (animate together)
3. **Front legs** — front legs (animate together)

Each layer = array of strokes `{ points: [{x, y}], color, size }`. In the draw modal, layers have distinct colors (white/pink/blue) for clarity. On the main canvas, all layers render in uniform white.

### Animation System (angle-based)
Sheep walk on a curved moon surface using angle-based positioning:
- `PlanetGeometry { cx, cy, radius }` — the moon sphere
- `RunningSheep { angle, speed, legPhase, jumpVelocity, jumpHeight }` — position on the arc
- Sheep rotate perpendicular to surface at their angle (`ctx.rotate(Math.PI / 2 - angle)`)
- Canvas clipping (evenodd) hides sheep behind the moon surface
- Visible arc range calculated from viewport intersection with the sphere

### Component Structure
- `app/page.tsx` — Main page, fetches sheep from API, stone buttons (gallery, +, ?), screen size guard
- `app/api/sheep/` — API routes for CRUD
- `components/SheepCanvas.tsx` — Full-screen animation canvas
- `components/DrawModal.tsx` — Drawing interface (dark canvas, 3 layers, pointer events)
- `components/InfoModal.tsx` — Explainer with gradient.horse credit
- `components/GalleryModal.tsx` — Grid of all sheep as mini canvas thumbnails
- `lib/db.ts` — Turso client (web)
- `lib/animation.ts` — Angle-based movement, planet geometry, jump physics
- `lib/background.ts` — Sky, stars, moon surface, craters, flowers
- `lib/drawing.ts` — Stroke rendering, undo, clear
- `lib/hit-detection.ts` — Circular hit test on planet surface
- `lib/sheep-store.ts` — Legacy localStorage wrapper (tests only, not used in production)

### Environment Variables
```
TURSO_DATABASE_URL=libsql://draw-sheep-emrom.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=<token>
```
Set in `.env.local` (gitignored) and Netlify env vars.
