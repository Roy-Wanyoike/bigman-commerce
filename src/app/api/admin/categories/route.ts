import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface CategoryNode {
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
  children: CategoryNode[]
}

async function buildTree(): Promise<CategoryNode[]> {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const c of categories) {
    map.set(c.id, { ...c, children: [] })
  }

  for (const c of categories) {
    const node = map.get(c.id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function GET() {
  try {
    const tree = await buildTree()
    return NextResponse.json({ categories: tree })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, slug, description, image, parentId, sortOrder,
      isActive, isFeatured, seoTitle, seoDescription, canonical,
      ogImage, introduction, faq, schemaMarkup, showInNav, navIcon,
      navColumns, filterConfig,
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'name and slug are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness within parent
    const existing = await db.category.findFirst({
      where: { slug, parentId: parentId || null },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists under this parent' },
        { status: 409 }
      )
    }

    const parentLevel = parentId
      ? (await db.category.findUnique({ where: { id: parentId }, select: { level: true } }))?.level ?? 0
      : 0

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        level: parentLevel + 1,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        canonical: canonical || null,
        ogImage: ogImage || null,
        introduction: introduction || null,
        faq: faq ? JSON.stringify(faq) : null,
        schemaMarkup: schemaMarkup || null,
        showInNav: showInNav !== undefined ? showInNav : true,
        navIcon: navIcon || null,
        navColumns: navColumns || 3,
        filterConfig: filterConfig ? JSON.stringify(filterConfig) : null,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
