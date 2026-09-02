import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const promotionUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUNDLE']).optional(),
  discountValue: z.number().min(0).nullable().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  promoType: z.enum(['DEAL', 'CLEARANCE', 'FLASH_SALE', 'BUNDLE']).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const promotion = await db.promotion.findUnique({ where: { id } })
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json({ promotion })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get promotion' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const existing = await db.promotion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = promotionUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // If slug is changing, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await db.promotion.findFirst({
        where: { slug: data.slug, id: { not: id } },
      })
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 409 }
        )
      }
    }

    const promotion = await db.promotion.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.promoType !== undefined && { promoType: data.promoType }),
      },
    })

    return NextResponse.json({ promotion })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const promotion = await db.promotion.findUnique({ where: { id } })
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    await db.promotion.delete({ where: { id } })
    return NextResponse.json({
      deleted: true,
      message: 'Promotion deleted successfully.',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}
