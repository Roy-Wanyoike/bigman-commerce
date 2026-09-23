import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  businessUnitId: z.string().optional().nullable(),
  condition: z.string().optional(),
  basePrice: z.coerce.number(),
  salePrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  compareAtPrice: z.coerce.number().optional().nullable(),
  wholesalePrice: z.coerce.number().optional().nullable(),
  corporatePrice: z.coerce.number().optional().nullable(),
  bundlePrice: z.coerce.number().optional().nullable(),
  productType: z.string().optional(),
  specifications: z.string().optional().nullable(),
  images: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  trackInventory: z.boolean().optional(),
  stockCount: z.number().int().optional(),
  lowStockThreshold: z.number().int().optional(),
  warrantyMonths: z.number().int().optional().nullable(),
  warrantyInfo: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isDeal: z.boolean().optional(),
  isGaming: z.boolean().optional(),
  dealLabel: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  compatibleModels: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  partNumber: z.string().optional().nullable(),
  upc: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  categoryIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const rejection = await requireAdmin()
  if (rejection) return rejection
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status')
    const condition = sp.get('condition')
    const brandId = sp.get('brand')
    const categoryId = sp.get('category')
    const search = sp.get('q')
    const sort = sp.get('sort') || 'createdAt'
    const order = sp.get('order') || 'desc'
    const page = parseInt(sp.get('page') || '1')
    const pageSize = parseInt(sp.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (condition) where.condition = condition
    if (brandId) where.brandId = brandId
    if (categoryId) {
      where.categories = { some: { categoryId } }
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { partNumber: { contains: search } },
      ]
    }

    const orderBy: Record<string, string> = {}
    if (sort === 'createdAt' || sort === 'updatedAt') orderBy[sort] = order
    else if (sort === 'basePrice') orderBy.basePrice = order
    else if (sort === 'name') orderBy.name = order
    else if (sort === 'status') orderBy.status = order
    else orderBy.createdAt = 'desc'

    const skip = (page - 1) * pageSize

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          productImages: { where: { status: 'APPROVED' }, orderBy: { sortOrder: 'asc' } },
          brand: true,
          categories: { include: { category: true }, orderBy: { sortOrder: 'asc' } },
          priceHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy, take: pageSize, skip,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, pageSize })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const rejection = await requireAdmin()
  if (rejection) return rejection
  try {
    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      )
    }

    const {
      name, slug, description, shortDescription, brandId, businessUnitId,
      condition, basePrice, salePrice, costPrice, compareAtPrice, wholesalePrice,
      corporatePrice, bundlePrice, productType, specifications, trackInventory,
      stockCount, lowStockThreshold, warrantyMonths, warrantyInfo, weight,
      dimensions, isFeatured, isDeal, isGaming, dealLabel, seoTitle, seoDescription,
      metaKeywords, compatibleModels, sku, partNumber, upc, categoryIds,
    } = parsed.data

    const productSlug = slug || name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')

    const existing = await db.product.findUnique({ where: { slug: productSlug } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 })
    }

    const product = await db.product.create({
      data: {
        name,
        slug: productSlug,
        description: description || null,
        shortDescription: shortDescription || null,
        brandId: brandId || null,
        businessUnitId: businessUnitId || null,
        condition: condition || 'NEW',
        basePrice,
        salePrice: salePrice ?? null,
        costPrice: costPrice ?? null,
        compareAtPrice: compareAtPrice ?? null,
        wholesalePrice: wholesalePrice ?? null,
        corporatePrice: corporatePrice ?? null,
        bundlePrice: bundlePrice ?? null,
        productType: productType || 'PHYSICAL',
        specifications: specifications || null,
        trackInventory: trackInventory ?? true,
        stockCount: stockCount ?? 0,
        lowStockThreshold: lowStockThreshold ?? 5,
        warrantyMonths: warrantyMonths ?? null,
        warrantyInfo: warrantyInfo || null,
        weight: weight ?? null,
        dimensions: dimensions || null,
        status: 'DRAFT',
        isFeatured: isFeatured ?? false,
        isDeal: isDeal ?? false,
        isGaming: isGaming ?? false,
        dealLabel: dealLabel || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        metaKeywords: metaKeywords || null,
        compatibleModels: compatibleModels || null,
        sku: sku || null,
        partNumber: partNumber || null,
        upc: upc || null,
        categories: categoryIds
          ? { create: categoryIds.map((cid: string, i: number) => ({ categoryId: cid, sortOrder: i })) }
          : undefined,
      },
      include: {
        brand: true,
        categories: { include: { category: true } },
        priceHistory: true,
      },
    })

    await db.priceHistory.create({
      data: {
        productId: product.id,
        previousPrice: null,
        newPrice: basePrice,
        priceField: 'basePrice',
        reason: 'Product created',
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const rejection = await requireAdmin()
  if (rejection) return rejection
  try {
    const body = await req.json()
    const { ids, status: newStatus, reason } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
    }

    if (!newStatus) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const VALID_TARGETS = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED']
    if (!VALID_TARGETS.includes(newStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_TARGETS.join(', ')}` }, { status: 400 })
    }

    const products = await db.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    })

    const validTransitions: Record<string, string[]> = {
      IMPORTED: ['DRAFT'],
      DRAFT: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['APPROVED', 'DRAFT'],
      APPROVED: ['PUBLISHED', 'DRAFT'],
      PUBLISHED: ['UNPUBLISHED'],
      UNPUBLISHED: ['PUBLISHED', 'ARCHIVED', 'DRAFT'],
      ARCHIVED: ['DRAFT'],
    }

    const results: { id: string; success: boolean; error?: string }[] = []
    const validIds: string[] = []

    for (const p of products) {
      const allowed = validTransitions[p.status]
      if (allowed && allowed.includes(newStatus)) {
        validIds.push(p.id)
        results.push({ id: p.id, success: true })
      } else {
        results.push({
          id: p.id,
          success: false,
          error: `Invalid transition: ${p.status} → ${newStatus}`,
        })
      }
    }

    if (validIds.length > 0) {
      await db.product.updateMany({
        where: { id: { in: validIds } },
        data: {
          status: newStatus,
          ...(newStatus === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
        },
      })
    }

    // Report any IDs not found
    const foundIds = new Set(products.map((p) => p.id))
    for (const id of ids) {
      if (!foundIds.has(id)) {
        results.push({ id, success: false, error: 'Product not found' })
      }
    }

    return NextResponse.json({
      results,
      updated: validIds.length,
      total: ids.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to batch update products' }, { status: 500 })
  }
}
