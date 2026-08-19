import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
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
  try {
    const body = await req.json()
    const {
      name, slug, description, shortDescription, brandId, businessUnitId,
      condition, conditionGrade, conditionNote, basePrice, salePrice,
      costPrice, compareAtPrice, wholesalePrice, corporatePrice, bundlePrice,
      currency, productType, specifications, trackInventory, stockCount,
      lowStockThreshold, warrantyMonths, warrantyInfo, weight, dimensions,
      isFeatured, isDeal, isGaming, seoTitle, seoDescription, metaKeywords,
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
