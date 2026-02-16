import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { SheepDrawing, Stroke } from '@/lib/types'

export async function GET() {
  const result = await db.execute('SELECT * FROM sheep ORDER BY created_at ASC')

  const sheep: SheepDrawing[] = result.rows.map(row => ({
    id: row.id as string,
    body: JSON.parse(row.body as string) as Stroke[],
    hindLegs: JSON.parse(row.hind_legs as string) as Stroke[],
    frontLegs: JSON.parse(row.front_legs as string) as Stroke[],
    createdAt: row.created_at as number,
    removed: (row.removed as number) === 1,
  }))

  return NextResponse.json(sheep)
}

export async function POST(request: Request) {
  const { body, hindLegs, frontLegs } = await request.json()

  const id = crypto.randomUUID()
  const createdAt = Date.now()

  await db.execute({
    sql: 'INSERT INTO sheep (id, body, hind_legs, front_legs, created_at, removed) VALUES (?, ?, ?, ?, ?, 0)',
    args: [id, JSON.stringify(body), JSON.stringify(hindLegs), JSON.stringify(frontLegs), createdAt],
  })

  const sheep: SheepDrawing = {
    id,
    body,
    hindLegs,
    frontLegs,
    createdAt,
    removed: false,
  }

  return NextResponse.json(sheep, { status: 201 })
}
