'use client'

import { use, useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Home, ChevronRight, SlidersHorizontal, X, ArrowUpDown,
  ChevronLeft, ChevronRight as ChevronR, PackageOpen, Loader2,
  Laptop, Monitor, Gamepad2, Apple, RotateCcw, Cpu, Printer,
  Wrench, HardDrive, Zap, Code, Building2,
} from 'lucide-react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import ProductCard from '@/components/bigman/ProductCard'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import { formatPrice } from '@/lib/prices'
import type { CategoryNode, Product } from '@/components/bigman/types'
import { cn } from '@/lib/utils'

// ============================================================
// ICON MAP for subcategory cards
// ============================================================
const catIcons: Record<string, any> = {
  laptops: Laptop, desktops: Monitor, gaming: Gamepad2, 'mac-apple': Apple,
  workstations: Cpu, monitors: Monitor, printers: Printer, accessories: Wrench,
  parts: Wrench, hardware: Cpu, storage: HardDrive, 'ram-memory': HardDrive,
  networking: Zap, power: Zap, software: Code, 'bags-protection': Laptop,
  'office-technology': Building2, refurbished: RotateCcw, deals: Cpu,
  services: Wrench, business: Building2, 'cables-adapters': Zap,
}

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'REFURBISHED', label: 'Refurbished' },
  { value: 'USED', label: 'Used' },
  { value: 'OPEN_BOX', label: 'Open Box' },
] as const

const SORT_OPTIONS = [
  { value: 'sortOrder', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
] as const

const PAGE_SIZE = 20

// ============================================================
// HELPERS
// ============================================================

/** Walk the category tree to find a node matching the slug path */
function findCategoryByPath(tree: CategoryNode[], slugs: string[]): CategoryNode | null {
  if (!slugs.length) return null
  let current = tree.find(c => c.slug === slugs[0]) || null
  for (let i = 1; i < slugs.length; i++) {
    if (!current) return null
    current = current.children.find(c => c.slug === slugs[i]) || null
  }
  return current
}

/** Build breadcrumb trail from slug array + category tree */
function buildBreadcrumbs(tree: CategoryNode[], slugs: string[]) {
  const crumbs: { name: string; href: string }[] = [{ name: 'Home', href: '/' }]
  let nodes: CategoryNode[] = tree
  for (let i = 0; i < slugs.length; i++) {
    const found = nodes.find(c => c.slug === slugs[i])
    const href = '/shop/' + slugs.slice(0, i + 1).join('/')
    crumbs.push({ name: found?.name || slugs[i], href })
    if (found) nodes = found.children
  }
  return crumbs
}

/** Build products API URL from filter state */
function buildProductsUrl(opts: {
  categorySlug: string | null
  brands: string[]
  conditions: string[]
  minPrice: string
  maxPrice: string
  sort: string
  page: number
}) {
  const params = new URLSearchParams()
  if (opts.categorySlug) params.set('category', opts.categorySlug)
  if (opts.brands.length > 0) params.set('brand', opts.brands.join(','))
  if (opts.conditions.length > 0) params.set('condition', opts.conditions.join(','))
  if (opts.minPrice) params.set('minPrice', opts.minPrice)
  if (opts.maxPrice) params.set('maxPrice', opts.maxPrice)
  if (opts.sort) params.set('sort', opts.sort)
  params.set('limit', String(PAGE_SIZE))
  params.set('offset', String((opts.page - 1) * PAGE_SIZE))
  return `/api/products?${params.toString()}`
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function CategoryPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params)
  const slugs = slug || []

  // ---- State ----
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [catLoading, setCatLoading] = useState(true)

  // Filters
  const [brands, setBrands] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('sortOrder')
  const [page, setPage] = useState(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Derived
  const categorySlug = slugs.length > 0 ? slugs[slugs.length - 1] : null
  const currentCategory = useMemo(() => findCategoryByPath(categories, slugs), [categories, slugs])
  const breadcrumbs = useMemo(() => buildBreadcrumbs(categories, slugs), [categories, slugs])
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Extract unique brands from current results
  const availableBrands = useMemo(() => {
    const set = new Map<string, string>()
    for (const p of products) {
      if (p.brand) set.set(p.brand.slug, p.brand.name)
    }
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [products])

  // ---- Fetch categories ----
  useEffect(() => {
    let cancelled = false
    setCatLoading(true)
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCatLoading(false) })
    return () => { cancelled = true }
  }, [])

  // ---- Fetch products ----
  const fetchProducts = useCallback(() => {
    setLoading(true)
    const url = buildProductsUrl({ categorySlug, brands, conditions, minPrice, maxPrice, sort, page })
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setProducts(data.products || [])
          setTotal(data.total || 0)
        } else {
          setProducts([])
          setTotal(0)
        }
      })
      .catch(() => { setProducts([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [categorySlug, brands, conditions, minPrice, maxPrice, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [brands, conditions, minPrice, maxPrice, sort, categorySlug])

  // Update document title
  useEffect(() => {
    const seoTitle = (currentCategory as any)?.seoTitle
    document.title = seoTitle
      ? `${seoTitle} | Bigman Computers`
      : slugs.length > 0
        ? `${currentCategory?.name || slugs[slugs.length - 1]} | Bigman Computers`
        : 'All Products | Bigman Computers'
  }, [currentCategory, slugs])

  // ---- Handlers ----
  const toggleBrand = (brandSlug: string) => {
    setBrands(prev => prev.includes(brandSlug) ? prev.filter(b => b !== brandSlug) : [...prev, brandSlug])
  }

  const toggleCondition = (cond: string) => {
    setConditions(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond])
  }

  const clearAllFilters = () => {
    setBrands([])
    setConditions([])
    setMinPrice('')
    setMaxPrice('')
    setSort('sortOrder')
    setPage(1)
  }

  const hasActiveFilters = brands.length > 0 || conditions.length > 0 || minPrice || maxPrice || sort !== 'sortOrder'

  const removeBrand = (b: string) => setBrands(prev => prev.filter(x => x !== b))
  const removeCondition = (c: string) => setConditions(prev => prev.filter(x => x !== c))

  const categoryName = currentCategory?.name || (slugs.length > 0 ? slugs[slugs.length - 1] : 'All Products')
  const categoryDesc = currentCategory?.description
  const categoryImage = (currentCategory as any)?.image
  const subcategories = currentCategory?.children?.length ? currentCategory.children : []

  // ---- Pagination pages to show ----
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: number[] = []
    pages.push(1)
    if (page > 3) pages.push(-1) // ellipsis
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push(-1)
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }, [page, totalPages])

  // ============================================================
  // RENDER
  // ============================================================

  // Category loading skeleton
  if (catLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={[]} />
        <main className="flex-1 bg-background pb-16 md:pb-0 min-w-0">
          <div className="container-main py-6">
            <Skeleton className="h-5 w-48 mb-6" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-w-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <BigmanFooter categories={[]} />
        <MobileBottomNav />
        <div className="lg:hidden h-14" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1 bg-background pb-16 md:pb-0 min-w-0">
        <div className="container-main overflow-hidden">
        {/* ========== BREADCRUMB ========== */}
        <nav aria-label="breadcrumb" className="pt-4 pb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.name === 'Home' ? <Home className="h-3.5 w-3.5 inline" /> : crumb.name}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ========== CATEGORY HEADER ========== */}
        <div className="py-4 md:py-6">
          <div className="flex items-start gap-4">
            {categoryImage && (
              <div className="hidden md:block w-20 h-20 rounded-xl bg-secondary/50 overflow-hidden shrink-0">
                <img src={categoryImage} alt={categoryName} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{categoryName}</h1>
              {categoryDesc && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">{categoryDesc}</p>
              )}
              {!loading && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {products.length} of {total} products
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ========== SUBCATEGORIES GRID ========== */}
        {subcategories.length > 0 && (
          <section className="pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-w-0">
              {subcategories.map(cat => {
                const Icon = catIcons[cat.slug] || Laptop
                return (
                  <Link
                    key={cat.id}
                    href={`/shop/${slugs.concat(cat.slug).join('/')}`}
                    className="group"
                  >
                    <Card className="hover:border-accent/50 hover:shadow-md transition-all h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                          <Icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="font-medium text-sm">{cat.name}</div>
                        {cat.children.length > 0 && (
                          <div className="text-[11px] text-muted-foreground">{cat.children.length} subcategories</div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <Separator className="mb-6" />

        {/* ========== ACTIVE FILTERS ========== */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {brands.map(b => {
              const label = availableBrands.find(x => x[0] === b)?.[1] || b
              return (
                <Badge key={b} variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => removeBrand(b)}>
                  {label}
                  <button className="hover:text-foreground text-muted-foreground ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
            {conditions.map(c => (
              <Badge key={c} variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => removeCondition(c)}>
                {CONDITIONS.find(x => x.value === c)?.label || c}
                <button className="hover:text-foreground text-muted-foreground ml-0.5">
                  <X className="h-3 w-3" />
                  </button>
              </Badge>
            ))}
            {minPrice && (
              <Badge variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => setMinPrice('')}>
                Min: {formatPrice(Number(minPrice))}
                <button className="hover:text-foreground text-muted-foreground ml-0.5">
                  <X className="h-3 w-3" />
                  </button>
              </Badge>
            )}
            {maxPrice && (
              <Badge variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => setMaxPrice('')}>
                Max: {formatPrice(Number(maxPrice))}
                <button className="hover:text-foreground text-muted-foreground ml-0.5">
                  <X className="h-3 w-3" />
                  </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground"
              onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* ========== TOOLBAR (Sort + Mobile Filter Button) ========== */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {/* Mobile filter trigger */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden h-9 gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="default" className="h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full ml-0.5">
                      {brands.length + conditions.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                <SheetHeader className="p-4 pb-0">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow down your search</SheetDescription>
                </SheetHeader>
                <div className="p-4 pt-2">
                  <FilterControls
                    brands={brands} conditions={conditions}
                    minPrice={minPrice} maxPrice={maxPrice} sort={sort}
                    availableBrands={availableBrands}
                    onToggleBrand={toggleBrand} onToggleCondition={toggleCondition}
                    onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice}
                    onSortChange={setSort} onClearAll={clearAllFilters}
                    onApply={() => setMobileFilterOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 w-40 md:w-48 text-sm">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ========== MAIN CONTENT: SIDEBAR + PRODUCTS ========== */}
        <div className="flex gap-6 min-w-0">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-6">
              <FilterControls
                brands={brands} conditions={conditions}
                minPrice={minPrice} maxPrice={maxPrice} sort={sort}
                availableBrands={availableBrands}
                onToggleBrand={toggleBrand} onToggleCondition={toggleCondition}
                onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice}
                onSortChange={setSort} onClearAll={clearAllFilters}
              />
            </div>
          </aside>

          {/* Product Grid + Pagination */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 min-w-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <PackageOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or browse a different category.
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 min-w-0">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-1.5 mt-8 mb-4" aria-label="Pagination">
                    <Button
                      variant="outline" size="icon" className="h-9 w-9"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {pageNumbers.map((p, i) =>
                      p === -1 ? (
                        <span key={`ellipsis-${i}`} className="px-1.5 text-muted-foreground">…</span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === page ? 'default' : 'outline'}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline" size="icon" className="h-9 w-9"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronR className="h-4 w-4" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </main>
      <BigmanFooter categories={categories} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}

// ============================================================
// FILTER CONTROLS (shared between sidebar and mobile sheet)
// ============================================================

interface FilterControlsProps {
  brands: string[]
  conditions: string[]
  minPrice: string
  maxPrice: string
  sort: string
  availableBrands: [string, string][]
  onToggleBrand: (slug: string) => void
  onToggleCondition: (cond: string) => void
  onMinPriceChange: (v: string) => void
  onMaxPriceChange: (v: string) => void
  onSortChange: (v: string) => void
  onClearAll: () => void
  onApply?: () => void
}

function FilterControls({
  brands, conditions, minPrice, maxPrice,
  availableBrands,
  onToggleBrand, onToggleCondition,
  onMinPriceChange, onMaxPriceChange,
  onClearAll, onApply,
}: FilterControlsProps) {
  return (
    <>
      {/* Clear All */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={onClearAll}>
          Clear all
        </Button>
      </div>

      {/* Condition Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Condition</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {CONDITIONS.map(cond => (
            <label key={cond.value} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={conditions.includes(cond.value)}
                onCheckedChange={() => onToggleCondition(cond.value)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Brand</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableBrands.map(([slug, name]) => (
            <label key={slug} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={brands.includes(slug)}
                onCheckedChange={() => onToggleBrand(slug)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">{name}</span>
            </label>
          ))}
          {availableBrands.length === 0 && (
            <p className="text-xs text-muted-foreground">No brands available</p>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium mb-2">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9 text-sm"
            value={minPrice}
            onChange={e => onMinPriceChange(e.target.value)}
            min={0}
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-9 text-sm"
            value={maxPrice}
            onChange={e => onMaxPriceChange(e.target.value)}
            min={0}
          />
        </div>
        {(minPrice || maxPrice) && (
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground mt-1.5"
            onClick={() => { onMinPriceChange(''); onMaxPriceChange('') }}>
            Clear price
          </Button>
        )}
      </div>

      {/* Apply Button (mobile only) */}
      {onApply && (
        <Button className="w-full mt-2" onClick={onApply}>
          Apply Filters
        </Button>
      )}
    </>
  )
}
