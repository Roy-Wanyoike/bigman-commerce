import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const reviewActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'unpublish']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = reviewActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const { action } = parsed.data

    if (action === 'reject') {
      await db.review.delete({ where: { id } })
      return NextResponse.json({ success: true, action: 'rejected' })
    }

    if (action === 'approve') {
      const review = await db.review.update({
        where: { id },
        data: { isPublished: true, isVerified: true },
      })
      return NextResponse.json({ review, action: 'approved' })
    }

    if (action === 'unpublish') {
      const review = await db.review.update({
        where: { id },
        data: { isPublished: false },
      })
      return NextResponse.json({ review, action: 'unpublished' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await db.review.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
