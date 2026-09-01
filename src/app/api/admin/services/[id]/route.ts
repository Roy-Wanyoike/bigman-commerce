import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const VALID_SERVICE_TYPES = ['REPAIR', 'UPGRADE', 'INSTALLATION', 'RECOVERY', 'SUPPORT'] as const

const serviceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  basePrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).nullable().optional(),
  duration: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  serviceType: z.enum(VALID_SERVICE_TYPES).nullable().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await db.serviceProduct.findUnique({ where: { id } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    return NextResponse.json({ service })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get service' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.serviceProduct.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = serviceUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // If slug is changing, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await db.serviceProduct.findFirst({
        where: { slug: data.slug, id: { not: id } },
      })
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    const service = await db.serviceProduct.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.serviceType !== undefined && { serviceType: data.serviceType }),
      },
    })

    return NextResponse.json({ service })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await db.serviceProduct.findUnique({ where: { id } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await db.serviceProduct.delete({ where: { id } })
    return NextResponse.json({
      deleted: true,
      message: 'Service deleted successfully.',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
