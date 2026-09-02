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

const updateBusinessUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const businessUnit = await db.businessUnit.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!businessUnit) {
      return NextResponse.json({ success: false, error: 'Business unit not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: businessUnit })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch business unit' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.businessUnit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Business unit not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateBusinessUnitSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    const { name, description, isActive } = parsed.data

    // If name is being changed, check uniqueness and update slug
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      const newSlug = slugify(name)
      const slugTaken = await db.businessUnit.findFirst({
        where: { slug: newSlug, id: { not: id } },
      })
      if (slugTaken) {
        return NextResponse.json({ success: false, error: 'A business unit with this name already exists' }, { status: 400 })
      }
      updateData.name = name
      updateData.slug = newSlug
    }
    if (description !== undefined) {
      updateData.description = description || null
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const businessUnit = await db.businessUnit.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: businessUnit })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to update business unit' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const businessUnit = await db.businessUnit.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!businessUnit) {
      return NextResponse.json({ success: false, error: 'Business unit not found' }, { status: 404 })
    }

    const hasProducts = businessUnit._count.products > 0

    if (hasProducts) {
      // Soft delete: deactivate the business unit
      const updated = await db.businessUnit.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({
        success: true,
        data: updated,
        softDeleted: true,
        message: 'Business unit has linked products and was deactivated instead of deleted.',
      })
    }

    // Hard delete: no linked products
    await db.businessUnit.delete({ where: { id } })
    return NextResponse.json({
      success: true,
      data: null,
      message: 'Business unit deleted permanently.',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to delete business unit' }, { status: 500 })
  }
}
