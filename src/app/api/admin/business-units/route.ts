import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const createBusinessUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const search = req.nextUrl.searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const businessUnits = await db.businessUnit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    })

    return NextResponse.json({ success: true, data: businessUnits })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch business units' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createBusinessUnitSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    const { name, description } = parsed.data
    const slug = slugify(name)

    const existingSlug = await db.businessUnit.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ success: false, error: 'A business unit with this name already exists' }, { status: 400 })
    }

    const businessUnit = await db.businessUnit.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, data: businessUnit }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to create business unit' }, { status: 500 })
  }
}
