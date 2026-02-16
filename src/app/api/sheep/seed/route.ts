import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const sampleSheep = [
  {
    name: 'fluffy',
    body: [
      { points: ovalPath(150, 120, 65, 45), color: '#ffffff', size: 4 },
      { points: ovalPath(210, 95, 22, 20), color: '#ffffff', size: 3 },
      { points: [{ x: 218, y: 90 }, { x: 219, y: 90 }], color: '#ffffff', size: 4 },
      { points: [{ x: 200, y: 78 }, { x: 195, y: 68 }, { x: 205, y: 72 }], color: '#ffffff', size: 2 },
      { points: ovalPath(120, 85, 15, 12), color: '#ffffff', size: 2 },
      { points: ovalPath(145, 80, 15, 12), color: '#ffffff', size: 2 },
      { points: ovalPath(170, 82, 15, 12), color: '#ffffff', size: 2 },
    ],
    hindLegs: [
      { points: [{ x: 105, y: 155 }, { x: 100, y: 200 }], color: '#ffffff', size: 3 },
      { points: [{ x: 125, y: 155 }, { x: 120, y: 200 }], color: '#ffffff', size: 3 },
    ],
    frontLegs: [
      { points: [{ x: 175, y: 155 }, { x: 180, y: 200 }], color: '#ffffff', size: 3 },
      { points: [{ x: 195, y: 155 }, { x: 200, y: 200 }], color: '#ffffff', size: 3 },
    ],
  },
  {
    name: 'skinny',
    body: [
      { points: ovalPath(150, 115, 50, 35), color: '#ffffff', size: 3 },
      { points: ovalPath(205, 95, 18, 22), color: '#ffffff', size: 3 },
      { points: [{ x: 212, y: 90 }, { x: 213, y: 90 }], color: '#ffffff', size: 3 },
      { points: [{ x: 100, y: 105 }, { x: 85, y: 95 }, { x: 90, y: 100 }], color: '#ffffff', size: 2 },
    ],
    hindLegs: [
      { points: [{ x: 115, y: 145 }, { x: 112, y: 205 }], color: '#ffffff', size: 2 },
      { points: [{ x: 130, y: 145 }, { x: 127, y: 205 }], color: '#ffffff', size: 2 },
    ],
    frontLegs: [
      { points: [{ x: 175, y: 145 }, { x: 178, y: 205 }], color: '#ffffff', size: 2 },
      { points: [{ x: 188, y: 145 }, { x: 191, y: 205 }], color: '#ffffff', size: 2 },
    ],
  },
  {
    name: 'baby',
    body: [
      { points: ovalPath(150, 135, 40, 32), color: '#ffffff', size: 4 },
      { points: ovalPath(190, 118, 18, 17), color: '#ffffff', size: 3 },
      { points: [{ x: 196, y: 114 }, { x: 197, y: 114 }], color: '#ffffff', size: 5 },
      { points: [{ x: 183, y: 104 }, { x: 178, y: 95 }, { x: 188, y: 100 }], color: '#ffffff', size: 2 },
    ],
    hindLegs: [
      { points: [{ x: 122, y: 162 }, { x: 120, y: 200 }], color: '#ffffff', size: 3 },
      { points: [{ x: 138, y: 162 }, { x: 136, y: 200 }], color: '#ffffff', size: 3 },
    ],
    frontLegs: [
      { points: [{ x: 162, y: 162 }, { x: 165, y: 200 }], color: '#ffffff', size: 3 },
      { points: [{ x: 178, y: 162 }, { x: 181, y: 200 }], color: '#ffffff', size: 3 },
    ],
  },
]

function ovalPath(cx: number, cy: number, rx: number, ry: number, steps = 20) {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    points.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    })
  }
  return points
}

export async function POST() {
  const existing = await db.execute('SELECT COUNT(*) as count FROM sheep')
  const count = existing.rows[0].count as number

  if (count > 0) {
    return NextResponse.json({ seeded: false, message: 'Database already has sheep' })
  }

  for (const s of sampleSheep) {
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO sheep (id, body, hind_legs, front_legs, created_at, removed) VALUES (?, ?, ?, ?, ?, 0)',
      args: [id, JSON.stringify(s.body), JSON.stringify(s.hindLegs), JSON.stringify(s.frontLegs), Date.now()],
    })
  }

  return NextResponse.json({ seeded: true, count: sampleSheep.length })
}
