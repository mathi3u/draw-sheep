'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { SheepDrawing } from '@/lib/types'
import {
  initRunningSheep,
  updateSheep,
  triggerJump,
  getPlanetGeometry,
  planetSurfacePosition,
  SHEEP_WIDTH,
  SHEEP_HEIGHT,
  DRAWING_WIDTH,
  DRAWING_HEIGHT,
} from '@/lib/animation'
import type { RunningSheep, PlanetGeometry } from '@/lib/animation'
import { renderBackground, resetStars } from '@/lib/background'
import { renderStrokes } from '@/lib/drawing'
import { hitTest } from '@/lib/hit-detection'

interface SheepCanvasProps {
  sheep: SheepDrawing[]
  onRemoveSheep: (id: string) => void
}

function renderSheepOnSurface(
  ctx: CanvasRenderingContext2D,
  sheep: RunningSheep,
  geo: PlanetGeometry,
) {
  const { drawing, angle, jumpHeight, legPhase } = sheep
  const legOffset = Math.sin(legPhase * Math.PI * 2) * 8

  // Feet position on the moon surface
  const feetPos = planetSurfacePosition(geo, angle, jumpHeight)

  ctx.save()

  // Shadow on the moon surface (slightly below the sheep)
  if (jumpHeight > 5) {
    const shadowPos = planetSurfacePosition(geo, angle, 0)
    const shadowScale = Math.max(0.3, 1 - jumpHeight / 200)
    ctx.save()
    ctx.translate(shadowPos.x, shadowPos.y)
    ctx.rotate(Math.PI / 2 - angle)
    ctx.beginPath()
    ctx.ellipse(0, 0, SHEEP_WIDTH * 0.35 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fill()
    ctx.restore()
  }

  // Position at feet, then rotate to stand perpendicular to surface
  ctx.translate(feetPos.x, feetPos.y)
  ctx.rotate(Math.PI / 2 - angle)

  // Scale drawing canvas (300x240) to sheep size (SHEEP_WIDTH x SHEEP_HEIGHT)
  const scaleX = SHEEP_WIDTH / DRAWING_WIDTH
  const scaleY = SHEEP_HEIGHT / DRAWING_HEIGHT

  // Offset so bottom-center of the drawing is at origin (feet)
  ctx.scale(scaleX, scaleY)
  ctx.translate(-DRAWING_WIDTH / 2, -DRAWING_HEIGHT)

  // Hind legs (with walk animation)
  ctx.save()
  ctx.translate(0, legOffset)
  renderStrokes(ctx, drawing.hindLegs)
  ctx.restore()

  // Body
  renderStrokes(ctx, drawing.body)

  // Front legs (opposite offset)
  ctx.save()
  ctx.translate(0, -legOffset)
  renderStrokes(ctx, drawing.frontLegs)
  ctx.restore()

  ctx.restore()
}

export default function SheepCanvas({ sheep, onRemoveSheep }: SheepCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningSheepRef = useRef<RunningSheep[]>([])
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const prevSheepIdsRef = useRef<Set<string>>(new Set())

  const syncSheep = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const currentIds = new Set(sheep.map(s => s.id))
    const prevIds = prevSheepIdsRef.current

    runningSheepRef.current = runningSheepRef.current.filter(
      rs => currentIds.has(rs.drawing.id),
    )

    for (const s of sheep) {
      if (!prevIds.has(s.id)) {
        runningSheepRef.current.push(
          initRunningSheep(s, canvas.width, canvas.height),
        )
      }
    }

    prevSheepIdsRef.current = currentIds
  }, [sheep])

  useEffect(() => {
    syncSheep()
  }, [syncSheep])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      resetStars()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const deltaTime = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 1 / 60
      lastTimeRef.current = time
      const dt = Math.min(deltaTime, 0.1)

      const geo = getPlanetGeometry(canvas.width, canvas.height)

      // Draw background (sky + stars + moon surface)
      renderBackground(ctx, canvas.width, canvas.height, time / 1000, geo)

      // Update sheep
      runningSheepRef.current = runningSheepRef.current.map(rs =>
        updateSheep(rs, dt, canvas.width, canvas.height),
      )

      // Clip to above moon surface (sheep behind the moon are hidden)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, canvas.width, canvas.height)
      ctx.arc(geo.cx, geo.cy, geo.radius - 1, 0, Math.PI * 2, true)
      ctx.clip('evenodd')

      // Sort by angle for depth (higher angle = further back on the left)
      const sorted = [...runningSheepRef.current].sort((a, b) => b.angle - a.angle)
      for (const rs of sorted) {
        renderSheepOnSurface(ctx, rs, geo)
      }

      ctx.restore()

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  // Click => jump, double-click => remove
  const lastClickRef = useRef<{ time: number; id: string | null }>({ time: 0, id: null })

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width)
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height)

    const geo = getPlanetGeometry(canvas.width, canvas.height)

    const reversed = [...runningSheepRef.current].reverse()
    const hit = reversed.find(rs => hitTest(clickX, clickY, rs, geo))
    if (!hit) return

    const now = Date.now()
    const last = lastClickRef.current

    if (last.id === hit.drawing.id && now - last.time < 400) {
      onRemoveSheep(hit.drawing.id)
      lastClickRef.current = { time: 0, id: null }
    } else {
      const idx = runningSheepRef.current.indexOf(hit)
      if (idx !== -1) {
        runningSheepRef.current[idx] = triggerJump(hit)
      }
      lastClickRef.current = { time: now, id: hit.drawing.id }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-default"
      onClick={handleClick}
    />
  )
}
