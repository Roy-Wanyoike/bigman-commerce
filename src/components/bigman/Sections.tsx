'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight, SlidersHorizontal, ArrowUpDown, Laptop, Monitor, Gamepad2, Apple, RotateCcw,
  Cpu, Printer, Wrench, HardDrive, Zap, Code, Building2, Home, Phone, MessageCircle, MapPin, Clock,
  Search, ShoppingCart, User, ArrowRight, Shield, Truck, Headphones, CheckCircle2,
  Wifi, MemoryStick,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import ProductCard, { ProductCardSkeleton } from './ProductCard'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import type { Product, CategoryNode, Brand, ServiceItem } from './types'
import { useCases, budgetPages } from './types'
import { cn } from '@/lib/utils'

const catIcons: Record<string, any> = {
  laptops: Laptop, desktops: Monitor, gaming: Gamepad2, 'mac-apple': Apple,
  workstations: Cpu, monitors: Monitor, printers: Printer, accessories: Wrench,
  parts: Wrench, hardware: Cpu, storage: HardDrive, 'ram-memory': MemoryStick,
  networking: Wifi, power: Zap, software: Code, 'bags-protection': Laptop,
  'office-technology': Building2, refurbished: RotateCcw, deals: Cpu,
  services: Wrench, business: Building2, 'cables-adapters': Zap,
}

// ============================================================
// TRUST STRIP — Premium trust signals
// ============================================================
const trustItems = [
  { icon: Shield, label: 'Bigman Inspected', desc: 'Every device tested & verified' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Nairobi same-day, countrywide' },
  { icon: Zap, label: 'M-Pesa Accepted', desc: 'Pay how you prefer' },
  { icon: Headphones, label: 'Expert Support', desc: 'In-store repair & assistance' },
]

export function TrustStrip() {
  return (
    <section className="border-b border-border/60 bg-card">
      <div className="container-main py-4 md:py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trustItems.map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent/8 flex items-center justify-center shrink-0">
                <item.icon className="h-[18px] w-[18px] text-accent" />
              </div>
              <div>
                <div className="text-[13px] font-semibold">{item.label}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FEATURED CATEGORIES — Visual category grid
// ============================================================
export function FeaturedCategories({ categories }: { categories: CategoryNode[] }) {
  const featured = categories.filter(c => c.isFeatured || ['laptops', 'gaming', 'desktops', 'accessories', 'parts', 'hardware', 'storage', 'monitors'].includes(c.slug))
  return (
    <section className="py-10 md:py-14">
      <div className="container-main">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Find exactly what you need</p>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
            All categories <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2.5 min-w-0">
          {featured.slice(0, 8).map(cat => {
            const Icon = catIcons[cat.slug] || Laptop
            const childCount = cat.children.length
            return (
              <Link key={cat.id} href={`/shop/${cat.slug}`} className="group">
                <Card className="hover:border-accent/40 hover:shadow-md transition-all h-full border-border/60">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="font-medium text-xs leading-tight">{cat.name}</div>
                    {childCount > 0 && (
                      <div className="text-[10px] text-muted-foreground">{childCount} sub</div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        <Link href="/shop" className="sm:hidden flex items-center justify-center gap-1 text-sm font-medium text-accent mt-4">
          View all categories <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}

// ============================================================
// PRODUCT SECTION — Reusable (Featured / Deals / Gaming / Refurbished)
// ============================================================
interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref: string
  accentColor?: string
  surface?: 'default' | 'gaming'
}

export function ProductSection({ title, subtitle, products, viewAllHref, accentColor, surface = 'default' }: ProductSectionProps) {
  const display = products.slice(0, 8)
  if (display.length === 0) return null

  return (
    <section className={cn(
      'py-10 md:py-14',
      surface === 'gaming' ? 'gaming-surface' : '',
    )}>
      <div className="container-main">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-3">
            {accentColor && <div className={cn('h-8 w-1 rounded-full', accentColor)} />}
            <div>
              <h2 className={cn('text-xl md:text-2xl font-bold tracking-tight', surface === 'gaming' && 'text-white')}>{title}</h2>
              {subtitle && <p className={cn('text-sm mt-0.5', surface === 'gaming' ? 'text-white/50' : 'text-muted-foreground')}>{subtitle}</p>}
            </div>
          </div>
          <Link href={viewAllHref} className={cn('flex items-center gap-1 text-sm font-medium transition-colors',
            surface === 'gaming' ? 'text-accent hover:text-accent/80' : 'text-accent hover:text-accent/80'
          )}>
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 min-w-0">
          {display.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// LAPTOP FINDER — Guided product discovery
// ============================================================
export function LaptopFinder({ products }: { products: Product[] }) {
  const laptops = products.filter(p => p.categories.some(c => ['laptops', 'gaming-laptops'].includes(c.category.slug)))
  if (laptops.length === 0) return null

  return (
    <section className="py-10 md:py-14 bg-secondary/30">
      <div className="container-main">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Not Sure What to Buy?</h2>
          <p className="text-sm text-muted-foreground mt-1.5">We&apos;ll help you find the right laptop for your needs and budget.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {useCases.slice(0, 3).map(uc => (
            <Link key={uc.slug} href={`/shop/laptops?useCase=${uc.slug}`} className="group">
              <Card className="hover:border-accent/40 hover:shadow-md transition-all border-border/60">
                <CardContent className="p-5 text-center">
                  <div className="h-12 w-12 rounded-xl bg-accent/8 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/15 transition-colors">
                    <uc.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="font-semibold text-sm mb-1">{uc.name}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{uc.desc}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/shop/laptops" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
            Browse all laptops →
          </Link>
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
  else if (sortBy === 'newest') filtered.sort((a, b) => (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) - (a.publishedAt ? new Date(a.publishedAt).getTime() : 0))

  const topCategories = categories.filter(c => !c.parentId)

  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container-main">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">All Products</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} products available</p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="min-w-0 flex flex-wrap items-center gap-2 mb-6 p-3 bg-card rounded-xl border border-border/60">
          <div className="overflow-x-auto flex-nowrap flex items-center gap-2 min-w-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
          <Button variant={activeCat === null ? 'default' : 'outline'} size="sm" className="h-7 text-xs rounded-md shrink-0" onClick={() => setActiveCat(null)}>All</Button>
          {topCategories.slice(0, 10).map(c => (
            <Button key={c.id} variant={activeCat === c.slug ? 'default' : 'outline'} size="sm" className="h-7 text-xs rounded-md shrink-0"
              onClick={() => setActiveCat(activeCat === c.slug ? null : c.slug)}>
              {c.name}
            </Button>
          ))}
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Select value={conditionFilter || 'all'} onValueChange={v => setConditionFilter(v === 'all' ? null : v)}>
              <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="REFURBISHED">Refurbished</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-7 w-36 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
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
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">No products found</p>
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
    <section className="py-10 md:py-14">
      <div className="container-main">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Shop by Use Case</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Curated recommendations for every need</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {useCases.map(uc => {
            const Icon = uc.icon
            return (
              <Link key={uc.slug} href={`/shop/${uc.slug}`} className="group">
                <Card className="hover:border-accent/40 hover:shadow-md transition-all h-full border-border/60">
                  <CardContent className="p-4 md:p-5 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{uc.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{uc.desc}</div>
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
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container-main">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Laptops by Budget</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Find the right laptop for your budget</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {budgetPages.map(bp => {
            const count = laptops.filter(p => p.basePrice <= bp.max).length
            return (
              <Link key={bp.max} href={`/shop/laptops?maxPrice=${bp.max}`} className="group">
                <Card className="hover:border-accent/40 transition-all border-border/60">
                  <CardContent className="p-4 text-center">
                    <div className="price-display text-xl md:text-2xl font-bold text-accent">{bp.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-1.5">{count} laptops available</div>
                    <div className="text-[11px] text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center justify-center gap-0.5">
                      Browse <ChevronRight className="h-3 w-3" />
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
// BRAND SHOWCASE
// ============================================================
export function BrandSection({ brands }: { brands: Brand[] }) {
  const active = brands.filter(b => (b._count?.products ?? 0) > 0)
  if (active.length === 0) return null
  return (
    <section className="py-10 md:py-14">
      <div className="container-main">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Shop by Brand</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Trusted brands, genuine products</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 min-w-0">
          {active.map(b => (
            <Link key={b.id} href={`/brand/${b.slug}`} className="group">
              <Card className="hover:border-accent/40 hover:shadow-sm transition-all border-border/60">
                <CardContent className="p-3 text-center">
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-base font-bold text-muted-foreground group-hover:text-foreground transition-colors tracking-tight">{b.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{(b._count?.products ?? 0)} items</div>
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
  if (services.length === 0) return null
  const grouped = services.reduce((acc, s) => {
    const type = s.serviceType || 'OTHER'
    if (!acc[type]) acc[type] = []
    acc[type].push(s)
    return acc
  }, {} as Record<string, ServiceItem[]>)

  const typeLabels: Record<string, string> = { REPAIR: 'Repairs', UPGRADE: 'Upgrades', INSTALLATION: 'Installation', RECOVERY: 'Recovery', SUPPORT: 'Support' }

  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container-main">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Services</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Professional repair, upgrade and setup services</p>
          </div>
          <Link href="/services" className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
            All services <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-accent" />
                {typeLabels[type] || type}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {items.map(s => (
                  <Card key={s.id} className="hover:shadow-sm transition-all border-border/60">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{s.duration || 'Contact for details'}</div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-sm font-bold price-display">{formatPrice(s.basePrice)}</div>
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
// STORE LOCATION SECTION
// ============================================================
export function StoreLocation() {
  return (
    <section className="py-10 md:py-14">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Info */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Visit Bigman</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Come see our full range of laptops, desktops, gaming gear and accessories in person.
              Our expert team is ready to help you find the right technology.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-accent mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Rahimtulla Trust Building</div>
                  <div className="text-sm text-muted-foreground">Moi Avenue, Nairobi, Kenya</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-accent shrink-0" />
                <div className="text-sm">+254 722 450 610</div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4.5 w-4.5 text-accent shrink-0" />
                <div className="text-sm">WhatsApp Available</div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4.5 w-4.5 text-accent shrink-0" />
                <div className="text-sm">Mon - Sat: 8:00 AM - 6:00 PM</div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <a href="https://wa.me/254722450610">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp Us
                </Button>
              </a>
              <a href="tel:+254722450610">
                <Button variant="outline" className="font-medium">
                  <Phone className="h-4 w-4 mr-1.5" /> Call Now
                </Button>
              </a>
            </div>
          </div>

          {/* Map placeholder */}
          <Card className="border-border/60 overflow-hidden">
            <div className="aspect-[4/3] bg-secondary/40 flex items-center justify-center relative">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-accent/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Moi Avenue, Nairobi</p>
                <p className="text-xs text-muted-foreground mt-1">Rahimtulla Trust Building</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FOOTER — Rich, structured footer
// ============================================================
export function BigmanFooter({ categories }: { categories: CategoryNode[] }) {
  const mainCats = categories.filter(c => !c.parentId)
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 min-w-0">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-foreground rounded-lg flex items-center justify-center">
                <span className="text-primary font-extrabold text-sm">B</span>
              </div>
              <div>
                <div className="font-bold text-[15px] tracking-tight">BIGMAN</div>
                <div className="text-[9px] text-primary-foreground/50 uppercase tracking-[0.12em] font-medium">Computers</div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/55 leading-relaxed mb-5 max-w-xs">
              Nairobi&apos;s trusted technology retailer. New and refurbished laptops, desktops, gaming, parts, accessories and professional services.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> Rahimtulla Trust Building, Moi Avenue</div>
              <div className="flex items-center gap-2.5"><Phone className="h-3.5 w-3.5 shrink-0" /> +254 722 450 610</div>
              <div className="flex items-center gap-2.5"><Clock className="h-3.5 w-3.5 shrink-0" /> Mon-Sat: 8am-6pm</div>
            </div>
          </div>

          {/* Category link columns */}
          {mainCats.slice(0, 9).reduce((acc: any[], cat, i) => {
            const colIdx = Math.floor(i / 3)
            if (!acc[colIdx]) acc[colIdx] = { title: '', links: [] as { name: string; slug: string }[] }
            acc[colIdx].title = i % 3 === 0 ? cat.name : ''
            acc[colIdx].links.push({ name: cat.name, slug: cat.slug })
            return acc
          }, []).map((col: any, i: number) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-3">{col.title || 'Categories'}</h4>
              <ul className="space-y-2">
                {col.links.map((link: any) => (
                  <li key={link.slug}>
                    <Link href={`/shop/${link.slug}`} className="text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-primary-foreground/10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/40">
          <div>© {new Date().getFullYear()} Bigman Computers. All rights reserved.</div>
          <div className="flex items-center gap-5">
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-2xl p-3 flex items-center gap-3 max-w-2xl min-w-0">
      <span className="text-xs text-muted-foreground whitespace-nowrap font-medium shrink-0">Comparing ({compareList.length}/4):</span>
      <div className="flex-1 flex gap-2 overflow-x-auto min-w-0">
        {compareList.map(item => (
          <div key={item.productId} className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 shrink-0">
            <span className="text-xs font-medium max-w-[120px] truncate">{item.name}</span>
            <button onClick={() => removeFromCompare(item.productId)} className="text-muted-foreground hover:text-foreground" aria-label="Remove from comparison">
              <span className="text-xs">✕</span>
            </button>
          </div>
        ))}
      </div>
      <Link href="/compare">
        <Button size="sm" className="h-7 text-xs rounded-md">Compare Now</Button>
      </Link>
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearCompare}>Clear</Button>
    </div>
  )
}

// ============================================================
// MOBILE BOTTOM NAVIGATION
// ============================================================
export function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border" aria-label="Mobile navigation">
      <div className="grid grid-cols-5 h-14 min-w-0">
        {[
          { icon: Home, label: 'Home', href: '/' },
          { icon: SlidersHorizontal, label: 'Shop', href: '/shop' },
          { icon: Search, label: 'Search', href: '/search' },
          { icon: ShoppingCart, label: 'Cart', href: '/cart' },
          { icon: User, label: 'Account', href: '/account' },
        ].map(item => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
            <item.icon className="h-[18px] w-[18px]" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
