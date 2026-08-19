import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const services = await db.serviceProduct.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(services)
  } catch {
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
  }
}
