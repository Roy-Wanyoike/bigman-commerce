import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

interface CatNode {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  level: number
  navIcon: string | null
  navColumns: number
  showInNav: boolean
  seoTitle: string | null
  seoDescription: string | null
  children: CatNode[]
}

export async function GET() {
  try {
    const all = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    // Build recursive tree
    const map = new Map<string, CatNode>()
    for (const c of all) {
      map.set(c.id, {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        parentId: c.parentId,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        isFeatured: c.isFeatured,
        level: c.level,
        navIcon: c.navIcon,
        navColumns: c.navColumns,
        showInNav: c.showInNav,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        children: [],
      })
    }

    const topLevel: CatNode[] = []
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node)
      } else if (!node.parentId) {
        topLevel.push(node)
      }
    }

    // Sort children recursively
    function sortChildren(nodes: CatNode[]) {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      for (const n of nodes) sortChildren(n.children)
    }
    sortChildren(topLevel)

    return NextResponse.json(topLevel)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}
