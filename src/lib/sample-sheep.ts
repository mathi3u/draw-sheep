import { addSheep } from './sheep-store'
import type { Stroke } from './types'

// Helper to create a simple ellipse-like path
function ovalPath(cx: number, cy: number, rx: number, ry: number, steps = 20): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    points.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    })
  }
  return points
}

// Helper to create a line
function linePath(x1: number, y1: number, x2: number, y2: number): { x: number; y: number }[] {
  return [{ x: x1, y: y1 }, { x: x2, y: y2 }]
}

// Fluffy sheep — round body with wooly bumps
function fluffySheep(): { body: Stroke[]; hindLegs: Stroke[]; frontLegs: Stroke[] } {
  const body: Stroke[] = [
    // Main fluffy body
    { points: ovalPath(150, 120, 65, 45), color: '#333333', size: 4 },
    // Head
    { points: ovalPath(210, 95, 22, 20), color: '#333333', size: 3 },
    // Eye
    { points: [{ x: 218, y: 90 }, { x: 219, y: 90 }], color: '#333333', size: 4 },
    // Ear
    { points: [{ x: 200, y: 78 }, { x: 195, y: 68 }, { x: 205, y: 72 }], color: '#333333', size: 2 },
    // Wool bumps
    { points: ovalPath(120, 85, 15, 12), color: '#333333', size: 2 },
    { points: ovalPath(145, 80, 15, 12), color: '#333333', size: 2 },
    { points: ovalPath(170, 82, 15, 12), color: '#333333', size: 2 },
  ]

  const hindLegs: Stroke[] = [
    { points: linePath(105, 155, 100, 200), color: '#e74c3c', size: 3 },
    { points: linePath(125, 155, 120, 200), color: '#e74c3c', size: 3 },
  ]

  const frontLegs: Stroke[] = [
    { points: linePath(175, 155, 180, 200), color: '#3498db', size: 3 },
    { points: linePath(195, 155, 200, 200), color: '#3498db', size: 3 },
  ]

  return { body, hindLegs, frontLegs }
}

// Skinny sheep — tall and slender
function skinnySheep(): { body: Stroke[]; hindLegs: Stroke[]; frontLegs: Stroke[] } {
  const body: Stroke[] = [
    { points: ovalPath(150, 115, 50, 35), color: '#333333', size: 3 },
    // Head (longer face)
    { points: ovalPath(205, 95, 18, 22), color: '#333333', size: 3 },
    // Eye
    { points: [{ x: 212, y: 90 }, { x: 213, y: 90 }], color: '#333333', size: 3 },
    // Tail
    { points: [{ x: 100, y: 105 }, { x: 85, y: 95 }, { x: 90, y: 100 }], color: '#333333', size: 2 },
  ]

  const hindLegs: Stroke[] = [
    { points: linePath(115, 145, 112, 205), color: '#e74c3c', size: 2 },
    { points: linePath(130, 145, 127, 205), color: '#e74c3c', size: 2 },
  ]

  const frontLegs: Stroke[] = [
    { points: linePath(175, 145, 178, 205), color: '#3498db', size: 2 },
    { points: linePath(188, 145, 191, 205), color: '#3498db', size: 2 },
  ]

  return { body, hindLegs, frontLegs }
}

// Baby sheep — small and round
function babySheep(): { body: Stroke[]; hindLegs: Stroke[]; frontLegs: Stroke[] } {
  const body: Stroke[] = [
    { points: ovalPath(150, 135, 40, 32), color: '#333333', size: 4 },
    // Head
    { points: ovalPath(190, 118, 18, 17), color: '#333333', size: 3 },
    // Eye
    { points: [{ x: 196, y: 114 }, { x: 197, y: 114 }], color: '#333333', size: 5 },
    // Ear
    { points: [{ x: 183, y: 104 }, { x: 178, y: 95 }, { x: 188, y: 100 }], color: '#333333', size: 2 },
  ]

  const hindLegs: Stroke[] = [
    { points: linePath(122, 162, 120, 200), color: '#e74c3c', size: 3 },
    { points: linePath(138, 162, 136, 200), color: '#e74c3c', size: 3 },
  ]

  const frontLegs: Stroke[] = [
    { points: linePath(162, 162, 165, 200), color: '#3498db', size: 3 },
    { points: linePath(178, 162, 181, 200), color: '#3498db', size: 3 },
  ]

  return { body, hindLegs, frontLegs }
}

export function addSampleSheep(): void {
  addSheep(fluffySheep())
  addSheep(skinnySheep())
  addSheep(babySheep())
}
