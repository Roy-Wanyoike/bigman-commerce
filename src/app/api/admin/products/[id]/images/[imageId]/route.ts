import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params
    const image = await db.productImage.findFirst({
      where: { id: imageId, productId: id },
    })
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const body = await req.json()
    const { action, rejectionReason } = body

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    const updated = await db.productImage.update({
      where: { id: imageId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        rejectionReason: action === 'reject' ? rejectionReason || null : null,
      },
    })

    return NextResponse.json({ image: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}
