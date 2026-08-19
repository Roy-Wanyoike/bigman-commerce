import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ category })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get category' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      name, slug, parentId, description, isActive, isFeatured,
      showInNav, navIcon, navColumns, sortOrder,
      seoTitle, seoDescription, canonical, ogImage,
      introduction, faq, schemaMarkup, filterConfig,
    } = body

    // If slug changed, check uniqueness within parent
    if (slug && slug !== existing.slug) {
      const newParentId = parentId !== undefined ? parentId || null : existing.parentId
      const slugTaken = await db.category.findFirst({
        where: { slug, parentId: newParentId, id: { not: id } },
      })
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists under this parent' },
          { status: 409 }
        )
      }
    }

    // Recalculate level if parent changed
    let newLevel = existing.level
    if (parentId !== undefined) {
      const parentLevel = parentId
        ? (await db.category.findUnique({ where: { id: parentId }, select: { level: true } }))?.level ?? 0
        : 0
      newLevel = parentLevel + 1
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(showInNav !== undefined && { showInNav }),
        ...(navIcon !== undefined && { navIcon }),
        ...(navColumns !== undefined && { navColumns }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(canonical !== undefined && { canonical }),
        ...(ogImage !== undefined && { ogImage }),
        ...(introduction !== undefined && { introduction }),
        ...(faq !== undefined && { faq: faq ? JSON.stringify(faq) : null }),
        ...(schemaMarkup !== undefined && { schemaMarkup }),
        ...(filterConfig !== undefined && { filterConfig: filterConfig ? JSON.stringify(filterConfig) : null }),
        // Always update level when parent might change
        ...(parentId !== undefined && { level: newLevel }),
      },
    })

    return NextResponse.json({ category })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: true,
        children: true,
      },
    })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Soft delete: if category has products or children, just deactivate
    const hasProducts = category.products.length > 0
    const hasChildren = category.children.length > 0

    if (hasProducts || hasChildren) {
      // Soft delete
      const updated = await db.category.update({
        where: { id },
        data: { isActive: false, showInNav: false },
      })
      return NextResponse.json({
        category: updated,
        softDeleted: true,
        message: hasProducts
          ? 'Category has products and was deactivated instead of deleted.'
          : 'Category has subcategories and was deactivated instead of deleted.',
      })
    }

    // Hard delete: no products and no children
    await db.category.delete({ where: { id } })
    return NextResponse.json({
      deleted: true,
      message: 'Category deleted permanently.',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
