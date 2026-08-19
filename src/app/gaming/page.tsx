import { db } from '@/lib/db'
import GamingClient from './GamingClient'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Gaming | Bigman Computers',
  description: 'Shop gaming laptops, PCs, monitors, peripherals and accessories at Bigman Computers, Nairobi.',
}

export const dynamic = 'force-dynamic'

export default async function GamingPage() {
  const [categories, products] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.product.findMany({
      where: { status: { in: ['ACTIVE', 'PUBLISHED'] }, isGaming: true },
      include: { brand: true, categories: { include: { category: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  function buildTree(parentId: string | null = null): any[] {
    return categories.filter(c => c.parentId === parentId).map(c => ({
      ...c, children: buildTree(c.id),
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={buildTree()} />
      <GamingClient products={JSON.parse(JSON.stringify(products))} />
      <BigmanFooter categories={buildTree()} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}