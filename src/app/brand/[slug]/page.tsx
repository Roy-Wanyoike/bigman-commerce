'use client'

import { use, useState, useEffect } from 'react'
import { ChevronRight, PackageOpen } from 'lucide-react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/bigman/ProductCard'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

const PAGE_SIZE = 20
const SORT_OPTIONS = [
  { value: 'sortOrder', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [brandInfo, setBrandInfo] = useState<{ name: string; description: string | null } | null>(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('sortOrder')

  useEffect(() => {
    const qp = new URLSearchParams()
    qp.set('brand', slug)
    qp.set('sort', sort)
    qp.set('limit', String(PAGE_SIZE))
    qp.set('offset', String((page - 1) * PAGE_SIZE))

    setLoading(true)
    fetch(`/api/products?${qp.toString()}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || [])
        setTotal(data.total || 0)
        if (data.products?.[0]?.brand) {
          setBrandInfo({ name: data.products[0].brand.name, description: data.products[0].brand.description })
        }
      })
      .catch(() => { setProducts([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [slug, sort, page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1 bg-background">
        <div className="container-main py-6">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="size-3" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{brandInfo?.name || slug.replace(/-/g, ' ')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight capitalize">{brandInfo?.name || slug.replace(/-/g, ' ')}</h1>
            {brandInfo?.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{brandInfo.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{total} product{total !== 1 ? 's' : ''} found</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1) }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-w-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card">
                  <Skeleton className="aspect-square rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <PackageOpen className="size-12 mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">No {brandInfo?.name || slug} products are currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-w-0">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                className="h-9 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                    <button
                      className={`h-9 w-9 rounded-md text-sm ${p === page ? 'bg-primary text-primary-foreground' : 'border border-input bg-background'}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  </span>
                ))}
              <button
                className="h-9 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >Next</button>
            </div>
          )}
        </div>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
