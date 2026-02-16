import { describe, it, expect } from 'vitest'
import {
  initRunningSheep,
  updateSheep,
  triggerJump,
  getPlanetGeometry,
  getVisibleArcRange,
  planetSurfacePosition,
} from './animation'
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

describe('animation', () => {
  describe('getPlanetGeometry', () => {
    it('returns geometry with center below viewport', () => {
      const geo = getPlanetGeometry(W, H)
      expect(geo.cy).toBeGreaterThan(H)
      expect(geo.radius).toBeGreaterThan(0)
      // Surface top should be in the lower portion of the screen
      const surfaceTop = geo.cy - geo.radius
      expect(surfaceTop).toBeGreaterThan(H * 0.4)
      expect(surfaceTop).toBeLessThan(H * 0.8)
    })
  })

  describe('planetSurfacePosition', () => {
    it('returns position on the circle at given angle', () => {
      const geo = getPlanetGeometry(W, H)
      const pos = planetSurfacePosition(geo, Math.PI / 2, 0)
      // At 90 degrees, should be at the top of the circle
      expect(pos.x).toBeCloseTo(geo.cx, 0)
      expect(pos.y).toBeCloseTo(geo.cy - geo.radius, 0)
    })

    it('adds height above surface', () => {
      const geo = getPlanetGeometry(W, H)
      const ground = planetSurfacePosition(geo, Math.PI / 2, 0)
      const above = planetSurfacePosition(geo, Math.PI / 2, 50)
      expect(above.y).toBeLessThan(ground.y) // higher on screen
    })
  })

  describe('getVisibleArcRange', () => {
    it('returns start > end (left to right decreasing angle)', () => {
      const geo = getPlanetGeometry(W, H)
      const arc = getVisibleArcRange(geo, W, H)
      expect(arc.start).toBeGreaterThan(arc.end)
    })
  })

  describe('initRunningSheep', () => {
    it('creates a sheep within the visible arc', () => {
      const sheep = initRunningSheep(mockDrawing, W, H)
      const geo = getPlanetGeometry(W, H)
      const arc = getVisibleArcRange(geo, W, H)
      expect(sheep.angle).toBeGreaterThanOrEqual(arc.end)
      expect(sheep.angle).toBeLessThanOrEqual(arc.start)
      expect(sheep.speed).toBeGreaterThan(0)
      expect(sheep.jumpHeight).toBe(0)
    })
  })

  describe('updateSheep', () => {
    it('decreases angle over time (moves right)', () => {
      const sheep = initRunningSheep(mockDrawing, W, H)
      const updated = updateSheep(sheep, 1 / 60, W, H)
      expect(updated.angle).toBeLessThan(sheep.angle)
    })

    it('wraps around when exiting the arc', () => {
      const geo = getPlanetGeometry(W, H)
      const arc = getVisibleArcRange(geo, W, H)
      const sheep = {
        ...initRunningSheep(mockDrawing, W, H),
        angle: arc.end - 0.5, // past the right edge
      }
      const updated = updateSheep(sheep, 1 / 60, W, H)
      expect(updated.angle).toBeGreaterThan(arc.end)
    })

    it('advances leg phase', () => {
      const sheep = initRunningSheep(mockDrawing, W, H)
      const updated = updateSheep(sheep, 0.1, W, H)
      expect(updated.legPhase).not.toBe(sheep.legPhase)
    })
  })

  describe('triggerJump', () => {
    it('sets positive jump velocity when on ground', () => {
      const sheep = initRunningSheep(mockDrawing, W, H)
      const jumping = triggerJump(sheep)
      expect(jumping.jumpVelocity).toBeGreaterThan(0)
      expect(jumping.jumpHeight).toBeGreaterThan(0)
    })

    it('does not double-jump', () => {
      const sheep = initRunningSheep(mockDrawing, W, H)
      const jumping = triggerJump(sheep)
      const vel = jumping.jumpVelocity
      const doubleJump = triggerJump(jumping)
      expect(doubleJump.jumpVelocity).toBe(vel)
    })

    it('sheep returns to ground after jump cycle', () => {
      let sheep = initRunningSheep(mockDrawing, W, H)
      sheep = triggerJump(sheep)

      for (let i = 0; i < 120; i++) {
        sheep = updateSheep(sheep, 1 / 60, W, H)
      }

      expect(sheep.jumpHeight).toBe(0)
      expect(sheep.jumpVelocity).toBe(0)
    })
  })
})
