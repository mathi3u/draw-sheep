'use client'

import { useCallback, useEffect, useState } from 'react'
import SheepCanvas from '@/components/SheepCanvas'
import DrawModal from '@/components/DrawModal'
import InfoModal from '@/components/InfoModal'
import { addSheep, getActiveSheep, getSheep, removeSheep, amnesty } from '@/lib/sheep-store'
import { addSampleSheep } from '@/lib/sample-sheep'
import type { SheepDrawing, Stroke } from '@/lib/types'

export default function Home() {
  const [activeSheep, setActiveSheep] = useState<SheepDrawing[]>([])
  const [allSheep, setAllSheep] = useState<SheepDrawing[]>([])
  const [showDraw, setShowDraw] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [newSheepId, setNewSheepId] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setActiveSheep(getActiveSheep())
    setAllSheep(getSheep())
  }, [])

  useEffect(() => {
    const isFirstVisit = getSheep().length === 0
    if (isFirstVisit) {
      addSampleSheep()
      setShowDraw(true)
    }
    refresh()
  }, [refresh])

  const handleSubmit = (layers: { body: Stroke[]; hindLegs: Stroke[]; frontLegs: Stroke[] }) => {
    const sheep = addSheep(layers)
    setNewSheepId(sheep.id)
    refresh()
    setShowDraw(false)
  }

  const handleRemove = (id: string) => {
    removeSheep(id)
    refresh()
  }

  const handleAmnesty = () => {
    amnesty()
    refresh()
  }

  const removedCount = allSheep.filter(s => s.removed).length

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
        className="fixed bottom-6 left-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-lg flex items-center justify-center transition-colors"
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
