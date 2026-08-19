'use client'

import { Heart, ShoppingCart, GitCompareArrows, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { formatPrice, getDiscount, conditionLabels, conditionGrades, stockStatus } from '@/lib/prices'
import type { Product } from './types'
import { cn } from '@/lib/utils'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addToCart, toggleWishlist, wishlist, addToCompare, compareList } = useStore()
  const specs: Record<string, string> = product.specifications ? JSON.parse(product.specifications) : {}
  const discount = getDiscount(product.basePrice, product.compareAtPrice)
  const stock = stockStatus(product.stockCount, product.trackInventory)
  const isWished = wishlist.includes(product.id)
  const isComparing = compareList.some(c => c.productId === product.id)
  const effectivePrice = product.salePrice || product.basePrice

  const handleAddToCart = () => {
    addToCart({
      productId: product.id, name: product.name, price: effectivePrice,
      quantity: 1, condition: product.condition, conditionGrade: product.conditionGrade || undefined,
    })
  }

  const handleCompare = () => {
    addToCompare({
      productId: product.id, name: product.name, price: effectivePrice,
      brand: product.brand?.name, specs,
    })
  }

  return (
    <Card className="product-card group overflow-hidden border-border/50 bg-card h-full flex flex-col">
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground/30">{product.brand?.name?.[0] || 'B'}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.condition === 'REFURBISHED' && (
            <Badge className="bg-amber-600 text-white text-[10px] h-5 px-1.5">REFURBISHED</Badge>
          )}
          {product.condition === 'REFURBISHED' && product.conditionGrade && (
            <Badge variant="outline" className="bg-white/90 text-amber-700 border-amber-300 text-[10px] h-5 px-1.5">
              GRADE {conditionGrades[product.conditionGrade] || product.conditionGrade}
            </Badge>
          )}
          {product.isGaming && (
            <Badge className="bg-purple-600 text-white text-[10px] h-5 px-1.5">GAMING</Badge>
          )}
          {discount && (
            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">-{discount}%</Badge>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm"
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}>
            <Heart className={cn("h-3.5 w-3.5", isWished && "fill-red-500 text-red-500")} />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm"
            onClick={(e) => { e.preventDefault(); handleCompare() }}>
            <GitCompareArrows className={cn("h-3.5 w-3.5", isComparing && "text-accent")} />
          </Button>
        </div>

        {/* Stock indicator */}
        <div className="absolute bottom-2 left-2">
          <Badge variant={stock.variant} className="text-[10px] h-5">{stock.label}</Badge>
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-3 pt-2.5 gap-2">
        {/* Brand + Category */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {product.brand && <span className="font-medium">{product.brand.name}</span>}
          {product.categories[0] && <span>· {product.categories[0].category.name}</span>}
        </div>

        {/* Name */}
        <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        {/* Key specs */}
        <div className="text-xs text-muted-foreground line-clamp-2">
          {Object.values(specs).slice(0, 3).join(' · ')}
        </div>

        {/* Warranty & Inspection for refurbished */}
        {product.condition === 'REFURBISHED' && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><ShieldCheck className="h-3 w-3 text-emerald-600" /> Inspected</span>
            {product.warrantyMonths && <span>· {product.warrantyMonths}mo warranty</span>}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatPrice(effectivePrice)}</span>
            {discount && product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          {discount && product.compareAtPrice && (
            <div className="text-[11px] text-emerald-600 font-medium">
              Save {formatPrice(product.compareAtPrice - effectivePrice)}
            </div>
          )}
        </div>

        {/* Add to cart */}
        <Button size="sm" className="w-full h-8 text-xs" onClick={handleAddToCart}
          disabled={product.stockCount <= 0 && product.trackInventory}>
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {product.stockCount <= 0 && product.trackInventory ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  )
}
