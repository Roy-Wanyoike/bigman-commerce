import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const brandCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').optional(),
  logo: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
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

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { slug: { contains: search } },
          ],
        }
      : {}

    const brands = await db.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ brands })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list brands' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = brandCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, slug: rawSlug, logo, description, website, isActive, sortOrder } = parsed.data
    const slug = rawSlug || generateSlug(name)

    // Check slug uniqueness
    const existing = await db.brand.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    const brand = await db.brand.create({
      data: {
        name,
        slug,
        logo: logo ?? null,
        description: description ?? null,
        website: website ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
