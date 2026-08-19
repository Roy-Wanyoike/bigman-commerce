import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdirSync } from 'fs'
import sharp from 'sharp'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 6000
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGES_PER_PRODUCT = 5

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null
    const altText = formData.get('altText') as string | null
    const imageType = formData.get('imageType') as string || 'FRONT'
    const isPrimary = formData.get('isPrimary') === 'true'
    const source = (formData.get('source') as string) || 'STAFF_UPLOAD'

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    // Validate product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Check image count limit
    const existingCount = await db.productImage.count({
      where: { productId },
    })
    if (existingCount >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images per product. Currently has ${existingCount}.` },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate dimensions using sharp
    let width: number
    let height: number
    try {
      const metadata = await sharp(buffer).metadata()
      width = metadata.width || 0
      height = metadata.height || 0

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        return NextResponse.json(
          { error: `Image dimensions too large. Maximum is ${MAX_DIMENSION}x${MAX_DIMENSION}px.` },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid image file. Could not read image data.' },
        { status: 400 }
      )
    }

    // Save file to disk
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products', productId)
    mkdirSync(uploadsDir, { recursive: true })

    const timestamp = Date.now()
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${timestamp}-${safeName}`
    const filepath = path.join(uploadsDir, filename)
    const urlPath = `/uploads/products/${productId}/${filename}`

    await writeFile(filepath, buffer)

    // If isPrimary, unset other primary images
    if (isPrimary) {
      await db.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    // Create ProductImage record
    const image = await db.productImage.create({
      data: {
        productId,
        url: urlPath,
        altText: altText || null,
        imageType,
        isPrimary,
        source,
        width,
        height,
        mimeType: file.type,
        fileSize: file.size,
        status: 'APPROVED',
        sortOrder: existingCount,
      },
    })

    return NextResponse.json({ image }, { status: 201 })
  } catch (e) {
    console.error('Image upload error:', e)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
