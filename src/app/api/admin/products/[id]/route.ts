import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const VALID_TRANSITIONS: Record<string, string[]> = {
  IMPORTED: ['DRAFT'],
  DRAFT: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'DRAFT'],
  PUBLISHED: ['UNPUBLISHED'],
  UNPUBLISHED: ['PUBLISHED', 'ARCHIVED', 'DRAFT'],
  ARCHIVED: ['DRAFT'],
}

const STATUS_LABELS: Record<string, string> = {
  approve: 'APPROVED',
  publish: 'PUBLISHED',
  unpublish: 'UNPUBLISHED',
  archive: 'ARCHIVED',
  review: 'UNDER_REVIEW',
  draft: 'DRAFT',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        productImages: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        businessUnit: true,
        categories: { include: { category: true }, orderBy: { sortOrder: 'asc' } },
        inventoryUnits: { orderBy: { createdAt: 'desc' } },
        priceHistory: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get attribute definitions for product's categories
    const categoryIds = product.categories.map(pc => pc.categoryId)
    const attributeDefs = categoryIds.length
      ? await db.categoryAttributeDefinition.findMany({
          where: { categoryId: { in: categoryIds }, isActive: true },
          orderBy: { sortOrder: 'asc' },
        })
      : []

    return NextResponse.json({ product, attributeDefinitions: attributeDefs })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get product' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      name, slug, description, shortDescription, brandId, businessUnitId,
      condition, conditionGrade, conditionNote, basePrice, salePrice,
      costPrice, compareAtPrice, wholesalePrice, corporatePrice, bundlePrice,
      currency, productType, specifications, trackInventory, stockCount,
      lowStockThreshold, warrantyMonths, warrantyInfo, weight, dimensions,
      isFeatured, isDeal, isGaming, dealLabel, seoTitle, seoDescription, metaKeywords,
      compatibleModels, sku, partNumber, upc, categoryIds,
    } = body

    // Track price changes
    const priceFields = ['basePrice', 'salePrice', 'costPrice', 'compareAtPrice', 'wholesalePrice', 'corporatePrice', 'bundlePrice'] as const
    const priceHistories: any[] = []
    for (const field of priceFields) {
      const newVal = body[field]
      const oldVal = existing[field as keyof typeof existing]
      if (newVal !== undefined && newVal !== null && newVal !== (oldVal as number)) {
        priceHistories.push({
          productId: id,
          previousPrice: oldVal as number ?? null,
          newPrice: parseFloat(newVal),
          priceField: field,
          currency: currency || existing.currency,
          reason: 'Admin update',
        })
      }
    }

    // If slug changed, check uniqueness
    if (slug && slug !== existing.slug) {
      const slugTaken = await db.product.findUnique({ where: { slug } })
      if (slugTaken) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
    }

    // Rebuild categories if categoryIds provided
    if (categoryIds !== undefined) {
      await db.productCategory.deleteMany({ where: { productId: id } })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(businessUnitId !== undefined && { businessUnitId: businessUnitId || null }),
        ...(condition !== undefined && { condition }),
        ...(conditionGrade !== undefined && { conditionGrade }),
        ...(conditionNote !== undefined && { conditionNote }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(costPrice !== undefined && { costPrice: costPrice ? parseFloat(costPrice) : null }),
        ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null }),
        ...(wholesalePrice !== undefined && { wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null }),
        ...(corporatePrice !== undefined && { corporatePrice: corporatePrice ? parseFloat(corporatePrice) : null }),
        ...(bundlePrice !== undefined && { bundlePrice: bundlePrice ? parseFloat(bundlePrice) : null }),
        ...(currency !== undefined && { currency }),
        ...(productType !== undefined && { productType }),
        ...(specifications !== undefined && { specifications: specifications ? JSON.stringify(specifications) : null }),
        ...(trackInventory !== undefined && { trackInventory }),
        ...(stockCount !== undefined && { stockCount }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
        ...(warrantyMonths !== undefined && { warrantyMonths }),
        ...(warrantyInfo !== undefined && { warrantyInfo }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(dimensions !== undefined && { dimensions: dimensions ? JSON.stringify(dimensions) : null }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isDeal !== undefined && { isDeal }),
        ...(isGaming !== undefined && { isGaming }),
        ...(dealLabel !== undefined && { dealLabel }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(compatibleModels !== undefined && { compatibleModels }),
        ...(sku !== undefined && { sku }),
        ...(partNumber !== undefined && { partNumber }),
        ...(upc !== undefined && { upc }),
        ...(categoryIds !== undefined && {
          categories: {
            create: (categoryIds as string[]).map((cid: string, i: number) => ({
              categoryId: cid,
              sortOrder: i,
            })),
          },
        }),
      },
      include: {
        brand: true,
        categories: { include: { category: true } },
        priceHistory: { orderBy: { createdAt: 'desc' } },
      },
    })

    // Create price history entries
    if (priceHistories.length) {
      await db.priceHistory.createMany({ data: priceHistories })
    }

    return NextResponse.json({ product })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await req.json()
    const { action } = body

    if (!action || !STATUS_LABELS[action]) {
      return NextResponse.json(
        { error: `Invalid action. Valid: ${Object.keys(STATUS_LABELS).join(', ')}` },
        { status: 400 }
      )
    }

    const newStatus = STATUS_LABELS[action]
    const allowed = VALID_TRANSITIONS[product.status]

    if (!allowed || !allowed.includes(newStatus)) {
      return NextResponse.json({
        error: `Invalid transition: ${product.status} → ${newStatus}. Allowed: ${allowed?.join(', ') || 'none'}`,
      }, { status: 422 })
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        status: newStatus,
        ...(newStatus === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    })

    return NextResponse.json({ product: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status === 'ARCHIVED') {
      return NextResponse.json({ error: 'Product already archived' }, { status: 400 })
    }

    const updated = await db.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ product: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to archive product' }, { status: 500 })
  }
}
