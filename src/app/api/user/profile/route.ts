import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod/v4'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  county: z.string().optional(),
  address: z.string().optional(),
})

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = profileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    }

    // Convert empty strings to null for optional fields
    const data: Record<string, string | null> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
      data[key] = (value as string).trim() === '' ? null : (value as string).trim()
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        county: true,
        address: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
