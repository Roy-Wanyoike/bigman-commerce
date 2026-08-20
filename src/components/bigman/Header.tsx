'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, Heart, Menu, X, ChevronDown, ChevronRight,
  Phone, MessageCircle, User, Building2, Gamepad2, Wrench,
  Laptop, Monitor, Printer, Mouse, Cpu, HardDrive, Wifi, Zap, Code,
  MapPin, Truck, Shield, CreditCard, Percent, RotateCcw, MemoryStick,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import type { CategoryNode } from './types'
import { cn } from '@/lib/utils'

const iconMap: Record<string, any> = {
  Laptop, Monitor, Gamepad2, Apple: Building2, Server: Building2, Printer, Mouse,
  Wrench, Cpu, HardDrive, MemoryStick, Wifi, Zap, Code, Percent, RotateCcw, Building2,
}
function getIcon(name: string) { return iconMap[name] || Laptop }

/* Main nav items for the top-level bar */
const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Gaming', href: '/gaming' },
  { label: 'Refurbished', href: '/refurbished' },
  { label: 'Deals', href: '/deals' },
  { label: 'Business', href: '/business' },
  { label: 'Services', href: '/services' },
]

interface HeaderProps { categories: CategoryNode[] }

export default function Header({ categories }: HeaderProps) {
  const [megaOpen, setMegaOpen] = useState<string | null>(null)
  const router = useRouter()
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const megaTimeout = useRef<NodeJS.Timeout>()
  const searchRef = useRef<HTMLDivElement>(null)
  const { cartCount, wishlist, mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen } = useStore()

  const handleMegaEnter = useCallback((slug: string) => {
    clearTimeout(megaTimeout.current)
    setMegaOpen(slug)
  }, [])
  const handleMegaLeave = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(null), 200)
  }, [])

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

  const activeMega = categories.find(c => c.slug === megaOpen)

  return (
    <header className="sticky top-0 z-50 bg-background">
      {/* ── Top Utility Bar ── */}
      <div className="hidden lg:block border-b border-border/60 bg-primary">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-[11px] text-primary-foreground/70">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Nairobi Showroom</span>
            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Kenya-wide Delivery</span>
            <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> M-Pesa Accepted</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Warranty Available</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+254722450610" className="hover:text-primary-foreground transition-colors">+254 722 450 610</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Track Order</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="border-b border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4">
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
            <div className="hidden md:flex flex-1 max-w-2xl relative" ref={searchRef}>
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
                  {searchResults.products?.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">Products</div>
                      {searchResults.products.slice(0, 6).map((p: any) => (
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
                      {searchResults.products.length > 6 && (
                        <Link href={`/search?q=${encodeURIComponent(searchQ)}`} className="block text-center text-xs font-medium text-accent hover:underline py-2 mt-1" onClick={() => setSearchResults(null)}>
                          View all results →
                        </Link>
                      )}
                    </div>
                  )}
                  {searchResults.categories?.length > 0 && (
                    <div className="p-2 border-t border-border/50">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">Categories</div>
                      {searchResults.categories.slice(0, 5).map((c: any) => (
                        <Link key={c.id} href={`/shop/${c.slug}`} className="flex items-center justify-between px-2.5 py-1.5 text-sm hover:bg-accent/5 rounded-md transition-colors"
                          onClick={() => setSearchResults(null)}>
                          <span>{c.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  )}
                  {(!searchResults.products?.length && !searchResults.categories?.length) && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No results for &quot;{searchQ}&quot;</p>
                      <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse categories</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-0.5">
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
        <div className="md:hidden border-b border-border bg-background px-4 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9 h-10 rounded-lg" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && searchQ.trim()) { setSearchOpen(false); router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`) } }}
              autoFocus />
          </div>
        </div>
      )}

      {/* ── Desktop Navigation Bar ── */}
      <nav className="hidden lg:block border-b border-border/60 bg-background" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0 h-10">
            {categories.filter(c => c.showInNav).map(cat => {
              const Icon = getIcon(cat.navIcon || '')
              return (
                <li key={cat.id} className="relative"
                  onMouseEnter={() => cat.children.length > 0 && handleMegaEnter(cat.slug)}
                  onMouseLeave={cat.children.length > 0 ? handleMegaLeave : undefined}
                >
                  <Link href={`/shop/${cat.slug}`}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap',
                      'hover:bg-accent/8 hover:text-accent',
                      megaOpen === cat.slug && 'bg-accent/8 text-accent'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.name}
                    {cat.children.length > 0 && <ChevronDown className={cn("h-3 w-3 opacity-40 transition-transform", megaOpen === cat.slug && "rotate-180")} />}
                  </Link>

                  {/* Mega Menu */}
                  {megaOpen === cat.slug && cat.children.length > 0 && (
                    <div className="absolute top-full left-0 bg-popover border border-border rounded-xl shadow-2xl mega-menu-enter z-50 p-5"
                      style={{ width: `${Math.min(cat.navColumns * 180 + 80, 640)}px` }}
                      onMouseEnter={() => handleMegaEnter(cat.slug)}
                      onMouseLeave={handleMegaLeave}
                    >
                      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cat.navColumns}, minmax(0, 1fr))` }}>
                        {cat.children.map(child => (
                          <div key={child.id}>
                            <Link href={`/shop/${cat.slug}/${child.slug}`}
                              className="block text-[13px] font-semibold py-0.5 hover:text-accent transition-colors"
                            >
                              {child.name}
                            </Link>
                            {child.children?.length > 0 && (
                              <div className="mt-1.5 space-y-0.5">
                                {child.children.slice(0, 6).map(gc => (
                                  <Link key={gc.id} href={`/shop/${cat.slug}/${child.slug}/${gc.slug}`}
                                    className="block text-xs text-muted-foreground hover:text-foreground py-0.5 transition-colors"
                                  >
                                    {gc.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                        <Link href={`/shop/${cat.slug}`} className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                          View all {cat.name.toLowerCase()} <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
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
        {navLinks.slice(0, 6).map(link => (
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
        <a href="https://wa.me/254722450610" className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
        <a href="tel:+254722450610" className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
          <Phone className="h-4 w-4" /> Call Us
        </a>
      </div>
    </div>
  )
}
