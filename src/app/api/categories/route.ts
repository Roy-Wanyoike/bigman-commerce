import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    const topLevel = categories.filter(c => !c.parentId)
    return NextResponse.json(topLevel)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}
