import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const images = await db.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ images })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 })
  }
}

export async function POST(
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
    const {
      url, originalUrl, thumbnailUrl, altText, caption, sortOrder,
      isPrimary, source, sourceUrl, licenseStatus, width, height,
      mimeType, fileSize, qualityScore, imageType, inventoryUnitId,
    } = body

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const image = await db.productImage.create({
      data: {
        productId: id,
        url,
        originalUrl: originalUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        altText: altText || null,
        caption: caption || null,
        sortOrder: sortOrder || 0,
        isPrimary: isPrimary || false,
        source: source || null,
        sourceUrl: sourceUrl || null,
        licenseStatus: licenseStatus || null,
        width: width || null,
        height: height || null,
        mimeType: mimeType || null,
        fileSize: fileSize || null,
        qualityScore: qualityScore || null,
        imageType: imageType || null,
        inventoryUnitId: inventoryUnitId || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ image }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}
