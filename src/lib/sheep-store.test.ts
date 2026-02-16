import { describe, it, expect, beforeEach } from 'vitest'
import { getSheep, addSheep, removeSheep, amnesty, getActiveSheep, setStorage } from './sheep-store'
import type { Stroke, Storage } from './types'

const mockStrokes: Stroke[] = [
  { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: '#000', size: 3 },
]

function createMockStorage(): Storage {
  const data: Record<string, string> = {}
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => { data[key] = value },
    removeItem: (key: string) => { delete data[key] },
  }
}

describe('sheep-store', () => {
  beforeEach(() => {
    setStorage(createMockStorage())
  })

  it('returns empty array when no sheep stored', () => {
    expect(getSheep()).toEqual([])
  })

  it('adds a sheep and retrieves it', () => {
    const sheep = addSheep({
      body: mockStrokes,
      hindLegs: mockStrokes,
      frontLegs: mockStrokes,
    })

    expect(sheep.id).toBeDefined()
    expect(sheep.body).toEqual(mockStrokes)
    expect(sheep.removed).toBe(false)
    expect(sheep.createdAt).toBeGreaterThan(0)

    const all = getSheep()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe(sheep.id)
  })

  it('adds multiple sheep', () => {
    addSheep({ body: mockStrokes, hindLegs: [], frontLegs: [] })
    addSheep({ body: [], hindLegs: mockStrokes, frontLegs: [] })

    expect(getSheep()).toHaveLength(2)
  })

  it('soft-deletes a sheep with removeSheep', () => {
    const sheep = addSheep({ body: mockStrokes, hindLegs: [], frontLegs: [] })
    removeSheep(sheep.id)

    const all = getSheep()
    expect(all).toHaveLength(1)
    expect(all[0].removed).toBe(true)
  })

  it('getActiveSheep excludes removed sheep', () => {
    const sheep1 = addSheep({ body: mockStrokes, hindLegs: [], frontLegs: [] })
    addSheep({ body: [], hindLegs: mockStrokes, frontLegs: [] })

    removeSheep(sheep1.id)

    const active = getActiveSheep()
    expect(active).toHaveLength(1)
    expect(active[0].removed).toBe(false)
  })

  it('amnesty restores all removed sheep', () => {
    const sheep1 = addSheep({ body: mockStrokes, hindLegs: [], frontLegs: [] })
    const sheep2 = addSheep({ body: [], hindLegs: mockStrokes, frontLegs: [] })

    removeSheep(sheep1.id)
    removeSheep(sheep2.id)

    expect(getActiveSheep()).toHaveLength(0)

    amnesty()

    expect(getActiveSheep()).toHaveLength(2)
    expect(getSheep().every(s => !s.removed)).toBe(true)
  })

  it('handles corrupted localStorage gracefully', () => {
    const badStorage = createMockStorage()
    badStorage.setItem('draw-sheep:sheep', 'not-json')
    setStorage(badStorage)
    expect(getSheep()).toEqual([])
  })
})
