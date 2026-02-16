import type { SheepDrawing } from './types'

export interface PlanetGeometry {
  cx: number
  cy: number
  radius: number
}

export interface RunningSheep {
  drawing: SheepDrawing
  angle: number        // position on moon arc (radians)
  speed: number        // angular speed (radians per second)
  legPhase: number     // 0-1 for leg animation cycle
  jumpVelocity: number // positive = away from surface
  jumpHeight: number   // height above surface (pixels)
}

export const SHEEP_WIDTH = 80
export const SHEEP_HEIGHT = 64
export const DRAWING_WIDTH = 300
export const DRAWING_HEIGHT = 240

const BASE_ANGULAR_SPEED = 0.06
const SPEED_VARIANCE = 0.02
const GRAVITY = 400
const JUMP_VELOCITY = 180

export function getPlanetGeometry(w: number, h: number): PlanetGeometry {
  const radius = h * 1.0
  const cx = w * 0.48
  const cy = h * 1.6
  return { cx, cy, radius }
}

export function planetSurfacePosition(
  geo: PlanetGeometry,
  angle: number,
  heightAboveSurface: number = 0,
): { x: number; y: number } {
  const r = geo.radius + heightAboveSurface
  return {
    x: geo.cx + r * Math.cos(angle),
    y: geo.cy - r * Math.sin(angle),
  }
}

/**
 * Returns the angular range where the moon arc is visible on screen.
 * start > end because sheep walk from higher angles (left) to lower angles (right).
 */
export function getVisibleArcRange(
  geo: PlanetGeometry,
  w: number,
  h: number,
): { start: number; end: number } {
  // Where does the planet surface go below the bottom of the screen?
  // cy - R*sin(θ) = h => sin(θ) = (cy - h) / R
  const sinBound = Math.min(1, Math.max(0, (geo.cy - h) / geo.radius))
  const bottomAngle = Math.asin(sinBound)

  // Where does the arc go off the left/right edges?
  // Left: cx + R*cos(θ) = 0 => cos(θ) = -cx/R
  const cosLeft = Math.max(-1, -geo.cx / geo.radius)
  const leftAngle = Math.acos(cosLeft)

  // Right: cx + R*cos(θ) = w => cos(θ) = (w - cx)/R
  const cosRight = Math.min(1, (w - geo.cx) / geo.radius)
  const rightAngle = Math.acos(cosRight)

  // Visible arc is bounded by all constraints
  const start = Math.min(leftAngle, Math.PI - bottomAngle)
  const end = Math.max(rightAngle, bottomAngle)

  return { start, end }
}

export function initRunningSheep(
  drawing: SheepDrawing,
  canvasWidth: number,
  canvasHeight: number,
): RunningSheep {
  const geo = getPlanetGeometry(canvasWidth, canvasHeight)
  const arc = getVisibleArcRange(geo, canvasWidth, canvasHeight)
  const speed = BASE_ANGULAR_SPEED + (Math.random() - 0.5) * SPEED_VARIANCE * 2

  // Random position on the visible arc
  const angle = arc.end + Math.random() * (arc.start - arc.end)

  return {
    drawing,
    angle,
    speed,
    legPhase: Math.random(),
    jumpVelocity: 0,
    jumpHeight: 0,
  }
}

export function updateSheep(
  sheep: RunningSheep,
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number,
): RunningSheep {
  const geo = getPlanetGeometry(canvasWidth, canvasHeight)
  const arc = getVisibleArcRange(geo, canvasWidth, canvasHeight)

  let { angle, legPhase, jumpVelocity, jumpHeight } = sheep

  // Move along arc (decreasing angle = left to right on the surface)
  angle -= sheep.speed * deltaTime

  // Wrap around: re-enter from the left side
  const margin = 0.25
  if (angle < arc.end - margin) {
    angle = arc.start + margin
  }

  // Leg animation
  legPhase = (legPhase + deltaTime * 3) % 1

  // Jump physics (positive jumpHeight = away from surface)
  if (jumpVelocity !== 0 || jumpHeight > 0) {
    jumpHeight += jumpVelocity * deltaTime
    jumpVelocity -= GRAVITY * deltaTime
    if (jumpHeight <= 0) {
      jumpHeight = 0
      jumpVelocity = 0
    }
  }

  return { ...sheep, angle, legPhase, jumpVelocity, jumpHeight }
}

export function triggerJump(sheep: RunningSheep): RunningSheep {
  if (sheep.jumpHeight > 0) return sheep
  return { ...sheep, jumpVelocity: JUMP_VELOCITY, jumpHeight: 0.1 }
}
