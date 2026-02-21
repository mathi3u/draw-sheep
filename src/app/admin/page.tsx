'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { SheepDrawing } from '@/lib/types'
import { renderStrokes } from '@/lib/drawing'

const THUMB_WIDTH = 120
const THUMB_HEIGHT = 96
const DRAW_WIDTH = 300
const DRAW_HEIGHT = 240

function SheepThumbnail({
  sheep,
  onDelete,
}: {
  sheep: SheepDrawing
  onDelete: (id: string) => void
}) {
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
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        className={`rounded-lg ${sheep.removed ? 'opacity-40' : ''}`}
      />
      {sheep.removed && (
        <span className="absolute top-1 left-1 text-[10px] bg-red-500/80 text-white px-1 rounded">
          removed
        </span>
      )}
      <button
        onClick={() => onDelete(sheep.id)}
        className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        title="Permanently delete"
      >
        &times;
      </button>
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [sheep, setSheep] = useState<SheepDrawing[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchSheep = useCallback(async (pwd: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/sheep', {
      headers: { Authorization: pwd },
    })
    if (!res.ok) {
      setError('Wrong password')
      setAuthenticated(false)
      setLoading(false)
      return
    }
    const data = await res.json()
    setSheep(data)
    setAuthenticated(true)
    setError('')
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSheep(password)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this sheep?')) return

    const res = await fetch(`/api/admin/sheep/${id}`, {
      method: 'DELETE',
      headers: { Authorization: password },
    })
    if (res.ok) {
      setSheep(prev => prev.filter(s => s.id !== id))
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1a1f3e] flex items-center justify-center">
        <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
          <h1 className="text-white text-lg font-semibold text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 placeholder:text-white/30"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-2 transition-colors"
          >
            {loading ? 'Loading...' : 'Enter'}
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1f3e] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-lg font-semibold">
            Admin — {sheep.length} sheep
          </h1>
          <button
            onClick={() => { setAuthenticated(false); setPassword('') }}
            className="text-white/40 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>

        {sheep.length === 0 ? (
          <p className="text-white/40 text-center py-12">No sheep in database</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {sheep.map(s => (
              <SheepThumbnail key={s.id} sheep={s} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
