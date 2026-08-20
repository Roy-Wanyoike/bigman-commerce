import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(brands)
  } catch {
    return NextResponse.json({ error: 'Failed to load brands' }, { status: 500 })
  }
}
