import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || ''
    if (!q || q.length < 2) return NextResponse.json({ results: [] })

    const term = q.toLowerCase()

    // Expand with synonyms
    const synonyms = await db.searchSynonym.findMany({
      where: { OR: [{ term }, { synonym: term }] },
    })
    const allTerms = [term]
    for (const s of synonyms) {
      allTerms.push(s.term, s.synonym)
    }
    const uniqueTerms = [...new Set(allTerms)]

    const products = await db.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: uniqueTerms.flatMap(t => [
          { name: { contains: t, mode: 'insensitive' } },
          { shortDescription: { contains: t, mode: 'insensitive' } },
        ]),
      },
      include: { brand: true },
      take: 10, orderBy: { sortOrder: 'asc' },
    })

    const categories = await db.category.findMany({
      where: {
        isActive: true,
        OR: uniqueTerms.flatMap(t => [
          { name: { contains: t, mode: 'insensitive' } },
        ]),
      },
      take: 5, orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ products, categories })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
