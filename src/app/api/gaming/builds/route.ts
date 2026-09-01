import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const components = await db.gamingBuildComponent.findMany({
      include: {
        product: {
          include: {
            brand: true,
            productImages: {
              where: { status: 'APPROVED', isPrimary: true },
              take: 1,
              select: { url: true, altText: true },
            },
          },
        },
      },
      orderBy: [{ componentType: 'asc' }, { sortOrder: 'asc' }],
    })

    const grouped: Record<string, typeof components> = {}
    for (const comp of components) {
      if (!grouped[comp.componentType]) grouped[comp.componentType] = []
      grouped[comp.componentType].push(comp)
    }

    return NextResponse.json({ success: true, data: grouped })
  } catch (error) {
    console.error('Failed to fetch gaming build components:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch components' },
      { status: 500 },
    )
  }
}
