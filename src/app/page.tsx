'use client'

import { useCallback, useEffect, useState } from 'react'
import SheepCanvas from '@/components/SheepCanvas'
import DrawModal from '@/components/DrawModal'
import InfoModal from '@/components/InfoModal'
import type { SheepDrawing, Stroke } from '@/lib/types'

// Irregular stone shapes — 4 variants to pick from
const stonePaths = [
  'M22,4 C30,2 38,3 44,8 C50,14 52,24 48,34 C44,42 36,48 26,48 C16,48 8,44 4,36 C0,26 2,14 8,8 C14,2 18,4 22,4Z',
  'M24,3 C32,1 42,4 47,12 C52,20 50,32 46,40 C40,48 30,50 20,47 C10,44 3,36 2,26 C1,16 6,6 16,3 C20,2 22,3 24,3Z',
  'M20,5 C28,1 40,2 46,10 C52,18 51,30 47,38 C42,46 32,50 22,48 C12,46 4,38 2,28 C0,18 4,8 12,5 C16,3 18,5 20,5Z',
  'M26,3 C34,2 44,6 48,14 C52,22 50,34 44,42 C38,48 28,50 18,46 C8,42 2,32 2,22 C2,12 8,4 18,3 C22,2 24,3 26,3Z',
]

function StoneButton({ onClick, children, label }: {
  onClick: () => void
  children: React.ReactNode
  label: string
}) {
  const path = stonePaths[label.length % stonePaths.length]
  return (
    <button
      onClick={onClick}
      title={label}
      className="relative w-14 h-14 flex items-center justify-center text-[#2a2a2a] hover:text-black transition-colors group cursor-pointer"
    >
      <svg viewBox="0 0 52 52" className="absolute inset-0 w-full h-full">
        <path
          d={path}
          className="fill-[#a0a5a8]/70 group-hover:fill-[#b8bcc0]/80 transition-colors"
          stroke="rgba(180,185,190,0.3)"
          strokeWidth="1"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </button>
  )
}

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
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        Dessine-moi un mouton
      </h1>

      {/* Stone buttons */}
      <div className="fixed bottom-5 right-5 z-10 flex items-end gap-2">
        <StoneButton onClick={() => setShowDraw(true)} label="Draw a sheep">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="18" />
            <line x1="4" y1="11" x2="18" y2="11" />
          </svg>
        </StoneButton>
        <StoneButton onClick={() => setShowInfo(true)} label="Info">
          <span className="text-xl font-bold leading-none" style={{ fontFamily: "'Caveat', cursive" }}>?</span>
        </StoneButton>
      </div>

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
