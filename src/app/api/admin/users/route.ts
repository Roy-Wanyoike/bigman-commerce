import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const VALID_ROLES = ['CUSTOMER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'] as const

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim() || ''
    const role = searchParams.get('role')?.trim() || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (role && VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
      where.role = role
    }

    const users = await db.user.findMany({
      where,
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}
