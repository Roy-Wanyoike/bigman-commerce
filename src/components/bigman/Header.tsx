'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, Heart, Menu, X, ChevronDown, ChevronRight,
  Phone, MessageCircle, User, Building2, Gamepad2, Wrench,
  Laptop, Monitor, Printer, Mouse, Cpu, HardDrive, Wifi, Zap, Code,
  MapPin, Truck, Shield, CreditCard, Percent, RotateCcw, MemoryStick,
  Store, Headphones, Keyboard, Cable, Box, Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import type { CategoryNode } from './types'
import { cn } from '@/lib/utils'
import { WHATSAPP_URL, TEL_LINK, PHONE_DISPLAY } from '@/lib/constants'

const iconMap: Record<string, LucideIcon> = {
  Laptop, Monitor, Gamepad2, Apple: Building2, Server: Building2, Printer, Mouse,
  Wrench, Cpu, HardDrive, MemoryStick, Wifi, Zap, Code, Percent, RotateCcw, Building2,
  Headphones, Keyboard, Cable, Box, Package,
}
function getIcon(name: string) { return iconMap[name] || Laptop }

/* Static main nav items – only Shop gets a mega menu */
const mainNavItems = [
  { label: 'Shop', href: '/shop', hasMega: true },
  { label: 'Gaming', href: '/gaming' },
  { label: 'Refurbished', href: '/refurbished' },
  { label: 'Deals', href: '/deals' },
  { label: 'Services', href: '/services' },
  { label: 'Business', href: '/business' },
]

/* Fallback nav links used in the mobile drawer quick-links grid */
const mobileQuickLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Gaming', href: '/gaming' },
  { label: 'Refurbished', href: '/refurbished' },
  { label: 'Deals', href: '/deals' },
  { label: 'Services', href: '/services' },
  { label: 'Business', href: '/business' },
]

/* Column definitions for the Shop mega menu */
type MegaColumn = { title: string; icon: LucideIcon; keywords: string[] }
const megaColumns: MegaColumn[] = [
  { title: 'Computers', icon: Laptop, keywords: ['laptop', 'desktop', 'all-in-one', 'mini-pc', 'server', 'workstation', 'monitor', 'printer', 'apple', 'macbook', 'imac'] },
  { title: 'Components', icon: Cpu, keywords: ['cpu', 'processor', 'ram', 'memory', 'storage', 'ssd', 'hdd', 'hard-drive', 'harddrive', 'gpu', 'graphics-card', 'motherboard', 'power-supply', 'psu', 'case', 'cooling', 'fan'] },
  { title: 'Accessories', icon: Mouse, keywords: ['mouse', 'keyboard', 'headset', 'headphone', 'speaker', 'webcam', 'bag', 'adapter', 'charger', 'battery', 'dock', 'hub', 'cable', 'display', 'stand', 'chair'] },
  { title: 'Connectivity', icon: Wifi, keywords: ['network', 'router', 'switch', 'modem', 'wifi', 'wireless', 'bluetooth', 'antenna', 'extender', 'access-point', 'nas', 'ups'] },
]

/** Classify a category into a mega menu column based on slug/name keywords */
function classifyCategory(cat: CategoryNode): number {
  const haystack = `${cat.slug} ${cat.name} ${cat.navIcon || ''}`.toLowerCase()
  for (let i = 0; i < megaColumns.length; i++) {
    if (megaColumns[i].keywords.some(kw => haystack.includes(kw))) return i
  }
  return -1 // unclassified
}

interface HeaderProps { categories?: CategoryNode[] }

export default function Header({ categories: propCategories }: HeaderProps) {
  const [fetchedCategories, setFetchedCategories] = useState<CategoryNode[] | null>(null)
  const categories = propCategories && propCategories.length > 0 ? propCategories : (fetchedCategories || [])

  useEffect(() => {
    if (propCategories && propCategories.length > 0) return
    fetch('/api/categories').then(r => r.json()).then(data => {
      setFetchedCategories(data.categories || [])
    }).catch(() => {})
  }, [(propCategories?.length ?? 0)])
  const [shopMegaOpen, setShopMegaOpen] = useState(false)
  const router = useRouter()
  const [searchQ, setSearchQ] = useState('')
  interface SearchResults {
    products?: { id: string; name: string; slug: string; basePrice: number; condition: string }[]
    categories?: { id: string; name: string; slug: string }[]
  }

  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searching, setSearching] = useState(false)
  const megaTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const searchRef = useRef<HTMLDivElement>(null)
  const { cartCount, wishlist, mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen } = useStore()

  const handleMegaEnter = useCallback(() => {
    clearTimeout(megaTimeout.current)
    setShopMegaOpen(true)
  }, [])
  const handleMegaLeave = useCallback(() => {
    megaTimeout.current = setTimeout(() => setShopMegaOpen(false), 200)
  }, [])

  /* Organise categories into 4 mega-menu columns */
  const megaMenuColumns = useMemo(() => {
    const navCats = categories.filter(c => c.showInNav)
    const buckets: CategoryNode[][] = [[], [], [], []]
    const unclassified: CategoryNode[] = []

    for (const cat of navCats) {
      const col = classifyCategory(cat)
      if (col >= 0) {
        buckets[col].push(cat)
      } else {
        unclassified.push(cat)
      }
    }

    // Distribute unclassified round-robin to balance columns
    let idx = 0
    for (const cat of unclassified) {
      buckets[idx % 4].push(cat)
      idx++
    }

    return buckets
  }, [categories])

  useEffect(() => {
    if (!searchQ || searchQ.length < 2) return () => {}
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`)
        const data = await res.json()
        setSearchResults(data)
      } catch { /* ignore */ }
      setSearching(false)
    }, 250)
    return () => clearTimeout(t)
  }, [searchQ])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchResults(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background">
      {/* ── Top Utility Bar ── */}
      <div className="hidden lg:block border-b border-border/60 bg-primary">
        <div className="container-main flex items-center justify-between h-8 text-[11px] text-primary-foreground/70">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Nairobi Showroom</span>
            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Kenya-wide Delivery</span>
            <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> M-Pesa Accepted</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Warranty Available</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={TEL_LINK} className="hover:text-primary-foreground transition-colors">{PHONE_DISPLAY}</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Track Order</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="border-b border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
        <div className="container-main">
          <div className="flex items-center justify-between h-14 lg:h-16 gap-4">
            {/* Mobile hamburger + Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <MobileCategoryDrawer categories={categories} />
                  </SheetContent>
                </Sheet>
              </div>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-extrabold text-sm tracking-tight">B</span>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-[15px] leading-tight tracking-tight">BIGMAN</div>
                  <div className="text-[9px] text-muted-foreground leading-tight tracking-[0.12em] uppercase font-medium">Computers</div>
                </div>
              </Link>
            </div>

            {/* ── Search Bar (PRIMARY NAV ELEMENT) ── */}
            <div className="hidden md:flex flex-1 max-w-2xl min-w-0 relative" ref={searchRef}>
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-foreground transition-colors" />
                <Input
                  placeholder="Search laptops, SSDs, gaming gear..."
                  className="pl-10 pr-4 h-10 bg-secondary/40 border-border/60 rounded-lg text-sm focus:bg-background focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onFocus={() => searchQ.length >= 2 && setSearchResults(searchResults)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (searchQ.trim()) { setSearchResults(null); router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`) }
                    }
                    if (e.key === 'Escape') setSearchResults(null)
                  }}
                  aria-label="Search products"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {/* Search dropdown */}
              {searchResults && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-2xl mega-menu-enter z-50 max-h-[420px] overflow-y-auto" role="listbox">
                  {(searchResults.products?.length ?? 0) > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">Products</div>
                      {searchResults.products!.slice(0, 6).map((p) => (
                        <Link key={p.id} href={`/product/${p.slug}`} className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-accent/5 transition-colors"
                          onClick={() => setSearchResults(null)}>
                          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                            <Laptop className="h-4.5 w-4.5 text-muted-foreground/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{formatPrice(p.basePrice)}</div>
                          </div>
                          {p.condition === 'REFURBISHED' && <Badge variant="outline" className="text-[9px] h-5 shrink-0 border-amber-300 text-amber-700">Refurb</Badge>}
                        </Link>
                      ))}
                      {searchResults.products!.length > 6 && (
                        <Link href={`/search?q=${encodeURIComponent(searchQ)}`} className="block text-center text-xs font-medium text-accent hover:underline py-2 mt-1" onClick={() => setSearchResults(null)}>
                          View all results →
                        </Link>
                      )}
                    </div>
                  )}
                  {(searchResults.categories?.length ?? 0) > 0 && (
                    <div className="p-2 border-t border-border/50">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">Categories</div>
                      {searchResults.categories!.slice(0, 5).map((c) => (
                        <Link key={c.id} href={`/shop/${c.slug}`} className="flex items-center justify-between px-2.5 py-1.5 text-sm hover:bg-accent/5 rounded-md transition-colors"
                          onClick={() => setSearchResults(null)}>
                          <span>{c.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  )}
                  {(!(searchResults.products?.length) && !(searchResults.categories?.length)) && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No results for &quot;{searchQ}&quot;</p>
                      <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse categories</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/account">
                <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                  <Heart className="h-[18px] w-[18px]" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-semibold">
                      {wishlist.length > 9 ? '9+' : wishlist.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  {cartCount() > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-semibold">
                      {cartCount() > 9 ? '9+' : cartCount()}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/account" className="hidden lg:block">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="h-[18px] w-[18px]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Search Bar ── */}
      {searchOpen && (
        <div className="md:hidden border-b border-border bg-background py-2.5">
          <div className="container-main min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9 h-10 rounded-lg" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQ.trim()) { setSearchOpen(false); router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`) } }}
                autoFocus />
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Navigation Bar ── */}
      <nav className="hidden lg:block border-b border-border/60 bg-background" aria-label="Main navigation">
        <div className="container-main">
          <ul className="flex items-center gap-0 h-10 overflow-hidden">
            {mainNavItems.map((item) => {
              if (item.hasMega) {
                return (
                  <li key={item.label} className="relative"
                    onMouseEnter={handleMegaEnter}
                    onMouseLeave={handleMegaLeave}
                  >
                    <Link href={item.href}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap min-w-0',
                        'hover:bg-accent/8 hover:text-accent',
                        shopMegaOpen && 'bg-accent/8 text-accent'
                      )}
                    >
                      <Store className="h-3.5 w-3.5" />
                      {item.label}
                      <ChevronDown className={cn("h-3 w-3 opacity-40 transition-transform", shopMegaOpen && "rotate-180")} />
                    </Link>

                    {/* Shop Mega Menu */}
                    {shopMegaOpen && (
                      <div
                        className="absolute top-full left-0 min-w-[600px] max-w-[800px] bg-popover border border-border rounded-xl shadow-2xl mega-menu-enter z-50 p-5 overflow-hidden"
                        onMouseEnter={handleMegaEnter}
                        onMouseLeave={handleMegaLeave}
                      >
                        <div className="grid grid-cols-4 gap-5">
                          {megaMenuColumns.map((bucket, colIdx) => {
                            const ColIcon = megaColumns[colIdx].icon
                            return (
                              <div key={megaColumns[colIdx].title}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <ColIcon className="h-3.5 w-3.5 text-accent" />
                                  <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {megaColumns[colIdx].title}
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  {bucket.map(cat => {
                                    const CatIcon = getIcon(cat.navIcon || '')
                                    return (
                                      <div key={cat.id}>
                                        <Link href={`/shop/${cat.slug}`}
                                          className="flex items-center gap-1.5 text-[13px] font-medium py-0.5 hover:text-accent transition-colors"
                                        >
                                          <CatIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                                          {cat.name}
                                        </Link>
                                        {cat.children?.length > 0 && (
                                          <div className="ml-5 mt-0.5 space-y-0.5">
                                            {cat.children.slice(0, 5).map(child => (
                                              <Link key={child.id} href={`/shop/${cat.slug}/${child.slug}`}
                                                className="block text-xs text-muted-foreground hover:text-foreground py-0.5 transition-colors truncate"
                                              >
                                                {child.name}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <Link href="/shop" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                            View All Products <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>
                )
              }

              // Simple nav link (no mega menu)
              return (
                <li key={item.label} className="min-w-0">
                  <Link href={item.href}
                    className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap hover:bg-accent/8 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </header>
  )
}

/* ============================================================
   MOBILE CATEGORY DRAWER
   ============================================================ */
function MobileCategoryDrawer({ categories }: { categories: CategoryNode[] }) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Drawer header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-extrabold text-sm">B</span>
          </div>
          <div>
            <div className="font-bold text-[15px]">BIGMAN</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-[0.12em] font-medium">Computers</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-px bg-border mx-3 mt-3 rounded-lg overflow-hidden">
        {mobileQuickLinks.slice(0, 6).map(link => (
          <Link key={link.label} href={link.href}
            className="bg-card text-center py-2.5 text-xs font-medium hover:bg-secondary transition-colors"
            onClick={() => useStore.getState().setMobileMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Category tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {categories.filter(c => c.showInNav).map(cat => {
          const Icon = getIcon(cat.navIcon || '')
          const isOpen = openCats.has(cat.id)
          return (
            <div key={cat.id}>
              <button
                onClick={() => cat.children.length > 0 ? toggle(cat.id) : null}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-secondary/60 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {cat.name}
                </span>
                {cat.children.length > 0 && (
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                )}
              </button>
              {isOpen && cat.children.length > 0 && (
                <div className="bg-secondary/30 pl-10 pr-4 pb-2">
                  {cat.children.map(child => (
                    <Link key={child.id} href={`/shop/${cat.slug}/${child.slug}`}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => useStore.getState().setMobileMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                  <Link href={`/shop/${cat.slug}`} className="block py-2 text-xs font-semibold text-accent hover:underline"
                    onClick={() => useStore.getState().setMobileMenuOpen(false)}
                  >
                    View all →
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Contact footer */}
      <div className="border-t border-border p-4 space-y-2">
        <a href={WHATSAPP_URL} className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
        <a href={TEL_LINK} className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
          <Phone className="h-4 w-4" /> Call Us
        </a>
      </div>
    </div>
  )
}