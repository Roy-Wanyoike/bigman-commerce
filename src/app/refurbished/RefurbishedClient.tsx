'use client'

import { useState } from 'react'
import { RotateCcw, ShieldCheck, CheckCircle2, ArrowUpDown, SlidersHorizontal, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProductCard from '@/components/bigman/ProductCard'
import type { Product } from '@/components/bigman/types'

interface Props { products: Product[] }

const gradeDescriptions: Record<string, string> = {
  A: 'Excellent condition. Minimal signs of use.',
  B: 'Good condition. Light cosmetic wear.',
  C: 'Fair condition. Visible wear but fully functional.',
}

const inspectionChecks = [
  'Display tested', 'Keyboard tested', 'Ports tested',
  'Storage tested', 'Battery tested', 'Wi-Fi tested',
]

export default function RefurbishedClient({ products }: Props) {
  const [sortBy, setSortBy] = useState('sortOrder')

  let sorted = [...products]
  if (sortBy === 'price-asc') sorted.sort((a, b) => a.basePrice - b.basePrice)
  else if (sortBy === 'price-desc') sorted.sort((a, b) => b.basePrice - a.basePrice)

  return (
    <main className="flex-1">
      {/* Refurbished hero */}
      <section className="bg-gradient-to-b from-amber-50 to-background">
        <div className="container-main py-12 md:py-16">
          <div className="max-w-xl">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-semibold tracking-wider mb-3">REFURBISHED STORE</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Quality Tested, Warrantied Devices</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Every refurbished device is inspected, graded and backed by a Bigman warranty.
              Same performance, better price.
            </p>
            {/* Inspection checklist */}
            <Card className="border-amber-200/60 bg-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-sm">Bigman Inspected</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {inspectionChecks.map(check => (
                    <div key={check} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {check}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Grade legend */}
      <section className="border-b border-border/60 bg-card">
        <div className="container-main py-4">
          <div className="flex items-center gap-6 text-xs overflow-x-auto">
            <span className="font-semibold text-muted-foreground shrink-0">Grades:</span>
            {Object.entries(gradeDescriptions).map(([grade, desc]) => (
              <div key={grade} className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="border-amber-200 text-amber-700 text-[10px] h-5 px-1.5 font-bold">GRADE {grade}</Badge>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Refurbished Products</h2>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-40 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sortOrder">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 min-w-0">
              {sorted.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Refurbished products coming soon</p>
              <p className="text-sm mt-1">Check back for inspected and warrantied devices</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}