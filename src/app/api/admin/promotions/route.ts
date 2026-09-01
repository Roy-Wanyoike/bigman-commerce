import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const promotionCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug (coupon code) is required'),
  description: z.string().nullable().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUNDLE']).optional(),
  discountValue: z.number().min(0).nullable().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  promoType: z.enum(['DEAL', 'CLEARANCE', 'FLASH_SALE', 'BUNDLE']).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isActiveParam = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true'
    }

    const promotions = await db.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ promotions })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list promotions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = promotionCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, slug, description, discountType, discountValue, startDate, endDate, isActive, promoType } = parsed.data

    // Check slug uniqueness
    const existing = await db.promotion.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      )
    }

    const promotion = await db.promotion.create({
      data: {
        name,
        slug,
        description: description ?? null,
        discountType: discountType ?? 'PERCENTAGE',
        discountValue: discountValue ?? null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        promoType: promoType ?? 'DEAL',
      },
    })

    return NextResponse.json({ promotion }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}
