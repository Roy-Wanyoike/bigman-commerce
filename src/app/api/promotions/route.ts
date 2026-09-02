import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const now = new Date()

    const promotions = await db.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          // No end date — always within range if started
          { startDate: { lte: now }, endDate: null },
          // Both dates set — must be within range
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: promotions })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch promotions' }, { status: 500 })
  }
}
