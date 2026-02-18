'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { SheepDrawing } from '@/lib/types'
import { renderStrokes } from '@/lib/drawing'

const THUMB_WIDTH = 120
const THUMB_HEIGHT = 96
const DRAW_WIDTH = 300
const DRAW_HEIGHT = 240

function SheepThumbnail({ sheep }: { sheep: SheepDrawing }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT)
    ctx.fillStyle = '#1a1f3e'
    ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT)

    ctx.save()
    ctx.scale(THUMB_WIDTH / DRAW_WIDTH, THUMB_HEIGHT / DRAW_HEIGHT)
    renderStrokes(ctx, sheep.hindLegs, '#ffffff')
    renderStrokes(ctx, sheep.body, '#ffffff')
    renderStrokes(ctx, sheep.frontLegs, '#ffffff')
    ctx.restore()
  }, [sheep])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={THUMB_WIDTH}
      height={THUMB_HEIGHT}
      className="rounded-lg"
    />
  )
}

interface GalleryModalProps {
  onClose: () => void
  sheep: SheepDrawing[]
}

export default function GalleryModal({ onClose, sheep }: GalleryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1f3e] rounded-2xl p-6 w-[520px] max-w-[95vw] max-h-[85vh] text-white relative flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-1">
          Galerie
        </h2>
        <p className="text-xs text-white/40 mb-4">
          {sheep.length} mouton{sheep.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {sheep.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">
              Aucun mouton pour le moment
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {sheep.map(s => (
                <SheepThumbnail key={s.id} sheep={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
