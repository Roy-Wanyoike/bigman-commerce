'use client'

import { useState } from 'react'
import { Percent, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProductCard from '@/components/bigman/ProductCard'
import type { Product } from '@/components/bigman/types'

interface Props { products: Product[] }

export default function DealsClient({ products }: Props) {
  const [sortBy, setSortBy] = useState('savings')

  let sorted = [...products]
  if (sortBy === 'price-asc') sorted.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice))
  else if (sortBy === 'price-desc') sorted.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice))
  else if (sortBy === 'savings') sorted.sort((a, b) => {
    const aDisc = a.compareAtPrice && a.salePrice ? a.compareAtPrice - a.salePrice : 0
    const bDisc = b.compareAtPrice && b.salePrice ? b.compareAtPrice - b.salePrice : 0
    return bDisc - aDisc
  })

  return (
    <main className="flex-1">
      {/* Deals hero */}
      <section className="bg-gradient-to-b from-orange-50/80 to-background border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-semibold tracking-wider mb-3">DEALS</Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Today&apos;s Best Deals</h1>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Genuine offers on quality products. No fake countdowns — just real savings on technology you need.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Deals ({products.length})</h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-44 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Biggest Savings</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {sorted.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No deals available right now</p>
              <p className="text-sm mt-1">Check back soon for new offers</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}