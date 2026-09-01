import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const VALID_SERVICE_TYPES = ['REPAIR', 'UPGRADE', 'INSTALLATION', 'RECOVERY', 'SUPPORT'] as const

const serviceCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  basePrice: z.number().min(0, 'Base price is required'),
  salePrice: z.number().min(0).nullable().optional(),
  duration: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  serviceType: z.enum(VALID_SERVICE_TYPES).nullable().optional(),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim() || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const services = await db.serviceProduct.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ services })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list services' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = serviceCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, slug: rawSlug, description, shortDescription, basePrice, salePrice, duration, isActive, sortOrder, categoryId, serviceType } = parsed.data
    const slug = rawSlug || generateSlug(name)

    // Check slug uniqueness
    const existing = await db.serviceProduct.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    const service = await db.serviceProduct.create({
      data: {
        name,
        slug,
        description: description ?? null,
        shortDescription: shortDescription ?? null,
        basePrice,
        salePrice: salePrice ?? null,
        currency: 'KES',
        duration: duration ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        categoryId: categoryId ?? null,
        serviceType: serviceType ?? null,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
