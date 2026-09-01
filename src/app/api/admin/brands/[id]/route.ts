import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const brandUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  logo: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await db.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }
    return NextResponse.json({ brand })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get brand' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.brand.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = brandUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // If slug is changing, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await db.brand.findFirst({
        where: { slug: data.slug, id: { not: id } },
      })
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    const brand = await db.brand.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })

    return NextResponse.json({ brand })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await db.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    if (brand._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand "${brand.name}" — it has ${brand._count.products} linked product(s). Remove or reassign them first.`,
        },
        { status: 409 }
      )
    }

    await db.brand.delete({ where: { id } })
    return NextResponse.json({
      deleted: true,
      message: 'Brand deleted successfully.',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
