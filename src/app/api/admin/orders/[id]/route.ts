import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  deliveryStatus: z.enum(['PENDING', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'PICKED_UP']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
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
    const parsed = updateOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { status, paymentStatus, deliveryStatus, trackingNumber, notes } = parsed.data

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus
    if (deliveryStatus !== undefined) data.deliveryStatus = deliveryStatus
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber
    if (notes !== undefined) data.notes = notes

    if (status === 'SHIPPED') {
      data.dispatchedAt = new Date()
    }
    if (status === 'DELIVERED') {
      data.deliveredAt = new Date()
    }

    const order = await db.order.update({
      where: { id },
      data,
      include: { orderItems: true },
    })

    return NextResponse.json({ order })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
