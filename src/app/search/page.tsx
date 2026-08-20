'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search as SearchIcon, PackageOpen, X, ChevronRight } from 'lucide-react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/bigman/ProductCard'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import type { Product } from '@/components/bigman/types'

const PAGE_SIZE = 20

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const [query, setQuery] = useState(q)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => { setQuery(q); setPage(1) }, [q])

  useEffect(() => {
    if (!query.trim()) { setProducts([]); setTotal(0); return }
    setLoading(true)
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String((page - 1) * PAGE_SIZE))
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setTotal(data.total || 0) })
      .catch(() => { setProducts([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [query, page])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      setPage(1)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="size-3" /></BreadcrumbSeparator>
              <BreadcrumbItem><BreadcrumbPage>Search Results</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search laptops, SSDs, chargers, repairs..."
                className="pl-9 h-11 text-base"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <button type="submit" className="h-11 px-6 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90">
              Search
            </button>
          </form>

          {query && !loading && (
            <p className="text-sm text-muted-foreground mb-6">
              {total > 0
                ? `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, total)}\u2013${Math.min(page * PAGE_SIZE, total)} of ${total} results for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card">
                  <Skeleton className="aspect-square rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : query ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <PackageOpen className="size-12 mb-4" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-1">Try different keywords or browse our categories.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <SearchIcon className="size-12 mb-4" />
              <p className="text-lg font-medium">Search Bigman Computers</p>
              <p className="text-sm mt-1">Find laptops, parts, accessories, gaming gear, and more.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="h-9 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2).map((p, i, arr) => (
                <span key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                  <button className={`h-9 w-9 rounded-md text-sm ${p === page ? 'bg-primary text-primary-foreground' : 'border border-input bg-background'}`} onClick={() => setPage(p)}>{p}</button>
                </span>
              ))}
              <button className="h-9 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <SearchContent />
    </Suspense>
  )
}