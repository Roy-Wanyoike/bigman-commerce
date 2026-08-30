import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const condition = searchParams.get('condition')
    const gaming = searchParams.get('gaming')
    const deal = searchParams.get('deal')
    const featured = searchParams.get('featured')
    const refurbished = searchParams.get('refurbished')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('q')
    const sort = searchParams.get('sort') || 'sortOrder'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build synonym expansion for search
    let searchTerms: string[] = []
    if (search) {
      searchTerms.push(search.toLowerCase())
      const synonyms = await db.searchSynonym.findMany({
        where: { OR: [{ term: search.toLowerCase() }, { synonym: search.toLowerCase() }] },
      })
      for (const s of synonyms) {
        searchTerms.push(s.term)
        searchTerms.push(s.synonym)
      }
      searchTerms = [...new Set(searchTerms)]
    }

    const where: any = { status: { in: ['PUBLISHED'] } }

    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category, isActive: true } })
      if (cat) {
        const catIds = await getDescendantIds(cat.id)
        where.categories = { some: { categoryId: { in: catIds } } }
      }
    }
    if (brand) {
      const slugs = brand.split(',').map(s => s.trim()).filter(Boolean)
      const brands = await db.brand.findMany({ where: { slug: { in: slugs } } })
      if (brands.length) where.brandId = { in: brands.map(b => b.id) }
    }
    if (condition) {
      const conditions = condition.split(',').map(s => s.trim()).filter(Boolean)
      where.condition = conditions.length === 1 ? conditions[0] : { in: conditions }
    }
    if (gaming === 'true') where.isGaming = true
    if (deal === 'true') where.isDeal = true
    if (featured === 'true') where.isFeatured = true
    if (refurbished === 'true') where.condition = 'REFURBISHED'
    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
    }
    if (search) {
      where.OR = searchTerms.flatMap(term => [
        { name: { contains: term } },
        { shortDescription: { contains: term } },
      ])
    }

    const orderBy: any = {}
    if (sort === 'price-asc') orderBy.basePrice = 'asc'
    else if (sort === 'price-desc') orderBy.basePrice = 'desc'
    else if (sort === 'newest') orderBy.createdAt = 'desc'
    else orderBy.sortOrder = 'asc'

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: true,
          categories: { include: { category: true } },
          productImages: {
            where: { status: 'APPROVED' },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              url: true,
              altText: true,
              isPrimary: true,
              imageType: true,
              status: true,
              width: true,
              height: true,
            },
          },
        },
        orderBy, take: limit, skip: offset,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ products, total, limit, offset })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

async function getDescendantIds(parentId: string): Promise<string[]> {
  const ids = [parentId]
  const children = await db.category.findMany({ where: { parentId }, select: { id: true } })
  for (const c of children) {
    ids.push(...await getDescendantIds(c.id))
  }
  return ids
}
