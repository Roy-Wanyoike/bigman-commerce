import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const createInventoryUnitSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  serialNumber: z.string().optional(),
  assetNumber: z.string().optional(),
  condition: z.string().optional().default('NEW'),
  conditionGrade: z.string().optional(),
  cosmeticNotes: z.string().optional(),
  cpuModel: z.string().optional(),
  ramSize: z.string().optional(),
  storageSize: z.string().optional(),
  gpuModel: z.string().optional(),
  batteryHealth: z.string().optional(),
  batteryCycles: z.number().int().optional(),
  inspectionData: z.string().optional(),
  inspectionDate: z.string().optional(),
  inspector: z.string().optional(),
  inspectionNotes: z.string().optional(),
  acquisitionSource: z.string().optional(),
  includedAccessories: z.string().optional(),
  chargerIncluded: z.boolean().optional(),
  warrantyMonths: z.number().int().optional(),
  price: z.number().optional().nullable(),
  status: z.string().optional().default('AVAILABLE'),
})

async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user?.role || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const sp = req.nextUrl.searchParams
    const productId = sp.get('productId') || undefined
    const status = sp.get('status') || undefined
    const condition = sp.get('condition') || undefined
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (status) where.status = status
    if (condition) where.condition = condition

    const skip = (page - 1) * limit

    const [units, total] = await Promise.all([
      db.inventoryUnit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.inventoryUnit.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: units,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory units' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createInventoryUnitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      }, { status: 400 })
    }

    const { productId } = parsed.data

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const unit = await db.inventoryUnit.create({
      data: {
        productId,
        serialNumber: parsed.data.serialNumber || null,
        assetNumber: parsed.data.assetNumber || null,
        condition: parsed.data.condition,
        conditionGrade: parsed.data.conditionGrade || null,
        cosmeticNotes: parsed.data.cosmeticNotes || null,
        cpuModel: parsed.data.cpuModel || null,
        ramSize: parsed.data.ramSize || null,
        storageSize: parsed.data.storageSize || null,
        gpuModel: parsed.data.gpuModel || null,
        batteryHealth: parsed.data.batteryHealth || null,
        batteryCycles: parsed.data.batteryCycles ?? null,
        inspectionData: parsed.data.inspectionData || null,
        inspectionDate: parsed.data.inspectionDate ? new Date(parsed.data.inspectionDate) : null,
        inspector: parsed.data.inspector || null,
        inspectionNotes: parsed.data.inspectionNotes || null,
        acquisitionSource: parsed.data.acquisitionSource || null,
        includedAccessories: parsed.data.includedAccessories || null,
        chargerIncluded: parsed.data.chargerIncluded ?? false,
        warrantyMonths: parsed.data.warrantyMonths ?? null,
        price: parsed.data.price ?? null,
        status: parsed.data.status,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: unit }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: 'Failed to create inventory unit' }, { status: 500 })
  }
}
