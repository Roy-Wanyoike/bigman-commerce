import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { unlinkSync, existsSync } from 'fs'
import path from 'path'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, imageId } = await params
    const image = await db.productImage.findFirst({
      where: { id: imageId, productId: id },
    })
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const body = await req.json()
    const { action, rejectionReason, altText } = body

    if (action === 'approve') {
      const updated = await db.productImage.update({
        where: { id: imageId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      })
      return NextResponse.json({ image: updated })
    }

    if (action === 'reject') {
      const updated = await db.productImage.update({
        where: { id: imageId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      })
      return NextResponse.json({ image: updated })
    }

    if (action === 'set-primary') {
      // Unset all other primary images for this product
      await db.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      })
      const updated = await db.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      })
      return NextResponse.json({ image: updated })
    }

    if (action === 'update-alt') {
      const updated = await db.productImage.update({
        where: { id: imageId },
        data: { altText: altText || null },
      })
      return NextResponse.json({ image: updated })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: approve, reject, set-primary, or update-alt.' },
      { status: 400 }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, imageId } = await params
    const image = await db.productImage.findFirst({
      where: { id: imageId, productId: id },
    })
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Try to delete the file from disk if it's a local upload
    if (image.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', image.url)
      if (existsSync(filePath)) {
        try { unlinkSync(filePath) } catch { /* ignore */ }
      }
    }

    await db.productImage.delete({ where: { id: imageId } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
