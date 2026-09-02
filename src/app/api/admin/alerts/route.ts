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
    const type = sp.get('type') || 'all' // price | stock | all
    const status = sp.get('status') || null

    const wherePrice: Record<string, unknown> = {}
    const whereStock: Record<string, unknown> = {}

    if (status) {
      wherePrice.status = status
      whereStock.status = status
    }

    const includeProduct = {
      product: {
        select: { id: true, name: true, slug: true, basePrice: true, thumbnail: true },
      },
    }

    let priceAlerts: unknown[] = []
    let stockAlerts: unknown[] = []

    if (type === 'price' || type === 'all') {
      priceAlerts = await db.priceAlert.findMany({
        where: wherePrice,
        include: includeProduct,
        orderBy: { createdAt: 'desc' },
      })
    }

    if (type === 'stock' || type === 'all') {
      stockAlerts = await db.stockAlert.findMany({
        where: whereStock,
        include: includeProduct,
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({
      priceAlerts,
      stockAlerts,
      totalPriceAlerts: priceAlerts.length,
      totalStockAlerts: stockAlerts.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}