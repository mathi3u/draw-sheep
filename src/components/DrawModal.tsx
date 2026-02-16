'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stroke } from '@/lib/types'
import { createStroke, addPoint, undoLastStroke, renderStrokes } from '@/lib/drawing'

type Layer = 'body' | 'hindLegs' | 'frontLegs'

const LAYER_COLORS: Record<Layer, string> = {
  body: '#333333',
  hindLegs: '#e74c3c',
  frontLegs: '#3498db',
}

const LAYER_LABELS: Record<Layer, string> = {
  body: 'Corps',
  hindLegs: 'Pattes arriere',
  frontLegs: 'Pattes avant',
}

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 240

interface DrawModalProps {
  onSubmit: (layers: { body: Stroke[]; hindLegs: Stroke[]; frontLegs: Stroke[] }) => void
  onClose: () => void
}

export default function DrawModal({ onSubmit, onClose }: DrawModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeLayer, setActiveLayer] = useState<Layer>('body')
  const [brushSize, setBrushSize] = useState(4)
  const [layers, setLayers] = useState<Record<Layer, Stroke[]>>({
    body: [],
    hindLegs: [],
    frontLegs: [],
  })
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const isDrawingRef = useRef(false)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw all layers in order (hind legs behind, then body, then front legs)
    const order: Layer[] = ['hindLegs', 'body', 'frontLegs']
    for (const layer of order) {
      // Dim non-active layers slightly
      if (layer !== activeLayer) {
        ctx.globalAlpha = 0.4
      }
      renderStrokes(ctx, layers[layer])
      ctx.globalAlpha = 1
    }

    // Draw current stroke
    if (currentStroke) {
      renderStrokes(ctx, [currentStroke])
    }
  }, [layers, activeLayer, currentStroke])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getCanvasPoint = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_WIDTH / rect.width
    const scaleY = CANVAS_HEIGHT / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const point = getCanvasPoint(e)
    if (!point) return
    isDrawingRef.current = true
    const stroke = createStroke(LAYER_COLORS[activeLayer], brushSize)
    setCurrentStroke(addPoint(stroke, point))
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || !currentStroke) return
    const point = getCanvasPoint(e)
    if (!point) return
    setCurrentStroke(addPoint(currentStroke, point))
  }

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !currentStroke) return
    isDrawingRef.current = false
    if (currentStroke.points.length >= 2) {
      setLayers(prev => ({
        ...prev,
        [activeLayer]: [...prev[activeLayer], currentStroke],
      }))
    }
    setCurrentStroke(null)
  }

  const handleUndo = () => {
    setLayers(prev => ({
      ...prev,
      [activeLayer]: undoLastStroke(prev[activeLayer]),
    }))
  }

  const handleClear = () => {
    setLayers(prev => ({
      ...prev,
      [activeLayer]: [],
    }))
  }

  const handleSubmit = () => {
    onSubmit({
      body: layers.body,
      hindLegs: layers.hindLegs,
      frontLegs: layers.frontLegs,
    })
  }

  const isEmpty = layers.body.length === 0
    && layers.hindLegs.length === 0
    && layers.frontLegs.length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1f3e] rounded-2xl p-6 w-[360px] max-w-[95vw] text-white relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center mb-1">Dessine un mouton</h2>
        <p className="text-xs text-white/50 text-center mb-4">face a droite &rarr;</p>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full rounded-lg cursor-crosshair touch-none"
          style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Layer selector */}
        <div className="flex justify-center gap-3 mt-4">
          {(['body', 'hindLegs', 'frontLegs'] as Layer[]).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: LAYER_COLORS[layer],
                  borderColor: activeLayer === layer ? '#fff' : 'transparent',
                  transform: activeLayer === layer ? 'scale(1.2)' : 'scale(1)',
                }}
              />
              <span className="text-[10px] text-white/60">
                {LAYER_LABELS[layer]}
              </span>
            </button>
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-3 mt-4 px-2">
          <span className="text-xs text-white/50">Taille</span>
          <input
            type="range"
            min={1}
            max={12}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="flex-1 accent-white"
          />
          <div
            className="rounded-full bg-white"
            style={{ width: brushSize * 2, height: brushSize * 2 }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleUndo}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
            disabled={layers[activeLayer].length === 0}
          >
            Annuler
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
            disabled={layers[activeLayer].length === 0}
          >
            Effacer
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isEmpty}
          className="w-full mt-3 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-black font-semibold text-sm transition-colors"
        >
          Lache ton mouton !
        </button>
      </div>
    </div>
  )
}
