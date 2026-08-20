import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const source = sp.get('source')
    const category = sp.get('category')
    const startDate = sp.get('startDate')
    const endDate = sp.get('endDate')
    const page = parseInt(sp.get('page') || '1')
    const pageSize = parseInt(sp.get('pageSize') || '20')

    const where: any = {}
    if (source) where.source = source
    if (category) where.productCategory = category
    if (startDate || endDate) {
      where.observedDate = {}
      if (startDate) where.observedDate.gte = new Date(startDate)
      if (endDate) where.observedDate.lte = new Date(endDate)
    }

    const skip = (page - 1) * pageSize

    const [observations, total] = await Promise.all([
      db.marketPriceObservation.findMany({
        where,
        orderBy: { observedDate: 'desc' },
        take: pageSize,
        skip,
      }),
      db.marketPriceObservation.count({ where }),
    ])

    return NextResponse.json({ observations, total, page, pageSize })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list observations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      source, productName, productCategory, observedPrice,
      currency, observedDate, url, condition, notes,
    } = body

    if (!source || !observedPrice || !observedDate) {
      return NextResponse.json(
        { error: 'source, observedPrice, and observedDate are required' },
        { status: 400 }
      )
    }

    const observation = await db.marketPriceObservation.create({
      data: {
        source,
        productName: productName || null,
        productCategory: productCategory || null,
        observedPrice: parseFloat(observedPrice),
        currency: currency || 'KES',
        observedDate: new Date(observedDate),
        url: url || null,
        condition: condition || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ observation }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create observation' }, { status: 500 })
  }
}
