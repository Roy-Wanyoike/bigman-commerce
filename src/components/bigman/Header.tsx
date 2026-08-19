'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Heart, Menu, X, ChevronDown, Phone, MessageCircle, User, Building2, Gamepad2, Wrench, Percent, RotateCcw, Laptop, Monitor, Printer, Mouse, Cpu, HardDrive, MemoryStick, Wifi, Zap, Code, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import type { CategoryNode } from './types'
import { cn } from '@/lib/utils'

const iconMap: Record<string, any> = { Laptop, Monitor, Gamepad2, Apple: Building2, Server: Building2, Printer, Mouse, Wrench, Cpu, HardDrive, MemoryStick, Wifi, Zap, Code, Briefcase, Percent, RotateCcw, Building2 }

function getIcon(name: string) {
  return iconMap[name] || Laptop
}

interface HeaderProps {
  categories: CategoryNode[]
}

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
    megaTimeout.current = setTimeout(() => setMegaOpen(null), 150)
  }, [])

  // Search with debounce
  useEffect(() => {
    if (!searchQ || searchQ.length < 2) {
      // Reset synchronously is fine for the guard condition
      return () => {}
    }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`)
        const data = await res.json()
        setSearchResults(data)
      } catch { /* ignore */ }
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchQ])

  // Close search on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchResults(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeMega = categories.find(c => c.slug === megaOpen)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="hidden md:block border-b border-border/50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +254 722 450 610</span>
            <span>Rahimtulla Trust Building, Moi Avenue, Nairobi</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Track Order</a>
            <a href="#" className="hover:underline">Support</a>
            <a href="#" className="hover:underline">Business Solutions</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2"><Menu className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                  <SheetTitle className="sr-only">Categories</SheetTitle>
                  <MobileCategoryDrawer categories={categories} />
                </SheetContent>
              </Sheet>
            </div>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-base leading-tight tracking-tight">BIGMAN</div>
                <div className="text-[10px] text-muted-foreground leading-tight tracking-wider uppercase">Computers</div>
              </div>
            </Link>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search laptops, parts, accessories..."
                className="pl-9 pr-4 h-9 bg-secondary/50 border-border/50 focus:bg-background"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onFocus={() => searchQ.length >= 2 && setSearchResults(searchResults)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (searchQ.trim()) { setSearchResults(null); router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`) } } }}
              />
              {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            {searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl mega-menu-enter z-50 max-h-96 overflow-y-auto">
                {searchResults.products?.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">Products</div>
                    {searchResults.products.slice(0, 6).map((p: any) => (
                      <Link key={p.id} href={`/product/${p.slug}`} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors">
                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs"><Laptop className="h-4 w-4 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">KSh {p.basePrice?.toLocaleString()}</div>
                        </div>
                        {p.condition === 'REFURBISHED' && <Badge variant="outline" className="text-[10px] h-5">Refurb</Badge>}
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.categories?.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">Categories</div>
                    {searchResults.categories.map((c: any) => (
                      <Link key={c.id} href={`/shop/${c.slug}`} className="block px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors">{c.name}</Link>
                    ))}
                  </div>
                )}
                {(!searchResults.products?.length && !searchResults.categories?.length) && (
                  <div className="p-4 text-center text-sm text-muted-foreground">No results found for &quot;{searchQ}&quot;</div>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">{wishlist.length}</span>}
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount() > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">{cartCount()}</span>}
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden border-t border-border px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9 h-9" value={searchQ} onChange={e => setSearchQ(e.target.value)} autoFocus />
          </div>
        </div>
      )}

      {/* Desktop navigation with mega menu */}
      <nav className="hidden md:block border-t border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0.5 h-10 overflow-x-auto">
            {categories.filter(c => c.showInNav).map(cat => {
              const Icon = getIcon(cat.navIcon || '')
              return (
                <li key={cat.id} className="relative"
                  onMouseEnter={() => cat.children.length > 0 && handleMegaEnter(cat.slug)}
                  onMouseLeave={cat.children.length > 0 ? handleMegaLeave : undefined}
                >
                  <Link href={`/shop/${cat.slug}`}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap hover:bg-accent hover:text-accent-foreground',
                      megaOpen === cat.slug && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.name}
                    {cat.children.length > 0 && <ChevronDown className="h-3 w-3 opacity-50" />}
                    {cat.isFeatured && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </Link>

                  {/* Mega Menu */}
                  {megaOpen === cat.slug && cat.children.length > 0 && (
                    <div className="absolute top-full left-0 w-[600px] bg-popover border border-border rounded-lg shadow-xl mega-menu-enter z-50 p-4"
                      onMouseEnter={() => handleMegaEnter(cat.slug)}
                      onMouseLeave={handleMegaLeave}
                    >
                      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cat.navColumns}, minmax(0, 1fr))` }}>
                        {cat.children.map(child => (
                          <div key={child.id}>
                            <Link href={`/shop/${cat.slug}/${child.slug}`}
                              className="block text-sm font-medium py-1 hover:text-accent transition-colors"
                            >
                              {child.name}
                            </Link>
                            {child.children?.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {child.children.map(gc => (
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
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Link href={`/shop/${cat.slug}`} className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                          View all {cat.name.toLowerCase()} →
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

// Mobile category drawer with accordion
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
    <div className="py-4">
      <div className="px-4 pb-3 border-b border-border mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <div>
            <div className="font-bold">BIGMAN</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Computers</div>
          </div>
        </div>
      </div>
      <div className="max-h-[calc(100vh-140px)] overflow-y-auto">
        {categories.filter(c => c.showInNav).map(cat => {
          const Icon = getIcon(cat.navIcon || '')
          const isOpen = openCats.has(cat.id)
          return (
            <div key={cat.id} className="border-b border-border/30">
              <button
                onClick={() => cat.children.length > 0 ? toggle(cat.id) : null}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {cat.name}
                </span>
                {cat.children.length > 0 && (
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                )}
              </button>
              {isOpen && cat.children.length > 0 && (
                <div className="bg-muted/30 pl-10 pr-4 pb-2">
                  {cat.children.map(child => (
                    <Link key={child.id} href={`/shop/${cat.slug}/${child.slug}`}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => useStore.getState().setMobileMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                  <Link href={`/shop/${cat.slug}`} className="block py-2 text-xs font-medium text-accent hover:underline"
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
      <div className="mt-4 px-4 space-y-2">
        <a href="https://wa.me/254722450610" className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium">
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
        <a href="tel:+254722450610" className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg text-sm font-medium">
          <Phone className="h-4 w-4" /> Call Us
        </a>
      </div>
    </div>
  )
}