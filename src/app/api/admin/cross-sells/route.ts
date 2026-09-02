import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const VALID_TYPES = ['CROSS_SELL', 'UPSELL', 'BUNDLE', 'FREQUENTLY_BOUGHT'] as const

const createSchema = z.object({
  fromId: z.string().min(1, 'fromId is required'),
  toId: z.string().min(1, 'toId is required'),
  type: z.enum(VALID_TYPES).default('CROSS_SELL'),
  sortOrder: z.number().int().min(0).default(0),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const productId = req.nextUrl.searchParams.get('productId')
    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId query parameter is required' }, { status: 400 })
    }

    const crossSells = await db.productCrossSell.findMany({
      where: { fromId: productId },
      include: {
        toProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            productImages: {
              where: { isPrimary: true, status: 'APPROVED' },
              select: { url: true, altText: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const data = crossSells.map((cs) => {
      const { toProduct, ...rest } = cs
      return {
        ...rest,
        relatedProduct: {
          id: toProduct.id,
          name: toProduct.name,
          slug: toProduct.slug,
          price: toProduct.salePrice ?? toProduct.basePrice,
          image: toProduct.productImages[0]?.url ?? null,
        },
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch cross-sells' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation failed',
      }, { status: 400 })
    }

    const { fromId, toId, type, sortOrder } = parsed.data

    if (fromId === toId) {
      return NextResponse.json({ success: false, error: 'Cannot cross-sell a product with itself' }, { status: 400 })
    }

    const [sourceProduct, relatedProduct] = await Promise.all([
      db.product.findUnique({ where: { id: fromId } }),
      db.product.findUnique({ where: { id: toId } }),
    ])

    if (!sourceProduct) {
      return NextResponse.json({ success: false, error: 'Source product not found' }, { status: 404 })
    }
    if (!relatedProduct) {
      return NextResponse.json({ success: false, error: 'Related product not found' }, { status: 404 })
    }

    // The composite PK is [fromId, toId], so a duplicate pair will throw
    const crossSell = await db.productCrossSell.create({
      data: { fromId, toId, type, sortOrder },
    })

    return NextResponse.json({ success: true, data: crossSell }, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    const code = e instanceof Error && 'code' in e ? (e as Error & { code: string }).code : undefined
    if (code === 'P2002') {
      return NextResponse.json({ success: false, error: 'This cross-sell relationship already exists' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Failed to create cross-sell' }, { status: 500 })
  }
}
