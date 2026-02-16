import { describe, it, expect } from 'vitest'
import { hitTest } from './hit-detection'
import { initRunningSheep, getPlanetGeometry, planetSurfacePosition, SHEEP_HEIGHT } from './animation'
import type { SheepDrawing } from './types'

const mockDrawing: SheepDrawing = {
  id: 'test-1',
  body: [],
  hindLegs: [],
  frontLegs: [],
  createdAt: Date.now(),
  removed: false,
}

const W = 1920
const H = 1080

describe('hitTest', () => {
  it('returns true when clicking near sheep center', () => {
    const geo = getPlanetGeometry(W, H)
    const sheep = {
      ...initRunningSheep(mockDrawing, W, H),
      angle: Math.PI / 2, // top of arc
    }
    // Sheep center is at the surface + half height
    const center = planetSurfacePosition(geo, Math.PI / 2, SHEEP_HEIGHT / 2)
    expect(hitTest(center.x, center.y, sheep, geo)).toBe(true)
  })

  it('returns false when clicking far from sheep', () => {
    const geo = getPlanetGeometry(W, H)
    const sheep = {
      ...initRunningSheep(mockDrawing, W, H),
      angle: Math.PI / 2,
    }
    expect(hitTest(0, 0, sheep, geo)).toBe(false)
  })

  it('accounts for jump height', () => {
    const geo = getPlanetGeometry(W, H)
    const sheep = {
      ...initRunningSheep(mockDrawing, W, H),
      angle: Math.PI / 2,
      jumpHeight: 80,
    }
    // Center when jumping
    const jumpCenter = planetSurfacePosition(geo, Math.PI / 2, 80 + SHEEP_HEIGHT / 2)
    expect(hitTest(jumpCenter.x, jumpCenter.y, sheep, geo)).toBe(true)

    // Original ground position should miss
    const groundCenter = planetSurfacePosition(geo, Math.PI / 2, SHEEP_HEIGHT / 2)
    expect(hitTest(groundCenter.x, groundCenter.y, sheep, geo)).toBe(false)
  })
})
