import { db } from '@/lib/db'
import RefurbishedClient from './RefurbishedClient'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Refurbished Store | Bigman Computers',
  description: 'Inspected, graded and warrantied refurbished laptops and devices at Bigman Computers, Nairobi.',
}

export const dynamic = 'force-dynamic'

export default async function RefurbishedPage() {
  const [categories, products] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.product.findMany({
      where: { status: { in: ['ACTIVE', 'PUBLISHED'] }, condition: 'REFURBISHED' },
      include: { brand: true, categories: { include: { category: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  function buildTree(parentId: string | null = null): any[] {
    return categories.filter(c => c.parentId === parentId).map(c => ({ ...c, children: buildTree(c.id) }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={buildTree()} />
      <RefurbishedClient products={JSON.parse(JSON.stringify(products))} />
      <BigmanFooter categories={buildTree()} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}