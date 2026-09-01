import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'

const synonymCreateSchema = z.object({
  term: z.string().min(1, 'Term is required').trim(),
  synonym: z.string().min(1, 'Synonym is required').trim(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim() || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { term: { contains: search } },
        { synonym: { contains: search } },
      ]
    }

    const synonyms = await db.searchSynonym.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ synonyms })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list synonyms' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = synonymCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { term, synonym } = parsed.data

    // Check uniqueness
    const existing = await db.searchSynonym.findUnique({
      where: { term_synonym: { term, synonym } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This synonym pair already exists' },
        { status: 409 }
      )
    }

    const record = await db.searchSynonym.create({
      data: { term, synonym },
    })

    return NextResponse.json({ synonym: record }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create synonym' }, { status: 500 })
  }
}
