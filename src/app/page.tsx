import { Suspense } from 'react'
import { db } from '@/lib/db'
import HomePage from '@/components/bigman/HomePage'

async function getData() {
  const [categories, products, brands, services] = await Promise.all([
    db.category.findMany({
      where: { isActive: true, showInNav: true, parentId: null },
      include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    }),
    db.product.findMany({
      where: { status: 'ACTIVE' },
      include: { brand: true, categories: { include: { category: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    db.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
      orderBy: { name: 'asc' },
    }),
    db.serviceProduct.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  return { categories, products, brands, services }
}

export default async function Page() {
  const data = await getData()
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <HomePage {...data} />
    </Suspense>
  )
}