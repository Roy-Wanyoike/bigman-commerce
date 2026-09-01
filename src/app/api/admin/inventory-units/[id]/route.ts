import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const updateInventoryUnitSchema = z.object({
  serialNumber: z.string().optional(),
  assetNumber: z.string().optional(),
  condition: z.string().optional(),
  conditionGrade: z.string().optional(),
  cosmeticNotes: z.string().optional(),
  cpuModel: z.string().optional(),
  ramSize: z.string().optional(),
  storageSize: z.string().optional(),
  gpuModel: z.string().optional(),
  batteryHealth: z.string().optional(),
  batteryCycles: z.number().int().optional(),
  inspectionData: z.string().optional(),
  inspectionDate: z.string().optional().nullable(),
  inspector: z.string().optional(),
  inspectionNotes: z.string().optional(),
  acquisitionSource: z.string().optional(),
  includedAccessories: z.string().optional(),
  chargerIncluded: z.boolean().optional(),
  warrantyMonths: z.number().int().optional(),
  price: z.number().optional().nullable(),
  status: z.string().optional(),
})

async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }
  return session
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const unit = await db.inventoryUnit.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        unitImages: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!unit) {
      return NextResponse.json({ success: false, error: 'Inventory unit not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: unit })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory unit' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.inventoryUnit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Inventory unit not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateInventoryUnitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      }, { status: 400 })
    }

    const unit = await db.inventoryUnit.update({
      where: { id },
      data: {
        ...(parsed.data.serialNumber !== undefined && { serialNumber: parsed.data.serialNumber || null }),
        ...(parsed.data.assetNumber !== undefined && { assetNumber: parsed.data.assetNumber || null }),
        ...(parsed.data.condition !== undefined && { condition: parsed.data.condition }),
        ...(parsed.data.conditionGrade !== undefined && { conditionGrade: parsed.data.conditionGrade || null }),
        ...(parsed.data.cosmeticNotes !== undefined && { cosmeticNotes: parsed.data.cosmeticNotes || null }),
        ...(parsed.data.cpuModel !== undefined && { cpuModel: parsed.data.cpuModel || null }),
        ...(parsed.data.ramSize !== undefined && { ramSize: parsed.data.ramSize || null }),
        ...(parsed.data.storageSize !== undefined && { storageSize: parsed.data.storageSize || null }),
        ...(parsed.data.gpuModel !== undefined && { gpuModel: parsed.data.gpuModel || null }),
        ...(parsed.data.batteryHealth !== undefined && { batteryHealth: parsed.data.batteryHealth || null }),
        ...(parsed.data.batteryCycles !== undefined && { batteryCycles: parsed.data.batteryCycles ?? null }),
        ...(parsed.data.inspectionData !== undefined && { inspectionData: parsed.data.inspectionData || null }),
        ...(parsed.data.inspectionDate !== undefined && {
          inspectionDate: parsed.data.inspectionDate ? new Date(parsed.data.inspectionDate) : null,
        }),
        ...(parsed.data.inspector !== undefined && { inspector: parsed.data.inspector || null }),
        ...(parsed.data.inspectionNotes !== undefined && { inspectionNotes: parsed.data.inspectionNotes || null }),
        ...(parsed.data.acquisitionSource !== undefined && { acquisitionSource: parsed.data.acquisitionSource || null }),
        ...(parsed.data.includedAccessories !== undefined && { includedAccessories: parsed.data.includedAccessories || null }),
        ...(parsed.data.chargerIncluded !== undefined && { chargerIncluded: parsed.data.chargerIncluded }),
        ...(parsed.data.warrantyMonths !== undefined && { warrantyMonths: parsed.data.warrantyMonths ?? null }),
        ...(parsed.data.price !== undefined && { price: parsed.data.price }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: unit })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to update inventory unit' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.inventoryUnit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Inventory unit not found' }, { status: 404 })
    }

    if (existing.status === 'SOLD' || existing.status === 'RESERVED') {
      return NextResponse.json({
        success: false,
        error: `Cannot delete inventory unit with status '${existing.status}'`
      }, { status: 400 })
    }

    await db.inventoryUnit.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to delete inventory unit' }, { status: 500 })
  }
}
