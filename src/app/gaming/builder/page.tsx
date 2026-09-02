import { db } from '@/lib/db'
import { BuilderClient } from './BuilderClient'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import type { CategoryNode } from '@/components/bigman/types'

export const metadata = {
  title: 'Gaming PC Builder | Bigman Computers',
  description: 'Build your custom gaming PC with our interactive component selector at Bigman Computers, Nairobi.',
}

export const dynamic = 'force-dynamic'

export default async function GamingBuilderPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  function buildTree(parentId: string | null = null): CategoryNode[] {
    return categories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({ ...c, children: buildTree(c.id) }))
  }

  const tree = buildTree()

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={tree} />
      <BuilderClient />
      <BigmanFooter categories={tree} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}