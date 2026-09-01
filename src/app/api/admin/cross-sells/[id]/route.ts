import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const VALID_TYPES = ['CROSS_SELL', 'UPSELL', 'BUNDLE', 'FREQUENTLY_BOUGHT'] as const

const updateSchema = z.object({
  type: z.enum(VALID_TYPES).optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // The PK is [fromId, toId], so id in URL is actually fromId__toId or similar.
    // Since the route param is a single id and the PK is composite,
    // we accept fromId and toId as query params or use id as fromId with a required toId query param.
    // But the route is [id] — most pragmatic: the "id" param is treated as a special composite key.
    // We'll expect the client to pass fromId and toId in the body for the unique lookup.
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation failed',
      }, { status: 400 })
    }

    // For composite PK, we need both fromId and toId from the request body
    const { type, sortOrder } = parsed.data
    const fromId = body.fromId
    const toId = body.toId

    if (!fromId || !toId) {
      return NextResponse.json({ success: false, error: 'fromId and toId are required in the body' }, { status: 400 })
    }

    if (fromId !== id) {
      return NextResponse.json({ success: false, error: 'URL id must match body fromId' }, { status: 400 })
    }

    const existing = await db.productCrossSell.findUnique({
      where: { fromId_toId: { fromId, toId } },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Cross-sell not found' }, { status: 404 })
    }

    const updated = await db.productCrossSell.update({
      where: { fromId_toId: { fromId, toId } },
      data: {
        ...(type !== undefined && { type }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to update cross-sell' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id: fromId } = await params
    const toId = req.nextUrl.searchParams.get('toId')
    if (!toId) {
      return NextResponse.json({ success: false, error: 'toId query parameter is required' }, { status: 400 })
    }

    const existing = await db.productCrossSell.findUnique({
      where: { fromId_toId: { fromId, toId } },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Cross-sell not found' }, { status: 404 })
    }

    await db.productCrossSell.delete({
      where: { fromId_toId: { fromId, toId } },
    })

    return NextResponse.json({ success: true, data: { fromId, toId } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to delete cross-sell' }, { status: 500 })
  }
}
