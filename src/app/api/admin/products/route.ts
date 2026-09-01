import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
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

    const where: any = {}
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

    const orderBy: any = {}
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
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
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

    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'name and basePrice are required' }, { status: 400 }
      )
    }

    const productSlug = slug || name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')

    const existing = await db.product.findUnique({ where: { slug: productSlug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
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
        conditionGrade: conditionGrade || null,
        conditionNote: conditionNote || null,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        corporatePrice: corporatePrice ? parseFloat(corporatePrice) : null,
        bundlePrice: bundlePrice ? parseFloat(bundlePrice) : null,
        currency: currency || 'KES',
        productType: productType || 'PHYSICAL',
        specifications: specifications ? JSON.stringify(specifications) : null,
        trackInventory: trackInventory !== undefined ? trackInventory : true,
        stockCount: stockCount || 0,
        lowStockThreshold: lowStockThreshold || 5,
        warrantyMonths: warrantyMonths || null,
        warrantyInfo: warrantyInfo || null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        status: 'DRAFT',
        isFeatured: isFeatured || false,
        isDeal: isDeal || false,
        isGaming: isGaming || false,
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

    if (basePrice) {
      await db.priceHistory.create({
        data: {
          productId: product.id,
          previousPrice: null,
          newPrice: parseFloat(basePrice),
          priceField: 'basePrice',
          currency: currency || 'KES',
          reason: 'Product created',
        },
      })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
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
