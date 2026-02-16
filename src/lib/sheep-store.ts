import type { SheepDrawing, Storage, Stroke } from './types'

const STORAGE_KEY = 'draw-sheep:sheep'

let storage: Storage = typeof window !== 'undefined'
  ? window.localStorage
  : { getItem: () => null, setItem: () => {}, removeItem: () => {} }

export function setStorage(s: Storage): void {
  storage = s
}

function readStore(): SheepDrawing[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SheepDrawing[]
  } catch {
    return []
  }
}

function writeStore(sheep: SheepDrawing[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(sheep))
}

export function getSheep(): SheepDrawing[] {
  return readStore()
}

export function addSheep(drawing: {
  body: Stroke[]
  hindLegs: Stroke[]
  frontLegs: Stroke[]
}): SheepDrawing {
  const sheep: SheepDrawing = {
    id: crypto.randomUUID(),
    body: drawing.body,
    hindLegs: drawing.hindLegs,
    frontLegs: drawing.frontLegs,
    createdAt: Date.now(),
    removed: false,
  }
  const all = readStore()
  all.push(sheep)
  writeStore(all)
  return sheep
}

export function removeSheep(id: string): void {
  const all = readStore()
  const sheep = all.find(s => s.id === id)
  if (sheep) {
    sheep.removed = true
    writeStore(all)
  }
}

export function amnesty(): void {
  const all = readStore()
  all.forEach(s => { s.removed = false })
  writeStore(all)
}

export function getActiveSheep(): SheepDrawing[] {
  return readStore().filter(s => !s.removed)
}
