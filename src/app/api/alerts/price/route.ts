import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'

const priceAlertSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  customerEmail: z.email('Please enter a valid email address'),
  customerPhone: z.string().optional(),
  targetPrice: z.number().positive('Target price must be a positive number').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = priceAlertSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.issues },
        { status: 400 }
      )
    }

    const { productId, customerEmail, customerPhone, targetPrice } = parsed.data

    // Check product exists and is PUBLISHED
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true, salePrice: true, basePrice: true },
    })

    if (!product || product.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      )
    }

    const currentPrice = product.salePrice ?? product.basePrice

    // Prevent duplicate active alerts for the same email + product
    const existing = await db.priceAlert.findFirst({
      where: { productId, customerEmail, status: 'ACTIVE' },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'You already have an active price alert for this product.' },
        { status: 409 }
      )
    }

    await db.priceAlert.create({
      data: {
        productId,
        customerEmail,
        customerPhone: customerPhone || null,
        targetPrice: targetPrice ?? null,
        currentPrice,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(
      { success: true, message: 'Price alert created.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Price alert error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const email = searchParams.get('email')

    if (!productId || !email) {
      return NextResponse.json(
        { success: false, message: 'productId and email query params are required.' },
        { status: 400 }
      )
    }

    const alert = await db.priceAlert.findFirst({
      where: {
        productId,
        customerEmail: email,
        status: 'ACTIVE',
      },
      select: { targetPrice: true, currentPrice: true },
    })

    if (alert) {
      return NextResponse.json({
        hasAlert: true,
        targetPrice: alert.targetPrice ?? undefined,
        currentPrice: alert.currentPrice ?? undefined,
      })
    }

    return NextResponse.json({ hasAlert: false })
  } catch (error) {
    console.error('Price alert check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
