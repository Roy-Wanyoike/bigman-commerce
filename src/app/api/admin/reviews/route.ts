import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sp = req.nextUrl.searchParams
    const status = sp.get('status') || 'pending'
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (status === 'pending') {
      where.isPublished = false
    } else if (status === 'published') {
      where.isPublished = true
    }
    // if 'all', no filter

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      db.review.count({ where }),
    ])

    // Fetch related product names
    const productIds = [...new Set(reviews.map((r) => r.productId))]
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true },
    })
    const productMap = new Map(products.map((p) => [p.id, { name: p.name, slug: p.slug }]))

    const reviewsWithProduct = reviews.map((r) => ({
      ...r,
      product: productMap.get(r.productId) || { name: 'Unknown Product', slug: '' },
    }))

    return NextResponse.json({
      reviews: reviewsWithProduct,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
