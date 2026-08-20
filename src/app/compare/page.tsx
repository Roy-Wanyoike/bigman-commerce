'use client'

import Link from 'next/link'
import { GitCompareArrows, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import { cn } from '@/lib/utils'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useStore()

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={[]} />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <GitCompareArrows className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h1 className="text-lg font-semibold mb-1">Nothing to compare</h1>
          <p className="text-sm text-muted-foreground mb-6">Add products to compare their specifications side by side.</p>
          <Link href="/shop">
            <Button className="font-medium">Browse Products</Button>
          </Link>
        </main>
        <BigmanFooter categories={[]} />
        <MobileBottomNav />
        <div className="lg:hidden h-14" />
      </div>
    )
  }

  // Gather all spec keys
  const allKeys = new Set<string>()
  compareList.forEach(item => Object.keys(item.specs).forEach(k => allKeys.add(k)))
  const specKeys = Array.from(allKeys)

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Compare Products</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Comparing {compareList.length} product{compareList.length !== 1 ? 's' : ''}</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearCompare} className="text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-4 pr-4">Product</th>
                  {compareList.map(item => (
                    <th key={item.productId} className="text-left pb-4 px-4 min-w-[200px]">
                      <div className="relative">
                        <div className="w-full aspect-[4/3] bg-secondary/40 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-3xl font-bold text-muted-foreground/20">{item.name[0]}</span>
                        </div>
                        <Link href={`/product/${item.slug || item.productId}`} className="text-sm font-semibold hover:text-accent transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.brand}</div>
                        <div className="text-lg font-bold price-display mt-1">{formatPrice(item.price)}</div>
                        <button onClick={() => removeFromCompare(item.productId)} className="absolute top-0 right-0 h-6 w-6 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 transition-colors" aria-label="Remove">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specKeys.map(key => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="py-3 pr-4 text-xs font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</td>
                    {compareList.map(item => (
                      <td key={item.productId} className="py-3 px-4 text-sm">{item.specs[key] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
