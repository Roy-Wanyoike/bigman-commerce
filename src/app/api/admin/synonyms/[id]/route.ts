import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const synonymUpdateSchema = z.object({
  term: z.string().min(1).trim().optional(),
  synonym: z.string().min(1).trim().optional(),
})

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
    const record = await db.searchSynonym.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ error: 'Synonym not found' }, { status: 404 })
    }
    return NextResponse.json({ synonym: record })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get synonym' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const existing = await db.searchSynonym.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Synonym not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = synonymUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const newTerm = data.term ?? existing.term
    const newSynonym = data.synonym ?? existing.synonym

    // Check uniqueness if either field is changing
    if (newTerm !== existing.term || newSynonym !== existing.synonym) {
      const taken = await db.searchSynonym.findFirst({
        where: {
          term: newTerm,
          synonym: newSynonym,
          id: { not: id },
        },
      })
      if (taken) {
        return NextResponse.json(
          { error: 'This synonym pair already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.searchSynonym.update({
      where: { id },
      data: {
        ...(data.term !== undefined && { term: data.term }),
        ...(data.synonym !== undefined && { synonym: data.synonym }),
      },
    })

    return NextResponse.json({ synonym: record })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update synonym' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const record = await db.searchSynonym.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ error: 'Synonym not found' }, { status: 404 })
    }

    await db.searchSynonym.delete({ where: { id } })
    return NextResponse.json({
      deleted: true,
      message: 'Synonym deleted successfully.',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete synonym' }, { status: 500 })
  }
}
