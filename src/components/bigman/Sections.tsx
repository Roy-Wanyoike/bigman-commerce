'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, ArrowUpDown, Laptop, Monitor, Gamepad2, Apple, RotateCcw, Cpu, Printer, Wrench, HardDrive, Zap, Code, Building2, Home, Phone, MessageCircle, MapPin, Clock, Search, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import ProductCard from './ProductCard'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import type { Product, CategoryNode, Brand, ServiceItem } from './types'
import { useCases, budgetPages } from './types'
import { cn } from '@/lib/utils'

const catIcons: Record<string, any> = {
  laptops: Laptop, desktops: Monitor, gaming: Gamepad2, 'mac-apple': Apple,
  workstations: Cpu, monitors: Monitor, printers: Printer, accessories: Wrench,
  parts: Wrench, hardware: Cpu, storage: HardDrive, 'ram-memory': HardDrive,
  networking: Zap, power: Zap, software: Code, 'bags-protection': Laptop,
  'office-technology': Building2, refurbished: RotateCcw, deals: Cpu,
  services: Wrench, business: Building2, 'cables-adapters': Zap,
}

// ============================================================
// FEATURED CATEGORIES GRID
// ============================================================
export function FeaturedCategories({ categories }: { categories: CategoryNode[] }) {
  const featured = categories.filter(c => c.isFeatured || ['laptops', 'gaming', 'desktops', 'accessories', 'parts', 'hardware'].includes(c.slug))
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Find exactly what you need</p>
          </div>
          <Link href="/shop" className="text-sm text-accent hover:underline flex items-center gap-1">
            All categories <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {featured.map(cat => {
            const Icon = catIcons[cat.slug] || Laptop
            const count = cat.children.length
            return (
              <Link key={cat.id} href={`/shop/${cat.slug}`} className="group">
                <Card className="hover:border-accent/50 hover:shadow-md transition-all h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="font-medium text-sm">{cat.name}</div>
                    <div className="text-[11px] text-muted-foreground">{count} subcategories</div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PRODUCT SECTION (reusable for Featured / Deals / Gaming / Refurbished)
// ============================================================
interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
 viewAllHref: string
  accentColor?: string
}

export function ProductSection({ title, subtitle, products, viewAllHref, accentColor }: ProductSectionProps) {
  const display = products.slice(0, 8)
  if (display.length === 0) return null
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {accentColor && <div className={cn("h-8 w-1 rounded-full", accentColor)} />}
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <Link href={viewAllHref} className="text-sm text-accent hover:underline flex items-center gap-1 shrink-0">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {display.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FULL CATALOG WITH FILTERS
// ============================================================
export function FullCatalog({ products, categories, brands }: { products: Product[]; categories: CategoryNode[]; brands: Brand[] }) {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('sortOrder')
  const [conditionFilter, setConditionFilter] = useState<string | null>(null)
  const { compareList, clearCompare } = useStore()

  let filtered = [...products]
  if (activeCat) {
    const catSlugs = getCatAndDescendantSlugs(categories, activeCat)
    filtered = filtered.filter(p => p.categories.some(c => catSlugs.includes(c.category.slug)))
  }
  if (conditionFilter) filtered = filtered.filter(p => p.condition === conditionFilter)

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.basePrice - b.basePrice)
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.basePrice - a.basePrice)
  else if (sortBy === 'newest') filtered.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))

  const topCategories = categories.filter(c => !c.parentId)

  return (
    <section className="py-8 md:py-12 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">All Products</h2>
          <span className="text-sm text-muted-foreground">{filtered.length} products</span>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-card rounded-lg border border-border/50">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
          <Button variant={activeCat === null ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setActiveCat(null)}>All</Button>
          {topCategories.slice(0, 12).map(c => (
            <Button key={c.id} variant={activeCat === c.slug ? 'default' : 'outline'} size="sm" className="h-7 text-xs"
              onClick={() => setActiveCat(activeCat === c.slug ? null : c.slug)}>
              {c.name}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Select value={conditionFilter || 'all'} onValueChange={v => setConditionFilter(v === 'all' ? null : v)}>
              <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="REFURBISHED">Refurbished</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-7 w-32 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sortOrder">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.slice(0, 16).map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </section>
  )
}

function getCatAndDescendantSlugs(categories: CategoryNode[], slug: string): string[] {
  const cat = categories.find(c => c.slug === slug)
  if (!cat) return [slug]
  const slugs = [slug]
  function walk(children: CategoryNode[]) {
    for (const c of children) { slugs.push(c.slug); if (c.children?.length) walk(c.children) }
  }
  if (cat.children?.length) walk(cat.children)
  return slugs
}

// ============================================================
// SHOP BY USE CASE
// ============================================================
export function UseCaseSection() {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Shop by Use Case</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Curated recommendations for every need</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {useCases.map(uc => {
            const Icon = uc.icon
            return (
              <Link key={uc.slug} href={`/shop/${uc.slug}`} className="group">
                <Card className="hover:border-accent/50 hover:shadow-md transition-all h-full">
                  <CardContent className="p-4 md:p-5 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{uc.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{uc.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// BUDGET LANDING PAGES
// ============================================================
export function BudgetSection({ products }: { products: Product[] }) {
  const laptops = products.filter(p => p.categories.some(c => c.category.slug === 'laptops'))
  return (
    <section className="py-8 md:py-12 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Laptops by Budget</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Dynamic pricing from live inventory</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {budgetPages.map(bp => {
            const count = laptops.filter(p => p.basePrice <= bp.max).length
            return (
              <Link key={bp.max} href={`/shop/laptops?maxPrice=${bp.max}`} className="group">
                <Card className="hover:border-accent/50 transition-all">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-accent">{bp.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{count} laptops available</div>
                    <div className="text-[11px] text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Browse →</div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// BRAND SHOWCASE
// ============================================================
export function BrandSection({ brands }: { brands: Brand[] }) {
  const active = brands.filter(b => b._count.products > 0)
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Shop by Brand</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Trusted brands, genuine products</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {active.map(b => (
            <Link key={b.id} href={`/brand/${b.slug}`} className="group">
              <Card className="hover:border-accent/50 hover:shadow-sm transition-all">
                <CardContent className="p-3 text-center">
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors">{b.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{b._count.products} items</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// SERVICES SECTION
// ============================================================
export function ServicesSection({ services }: { services: ServiceItem[] }) {
  const grouped = services.reduce((acc, s) => {
    const type = s.serviceType || 'OTHER'
    if (!acc[type]) acc[type] = []
    acc[type].push(s)
    return acc
  }, {} as Record<string, ServiceItem[]>)

  const typeLabels: Record<string, string> = { REPAIR: 'Repairs', UPGRADE: 'Upgrades', INSTALLATION: 'Installation', RECOVERY: 'Recovery', SUPPORT: 'Support' }

  return (
    <section className="py-8 md:py-12 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Services</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Professional repair, upgrade and setup services</p>
        </div>
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-accent" />
                {typeLabels[type] || type}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {items.map(s => (
                  <Card key={s.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.duration || 'Contact for details'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatPrice(s.basePrice)}</div>
                        <div className="text-[10px] text-muted-foreground">from</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FOOTER
// ============================================================
export function BigmanFooter({ categories }: { categories: CategoryNode[] }) {
  const mainCats = categories.filter(c => !c.parentId)
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">B</span>
              </div>
              <div>
                <div className="font-bold">BIGMAN</div>
                <div className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Computers</div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4 max-w-sm">
              Nairobi&apos;s trusted technology retailer. New and refurbished laptops, desktops, gaming, parts, accessories and professional services.
            </p>
            <div className="space-y-1.5 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Rahimtulla Trust Building, Moi Avenue, Nairobi</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +254 722 450 610</div>
              <div className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp Available</div>
              <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Mon-Sat: 8am-6pm</div>
            </div>
          </div>

          {/* Category columns */}
          {mainCats.slice(0, 9).reduce((acc: any[], cat, i) => {
            const colIdx = Math.floor(i / 3)
            if (!acc[colIdx]) acc[colIdx] = { title: '', links: [] as { name: string; slug: string }[] }
            if (i % 3 === 0) acc[colIdx].title = cat.name
            acc[colIdx].links.push({ name: cat.name, slug: cat.slug })
            return acc
          }, []).map((col: any, i: number) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-3">{col.title || 'Categories'}</h4>
              <ul className="space-y-1.5">
                {col.links.map((link: any) => (
                  <li key={link.slug}>
                    <Link href={`/shop/${link.slug}`} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-primary-foreground/10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <div>© {new Date().getFullYear()} Bigman Computers. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
            <Link href="/returns" className="hover:text-primary-foreground transition-colors">Returns & Warranty</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// COMPARE BAR
// ============================================================
export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useStore()
  if (compareList.length === 0) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-2xl p-3 flex items-center gap-3 max-w-2xl">
      <span className="text-xs text-muted-foreground whitespace-nowrap">Comparing ({compareList.length}/4):</span>
      <div className="flex-1 flex gap-2 overflow-x-auto">
        {compareList.map(item => (
          <div key={item.productId} className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 shrink-0">
            <span className="text-xs font-medium max-w-[120px] truncate">{item.name}</span>
            <button onClick={() => removeFromCompare(item.productId)} className="text-muted-foreground hover:text-foreground">
              <span className="text-xs">✕</span>
            </button>
          </div>
        ))}
      </div>
      <Button size="sm" className="h-7 text-xs">Compare Now</Button>
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearCompare}>Clear</Button>
    </div>
  )
}

// ============================================================
// MOBILE BOTTOM NAV
// ============================================================
export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="grid grid-cols-5 h-14">
        {[
          { icon: Home, label: 'Home', href: '/' },
          { icon: SlidersHorizontal, label: 'Categories', href: '#' },
          { icon: Search, label: 'Search', href: '#' },
          { icon: ShoppingCart, label: 'Cart', href: '#' },
          { icon: User, label: 'Account', href: '#' },
        ].map(item => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground">
            <item.icon className="h-4.5 w-4.5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
