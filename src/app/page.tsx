import { Suspense } from 'react'
import { db } from '@/lib/db'
import HomePage from '@/components/bigman/HomePage'
import type { CategoryNode, Product, Brand, ServiceItem } from '@/components/bigman/types'

async function getData() {
  const [categories, products, brands, services] = await Promise.all([
    db.category.findMany({
      where: { isActive: true, showInNav: true, parentId: null },
      include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    }),
    db.product.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        brand: true,
        categories: { include: { category: true } },
        productImages: {
          where: { status: 'APPROVED' },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            imageType: true,
            status: true,
            width: true,
            height: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    db.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { status: 'PUBLISHED' } } } } },
      orderBy: { name: 'asc' },
    }),
    db.serviceProduct.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  return {
    categories: categories as unknown as CategoryNode[],
    products: products as unknown as Product[],
    brands: brands as unknown as Brand[],
    services: services as unknown as ServiceItem[],
  }
}

export default async function Page() {
  const data = await getData()
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <HomePage {...data} />
    </Suspense>
  )
}