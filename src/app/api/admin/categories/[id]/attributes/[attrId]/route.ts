import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const updateAttrSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'BOOLEAN']).optional(),
  unit: z.string().nullable().optional(),
  options: z.array(z.string()).nullable().optional(),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, attrId } = await params
    const body = await req.json()
    const parsed = updateAttrSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const existing = await db.categoryAttributeDefinition.findUnique({ where: { id: attrId } })
    if (!existing || existing.categoryId !== id) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) data.name = parsed.data.name
    if (parsed.data.type !== undefined) data.type = parsed.data.type
    if (parsed.data.unit !== undefined) data.unit = parsed.data.unit
    if (parsed.data.options !== undefined) data.options = parsed.data.options ? JSON.stringify(parsed.data.options) : null
    if (parsed.data.isRequired !== undefined) data.isRequired = parsed.data.isRequired
    if (parsed.data.sortOrder !== undefined) data.sortOrder = parsed.data.sortOrder

    const attr = await db.categoryAttributeDefinition.update({ where: { id: attrId }, data })
    return NextResponse.json({ attribute: attr })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update attribute' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, attrId } = await params

    const existing = await db.categoryAttributeDefinition.findUnique({ where: { id: attrId } })
    if (!existing || existing.categoryId !== id) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 })
    }

    await db.categoryAttributeDefinition.delete({ where: { id: attrId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete attribute' }, { status: 500 })
  }
}
