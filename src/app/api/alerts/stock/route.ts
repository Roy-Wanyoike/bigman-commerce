import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'

const stockAlertSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  customerEmail: z.email('Please enter a valid email address'),
  customerPhone: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = stockAlertSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.issues },
        { status: 400 }
      )
    }

    const { productId, customerEmail, customerPhone } = parsed.data

    // Check product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      )
    }

    // Prevent duplicate waiting alerts for the same email + product
    const existing = await db.stockAlert.findFirst({
      where: { productId, customerEmail, status: 'WAITING' },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'You already have an active stock alert for this product.' },
        { status: 409 }
      )
    }

    await db.stockAlert.create({
      data: {
        productId,
        customerEmail,
        customerPhone: customerPhone || null,
        status: 'WAITING',
      },
    })

    return NextResponse.json(
      { success: true, message: 'Stock alert created.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Stock alert error:', error)
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

    const alert = await db.stockAlert.findFirst({
      where: {
        productId,
        customerEmail: email,
        status: 'WAITING',
      },
      select: { id: true },
    })

    return NextResponse.json({ hasAlert: !!alert })
  } catch (error) {
    console.error('Stock alert check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
