import type { RunningSheep, PlanetGeometry } from './animation'
import { planetSurfacePosition, SHEEP_WIDTH, SHEEP_HEIGHT } from './animation'

export function hitTest(
  clickX: number,
  clickY: number,
  sheep: RunningSheep,
  geo: PlanetGeometry,
): boolean {
  // Get sheep center position on screen
  const pos = planetSurfacePosition(geo, sheep.angle, sheep.jumpHeight + SHEEP_HEIGHT / 2)
  const dx = clickX - pos.x
  const dy = clickY - pos.y
  const hitRadius = Math.max(SHEEP_WIDTH, SHEEP_HEIGHT) * 0.55
  return dx * dx + dy * dy <= hitRadius * hitRadius
}
