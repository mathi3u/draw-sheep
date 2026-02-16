'use client'

import { useCallback, useEffect, useState } from 'react'
import SheepCanvas from '@/components/SheepCanvas'
import DrawModal from '@/components/DrawModal'
import InfoModal from '@/components/InfoModal'
import type { SheepDrawing, Stroke } from '@/lib/types'

export default function Home() {
  const [allSheep, setAllSheep] = useState<SheepDrawing[]>([])
  const [showDraw, setShowDraw] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [newSheepId, setNewSheepId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const activeSheep = allSheep.filter(s => !s.removed)

  const fetchSheep = useCallback(async () => {
    const res = await fetch('/api/sheep')
    const data: SheepDrawing[] = await res.json()
    setAllSheep(data)
    return data
  }, [])

  useEffect(() => {
    fetchSheep().then(async data => {
      if (data.length === 0) {
        // Seed sample sheep on first visit
        await fetch('/api/sheep/seed', { method: 'POST' })
        await fetchSheep()
        setShowDraw(true)
      }
      setLoaded(true)
    })
  }, [fetchSheep])

  const handleSubmit = async (layers: { body: Stroke[]; hindLegs: Stroke[]; frontLegs: Stroke[] }) => {
    const res = await fetch('/api/sheep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layers),
    })
    const sheep: SheepDrawing = await res.json()
    setAllSheep(prev => [...prev, sheep])
    setNewSheepId(sheep.id)
    setShowDraw(false)
  }

  const handleRemove = async (id: string) => {
    await fetch(`/api/sheep/${id}`, { method: 'DELETE' })
    setAllSheep(prev => prev.map(s => s.id === id ? { ...s, removed: true } : s))
  }

  const handleAmnesty = async () => {
    await fetch('/api/sheep/amnesty', { method: 'POST' })
    setAllSheep(prev => prev.map(s => ({ ...s, removed: false })))
  }

  const removedCount = allSheep.filter(s => s.removed).length

  if (!loaded) return null

  return (
    <>
      <SheepCanvas
        sheep={activeSheep}
        onRemoveSheep={handleRemove}
        newSheepId={newSheepId}
        onNewSheepPlaced={() => setNewSheepId(null)}
      />

      {/* Title */}
      <h1
        className="fixed top-6 left-8 z-10 text-white/80 text-3xl md:text-4xl font-bold pointer-events-none select-none"
        style={{ fontFamily: "'Little Days', cursive" }}
      >
        Dessine-moi un mouton
      </h1>

      {/* Draw button */}
      <button
        onClick={() => setShowDraw(true)}
        className="fixed bottom-6 right-6 z-10 px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm shadow-lg transition-colors"
      >
        Dessine un mouton
      </button>

      {/* Info button */}
      <button
        onClick={() => setShowInfo(true)}
        className="fixed bottom-6 right-20 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-lg flex items-center justify-center transition-colors"
      >
        ?
      </button>

      {showDraw && (
        <DrawModal
          onSubmit={handleSubmit}
          onClose={() => setShowDraw(false)}
        />
      )}

      {showInfo && (
        <InfoModal
          onClose={() => setShowInfo(false)}
          onAmnesty={handleAmnesty}
          sheepCount={activeSheep.length}
          removedCount={removedCount}
        />
      )}
    </>
  )
}
