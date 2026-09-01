import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const validateSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = validateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { code, subtotal } = parsed.data
    const now = new Date()

    // Look up promotion by slug (the code IS the slug)
    const promotion = await db.promotion.findUnique({
      where: { slug: code.trim().toUpperCase() },
    })

    if (!promotion) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid coupon code. Please check and try again.',
      })
    }

    // Check isActive
    if (!promotion.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon is no longer active.',
      })
    }

    // Check startDate <= now
    if (new Date(promotion.startDate) > now) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon is not yet valid.',
      })
    }

    // Check endDate >= now (or null)
    if (promotion.endDate && new Date(promotion.endDate) < now) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon has expired.',
      })
    }

    // Calculate discount
    let discountAmount = 0

    if (promotion.discountType === 'PERCENTAGE' && promotion.discountValue != null) {
      discountAmount = Math.round((subtotal * promotion.discountValue) / 100)
    } else if (promotion.discountType === 'FIXED_AMOUNT' && promotion.discountValue != null) {
      discountAmount = Math.min(promotion.discountValue, subtotal)
    }
    // BUNDLE type: no automatic discount calculation

    if (discountAmount < 0) discountAmount = 0

    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        slug: promotion.slug,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        promoType: promotion.promoType,
      },
      discountAmount,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { valid: false, message: 'Failed to validate coupon. Please try again.' },
      { status: 500 }
    )
  }
}
