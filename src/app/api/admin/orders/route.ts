import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sp = req.nextUrl.searchParams
    const status = sp.get('status')
    const paymentStatus = sp.get('paymentStatus')
    const search = sp.get('search')
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ]
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { orderItems: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
