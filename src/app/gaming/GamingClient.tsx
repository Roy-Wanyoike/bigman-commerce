'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Gamepad2, Monitor, Keyboard, Mouse, Headphones, Cpu, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProductCard from '@/components/bigman/ProductCard'
import type { Product } from '@/components/bigman/types'

interface Props { products: Product[] }

const gamingCats = [
  { name: 'Gaming Laptops', icon: Gamepad2, slug: 'gaming-laptops' },
  { name: 'Gaming PCs', icon: Cpu, slug: 'gaming-pcs' },
  { name: 'Monitors', icon: Monitor, slug: 'gaming-monitors' },
  { name: 'Keyboards', icon: Keyboard, slug: 'gaming-keyboards' },
  { name: 'Mice', icon: Mouse, slug: 'gaming-mice' },
  { name: 'Headsets', icon: Headphones, slug: 'gaming-headsets' },
]

export default function GamingClient({ products }: Props) {
  const [sortBy, setSortBy] = useState('sortOrder')
  const [conditionFilter, setConditionFilter] = useState<string | null>(null)

  let filtered = [...products]
  if (conditionFilter) filtered = filtered.filter(p => p.condition === conditionFilter)
  if (sortBy === 'price-asc') filtered.sort((a, b) => a.basePrice - b.basePrice)
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.basePrice - a.basePrice)
  else if (sortBy === 'newest') filtered.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))

  return (
    <main className="flex-1">
      {/* Gaming hero */}
      <section className="gaming-surface relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gaming blur-3xl" />
        </div>
        <div className="relative container-main py-12 md:py-16">
          <div className="max-w-xl">
            <Badge className="bg-gaming/20 text-accent border-gaming/30 text-[10px] font-semibold tracking-wider mb-3">GAMING</Badge>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">Level Up Your Setup</h1>
            <p className="text-sm md:text-base text-white/50 mb-6 leading-relaxed">
              High-performance gaming laptops, PCs, monitors and peripherals. Built for competitive play and immersive experiences.
            </p>
            <Link href="/shop/gaming">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/85 font-semibold">
                Browse All Gaming <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gaming subcategories */}
      <section className="py-8 border-b border-border/60 bg-card">
        <div className="container-main">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gamingCats.map(cat => (
              <Link key={cat.slug} href={`/shop/gaming/${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 hover:border-accent/40 hover:bg-accent/5 transition-all shrink-0">
                <cat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">All Gaming Products</h2>
            <div className="flex items-center gap-2">
              <Select value={conditionFilter || 'all'} onValueChange={v => setConditionFilter(v === 'all' ? null : v)}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-36 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sortOrder">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 min-w-0">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Gaming products coming soon</p>
              <p className="text-sm mt-1">Check back for the latest gaming gear</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
