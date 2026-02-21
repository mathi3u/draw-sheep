import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function checkAuth(request: Request): boolean {
  const password = request.headers.get('Authorization')
  return password === process.env.ADMIN_PASSWORD
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await db.execute({
    sql: 'DELETE FROM sheep WHERE id = ?',
    args: [id],
  })

  return NextResponse.json({ ok: true })
}
