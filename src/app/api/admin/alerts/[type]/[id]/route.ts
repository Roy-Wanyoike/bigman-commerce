import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const updateSchema = z.object({
  status: z.enum(['ACTIVE', 'TRIGGERED', 'CANCELLED', 'WAITING']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await params

    if (type !== 'price' && type !== 'stock') {
      return NextResponse.json({ error: 'Invalid alert type. Must be "price" or "stock".' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status value', details: parsed.error.issues }, { status: 400 })
    }

    const { status: newStatus } = parsed.data

    // Validate status transition
    if (type === 'price') {
      if (!['ACTIVE', 'TRIGGERED', 'CANCELLED'].includes(newStatus)) {
        return NextResponse.json(
          { error: `Invalid status for price alert. Must be one of: ACTIVE, TRIGGERED, CANCELLED` },
          { status: 400 }
        )
      }

      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'TRIGGERED') {
        updateData.triggeredAt = new Date()
      }

      const alert = await db.priceAlert.update({
        where: { id },
        data: updateData,
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      })

      return NextResponse.json({ alert })
    } else {
      if (!['WAITING', 'TRIGGERED', 'CANCELLED'].includes(newStatus)) {
        return NextResponse.json(
          { error: `Invalid status for stock alert. Must be one of: WAITING, TRIGGERED, CANCELLED` },
          { status: 400 }
        )
      }

      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'TRIGGERED') {
        updateData.triggeredAt = new Date()
      }

      const alert = await db.stockAlert.update({
        where: { id },
        data: updateData,
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      })

      return NextResponse.json({ alert })
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
