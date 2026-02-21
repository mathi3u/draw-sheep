import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { SheepDrawing, Stroke } from '@/lib/types'

function checkAuth(request: Request): boolean {
  const password = request.headers.get('Authorization')
  return password === process.env.ADMIN_PASSWORD
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await db.execute('SELECT * FROM sheep ORDER BY created_at DESC')

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
