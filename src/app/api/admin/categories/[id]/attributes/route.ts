import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const category = await db.category.findUnique({ where: { id } })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const attributes = await db.categoryAttributeDefinition.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ attributes })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list attributes' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const category = await db.category.findUnique({ where: { id } })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, key, type, unit, options, isRequired, sortOrder } = body

    if (!name || !key) {
      return NextResponse.json(
        { error: 'name and key are required' },
        { status: 400 }
      )
    }

    const existing = await db.categoryAttributeDefinition.findUnique({ where: { key } })
    if (existing) {
      return NextResponse.json({ error: 'Key already exists' }, { status: 409 })
    }

    const attribute = await db.categoryAttributeDefinition.create({
      data: {
        categoryId: id,
        name,
        key,
        type: type || 'TEXT',
        unit: unit || null,
        options: options ? JSON.stringify(options) : null,
        isRequired: isRequired || false,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ attribute }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create attribute' }, { status: 500 })
  }
}
