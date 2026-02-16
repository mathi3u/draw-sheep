import type { PlanetGeometry } from './animation'

interface Star {
  x: number
  y: number
  size: number
  type: 'dot' | 'star'
  brightness: number
}

let stars: Star[] = []
let lastWidth = 0
let lastHeight = 0

function initStars(width: number, height: number, surfaceTopY: number): void {
  stars = []
  const skyHeight = surfaceTopY - 30

  // Small dot stars
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * skyHeight,
      size: Math.random() * 1.2 + 0.5,
      type: 'dot',
      brightness: Math.random(),
    })
  }

  // Larger 4-pointed stars (Le Petit Prince style)
  for (let i = 0; i < 15; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * skyHeight * 0.9,
      size: Math.random() * 5 + 3,
      type: 'star',
      brightness: Math.random(),
    })
  }

  lastWidth = width
  lastHeight = height
}

function draw4PointedStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
): void {
  ctx.fillStyle = `rgba(255, 215, 80, ${alpha})`
  ctx.beginPath()
  const inner = size * 0.2
  for (let i = 0; i < 4; i++) {
    const outerAngle = (i * Math.PI) / 2
    const innerAngle = outerAngle + Math.PI / 4
    if (i === 0) {
      ctx.moveTo(x + Math.cos(outerAngle) * size, y + Math.sin(outerAngle) * size)
    } else {
      ctx.lineTo(x + Math.cos(outerAngle) * size, y + Math.sin(outerAngle) * size)
    }
    ctx.lineTo(x + Math.cos(innerAngle) * inner, y + Math.sin(innerAngle) * inner)
  }
  ctx.closePath()
  ctx.fill()
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  geo: PlanetGeometry,
): void {
  const surfaceTopY = geo.cy - geo.radius

  if (lastWidth !== width || lastHeight !== height) {
    initStars(width, height, surfaceTopY)
  }

  // Deep blue sky (Le Petit Prince style)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height)
  skyGradient.addColorStop(0, '#0c1445')
  skyGradient.addColorStop(0.3, '#152058')
  skyGradient.addColorStop(0.6, '#1c2d6a')
  skyGradient.addColorStop(1, '#1a2860')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height)

  // Stars with twinkle
  for (const star of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * 1.5 + star.brightness * 12)
    const alpha = 0.4 + twinkle * 0.6

    if (star.type === 'dot') {
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 220, 100, ${alpha})`
      ctx.fill()
    } else {
      draw4PointedStar(ctx, star.x, star.y, star.size, alpha)
    }
  }

  // Moon surface (grey sphere, only top arc visible)
  const gradient = ctx.createRadialGradient(
    geo.cx + geo.radius * 0.12,
    geo.cy - geo.radius * 0.88,
    geo.radius * 0.05,
    geo.cx,
    geo.cy,
    geo.radius,
  )
  gradient.addColorStop(0, '#8a90a2')
  gradient.addColorStop(0.3, '#717788')
  gradient.addColorStop(0.6, '#5c6272')
  gradient.addColorStop(1, '#3e4352')

  ctx.beginPath()
  ctx.arc(geo.cx, geo.cy, geo.radius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // Subtle craters
  drawCraters(ctx, geo)

  // Surface rim highlight
  ctx.beginPath()
  ctx.arc(geo.cx, geo.cy, geo.radius, -Math.PI * 0.75, -Math.PI * 0.25)
  ctx.strokeStyle = 'rgba(160, 165, 185, 0.15)'
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawCraters(ctx: CanvasRenderingContext2D, geo: PlanetGeometry): void {
  const craters = [
    { angle: 1.2, dist: 0.92, size: 25 },
    { angle: 0.8, dist: 0.95, size: 15 },
    { angle: 1.6, dist: 0.88, size: 20 },
    { angle: 0.5, dist: 0.93, size: 12 },
    { angle: 2.0, dist: 0.90, size: 18 },
  ]

  for (const c of craters) {
    const x = geo.cx + geo.radius * c.dist * Math.cos(c.angle)
    const y = geo.cy - geo.radius * c.dist * Math.sin(c.angle)
    ctx.beginPath()
    ctx.arc(x, y, c.size, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
    ctx.fill()
    // Highlight rim
    ctx.beginPath()
    ctx.arc(x - 2, y - 2, c.size, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

export function resetStars(): void {
  lastWidth = 0
  lastHeight = 0
  stars = []
}
