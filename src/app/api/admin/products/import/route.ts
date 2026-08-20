import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Papa from 'papaparse'

const MAX_ROWS = 500

// Case-insensitive header mapping
const HEADER_MAP: Record<string, string> = {
  'category': 'category',
  'subcategory': 'subcategory',
  'brand': 'brand',
  'product name': 'productName',
  'name': 'productName',
  'model': 'model',
  'sku': 'sku',
  'description': 'description',
  'price': 'price',
  'sale price': 'salePrice',
  'condition': 'condition',
  'warranty (months)': 'warranty',
  'warranty': 'warranty',
  'stock': 'stock',
  'ram': 'ram',
  'storage': 'storage',
  'cpu': 'cpu',
  'gpu': 'gpu',
  'screen': 'screen',
  'image url': 'imageUrl',
  'image source': 'imageSource',
  'image license status': 'imageLicenseStatus',
}

function normalizeHeaders(rawHeaders: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const h of rawHeaders) {
    const key = HEADER_MAP[h.trim().toLowerCase()]
    if (key) map[key] = h.trim()
  }
  return map
}

function parsePrice(value: string | undefined | null): number | null {
  if (!value || typeof value !== 'string') return null
  const cleaned = value
    .replace(/KSh/gi, '')
    .replace(/KES/gi, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function normalizeCondition(value: string | undefined | null): string {
  if (!value) return 'NEW'
  const v = value.trim().toUpperCase()
  const map: Record<string, string> = {
    'NEW': 'NEW',
    'REFURBISHED': 'REFURBISHED',
    'REFURB': 'REFURBISHED',
    'USED': 'USED',
    'OPEN BOX': 'OPEN_BOX',
    'OPENBOX': 'OPEN_BOX',
    'OPEN': 'OPEN_BOX',
  }
  return map[v] || 'NEW'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(name: string): Promise<string> {
  let base = slugify(name)
  // If name is empty after slugify, use a timestamp-based fallback
  if (!base) base = `product-${Date.now()}`
  
  let slug = base
  let counter = 1
  while (true) {
    const existing = await db.product.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) return slug
    slug = `${base}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are accepted' }, { status: 400 })
    }

    const text = await file.text()
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    })

    if (result.errors.length > 0 && result.data.length === 0) {
      return NextResponse.json(
        { error: `CSV parse error: ${result.errors[0].message}` },
        { status: 400 }
      )
    }

    const rows = result.data as Record<string, string>[]
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `CSV exceeds maximum of ${MAX_ROWS} rows. Found ${rows.length} rows.` },
        { status: 400 }
      )
    }

    const headerMap = normalizeHeaders(result.meta.fields || [])

    const errors: { row: number; message: string }[] = []
    const warnings: { row: number; message: string }[] = []
    let imported = 0

    // Track created brands and category lookups for efficiency
    const brandCache = new Map<string, string>() // name -> id

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2 // 1-indexed, header is row 1
      const row = rows[i]

      // Get values using header map
      const getValue = (key: string): string | undefined => {
        const csvHeader = headerMap[key]
        if (!csvHeader) return undefined
        return row[csvHeader]?.trim() || undefined
      }

      const productName = getValue('productName')
      const priceRaw = getValue('price')
      const price = parsePrice(priceRaw)

      // Validate required fields
      if (!productName) {
        errors.push({ row: rowNum, message: 'Missing required field: Product Name' })
        continue
      }

      if (price === null || price <= 0) {
        errors.push({ row: rowNum, message: `Invalid or missing Price: "${priceRaw}"` })
        continue
      }

      const salePriceRaw = getValue('salePrice')
      const salePrice = salePriceRaw ? parsePrice(salePriceRaw) : null

      // Brand handling
      const brandName = getValue('brand')
      let brandId: string | null = null
      if (brandName) {
        if (brandCache.has(brandName)) {
          brandId = brandCache.get(brandName)!
        } else {
          // Case-insensitive brand lookup
          const existingBrand = await db.brand.findFirst({
            where: {
              name: { equals: brandName },
            },
            select: { id: true },
          })
          if (existingBrand) {
            brandId = existingBrand.id
            brandCache.set(brandName, brandId)
          } else {
            // Create brand
            const newBrand = await db.brand.create({
              data: {
                name: brandName,
                slug: slugify(brandName),
                isActive: true,
              },
            })
            brandId = newBrand.id
            brandCache.set(brandName, brandId)
            warnings.push({ row: rowNum, message: `Created new brand: ${brandName}` })
          }
        }
      }

      // Category handling
      const categoryName = getValue('category')
      const subcategoryName = getValue('subcategory')
      let categoryIds: string[] = []

      if (categoryName) {
        // Find parent category (case-insensitive)
        const parentCat = await db.category.findFirst({
          where: {
            name: { equals: categoryName },
            parentId: null,
          },
          select: { id: true },
        })

        if (parentCat) {
          categoryIds.push(parentCat.id)

          // Find subcategory if provided
          if (subcategoryName) {
            const subCat = await db.category.findFirst({
              where: {
                name: { equals: subcategoryName },
                parentId: parentCat.id,
              },
              select: { id: true },
            })
            if (subCat) {
              categoryIds.push(subCat.id)
            } else {
              warnings.push({
                row: rowNum,
                message: `Subcategory "${subcategoryName}" not found under "${categoryName}"`,
              })
            }
          }
        } else {
          warnings.push({
            row: rowNum,
            message: `Category "${categoryName}" not found`,
          })
        }
      } else if (subcategoryName) {
        // Try to find subcategory without parent
        const subCat = await db.category.findFirst({
          where: {
            name: { equals: subcategoryName },
          },
          select: { id: true, parentId: true },
        })
        if (subCat) {
          categoryIds.push(subCat.id)
          if (subCat.parentId) {
            categoryIds.push(subCat.parentId)
          }
        } else {
          warnings.push({
            row: rowNum,
            message: `Subcategory "${subcategoryName}" not found`,
          })
        }
      }

      // SKU duplicate check
      const sku = getValue('sku')
      if (sku) {
        const existingSku = await db.product.findFirst({
          where: { sku },
          select: { id: true },
        })
        if (existingSku) {
          errors.push({ row: rowNum, message: `Duplicate SKU: "${sku}" already exists` })
          continue
        }
      }

      // Build specifications JSON
      const specs: Record<string, string> = {}
      const ram = getValue('ram')
      const storage = getValue('storage')
      const cpu = getValue('cpu')
      const gpu = getValue('gpu')
      const screen = getValue('screen')
      const model = getValue('model')

      if (model) specs['Model'] = model
      if (ram) specs['RAM'] = ram
      if (storage) specs['Storage'] = storage
      if (cpu) specs['CPU'] = cpu
      if (gpu) specs['GPU'] = gpu
      if (screen) specs['Screen'] = screen

      const condition = normalizeCondition(getValue('condition'))
      const warrantyVal = getValue('warranty')
      const warrantyMonths = warrantyVal ? parseInt(warrantyVal, 10) : null
      const stockVal = getValue('stock')
      const stock = stockVal ? parseInt(stockVal, 10) : 0

      const imageUrl = getValue('imageUrl')
      const imageSource = getValue('imageSource')
      const imageLicenseStatus = getValue('imageLicenseStatus')

      // Generate slug
      const slug = await generateUniqueSlug(productName)

      // Create product
      const product = await db.product.create({
        data: {
          name: productName,
          slug,
          description: getValue('description') || null,
          shortDescription: null,
          brandId,
          condition,
          basePrice: price,
          salePrice: salePrice && salePrice > 0 ? salePrice : null,
          currency: 'KES',
          productType: 'PHYSICAL',
          specifications: Object.keys(specs).length > 0 ? JSON.stringify(specs) : null,
          images: imageUrl ? JSON.stringify([imageUrl]) : null,
          thumbnail: imageUrl || null,
          trackInventory: true,
          stockCount: isNaN(stock) ? 0 : stock,
          warrantyMonths: isNaN(warrantyMonths ?? NaN) ? null : warrantyMonths,
          status: 'IMPORTED',
          sku,
          partNumber: null,
        },
      })

      // Link categories
      for (const catId of categoryIds) {
        await db.productCategory.create({
          data: {
            productId: product.id,
            categoryId: catId,
            sortOrder: 0,
          },
        })
      }

      // Create ProductImage if URL provided
      if (imageUrl) {
        await db.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            source: imageSource || 'IMPORTED',
            licenseStatus: imageLicenseStatus || 'PENDING_REVIEW',
            isPrimary: true,
            status: 'PENDING_REVIEW',
            sortOrder: 0,
          },
        })
      }

      imported++
    }

    return NextResponse.json({
      imported,
      errors,
      warnings,
      total: rows.length,
    })
  } catch (error) {
    console.error('CSV Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    )
  }
}
