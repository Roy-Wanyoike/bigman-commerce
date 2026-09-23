import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Require authentication — no anonymous order access
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { orderItems: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, errors: { _form: ['Order not found'] } },
        { status: 404 },
      )
    }

    // Verify the order belongs to the authenticated user (or user is admin)
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    if (!isAdmin && order.userId && order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, errors: { _form: ['Order not found'] } },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, order }, { status: 200 })
  } catch (e) {
    console.error('[Order Detail API]', e)
    return NextResponse.json(
      { success: false, errors: { _form: ['Failed to fetch order. Please try again.'] } },
      { status: 500 },
    )
  }
}
