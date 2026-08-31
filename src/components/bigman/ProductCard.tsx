'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, GitCompareArrows, ShieldCheck, MessageCircle, ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { formatPrice, getDiscount, conditionLabels, conditionGrades, stockStatus } from '@/lib/prices'
import type { Product } from './types'
import { cn } from '@/lib/utils'

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const { addToCart, toggleWishlist, wishlist, addToCompare, compareList } = useStore()
  const specs: Record<string, string> = product.specifications ? JSON.parse(product.specifications) : {}
  const effectivePrice = product.salePrice || product.basePrice
  const discount = getDiscount(effectivePrice, product.compareAtPrice)
  const stock = stockStatus(product.stockCount, product.trackInventory)
  const isWished = wishlist.some(w => w.productId === product.id)
  const isComparing = compareList.some(c => c.productId === product.id)
  const isGaming = product.isGaming
  const isRefurb = product.condition === 'REFURBISHED'

  // Find primary approved image
  const primaryImage = product.productImages?.find(
    (img) => img.isPrimary && img.status === 'APPROVED'
  ) || product.productImages?.find(
    (img) => img.status === 'APPROVED'
  )
  const hasImage = !!primaryImage?.url

  const handleAddToCart = () => {
    addToCart({
      productId: product.id, name: product.name, price: effectivePrice,
      quantity: 1, condition: product.condition, conditionGrade: product.conditionGrade || undefined,
      image: primaryImage?.url || undefined,
    })
  }

  const handleCompare = () => {
    addToCompare({
      productId: product.id, slug: product.slug, name: product.name, price: effectivePrice,
      brand: product.brand?.name, specs,
      image: primaryImage?.url || undefined,
    })
  }

  return (
    <Card className={cn(
      'product-card group overflow-hidden bg-card h-full flex flex-col',
      'border border-border/60 hover:border-accent/30',
      isGaming && 'ring-1 ring-gaming/10'
    )}>
      {/* ── Image Area ── */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/3] bg-secondary/40 overflow-hidden">
        {hasImage ? (
          <Image
            src={primaryImage!.url}
            alt={primaryImage!.altText || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              isGaming ? 'bg-gaming/10' : 'bg-secondary'
            )}>
              {isGaming ? (
                <ImageIcon className="w-8 h-8 text-gaming/30" />
              ) : (
                <span className={cn(
                  'text-2xl font-bold',
                  'text-muted-foreground/25'
                )}>{product.brand?.name?.[0] || 'B'}</span>
              )}
            </div>
          </div>
        )}

        {/* Badges — top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isRefurb && (
            <Badge className="bg-amber-600 text-white text-[9px] h-5 px-1.5 font-semibold tracking-wide">REFURBISHED</Badge>
          )}
          {isRefurb && product.conditionGrade && (
            <Badge variant="outline" className="bg-white/90 text-amber-700 border-amber-200 text-[9px] h-5 px-1.5 font-medium">
              GRADE {conditionGrades[product.conditionGrade] || product.conditionGrade}
            </Badge>
          )}
          {isGaming && (
            <Badge className="bg-gaming text-gaming-foreground text-[9px] h-5 px-1.5 font-semibold tracking-wide">GAMING</Badge>
          )}
          {discount && (
            <Badge variant="destructive" className="text-[9px] h-5 px-1.5 font-bold">-{discount}%</Badge>
          )}
        </div>

        {/* Quick actions — top-right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-md border border-border/50"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist({ productId: product.id, name: product.name, price: effectivePrice, image: primaryImage?.url || undefined, slug: product.slug, brand: product.brand?.name || undefined }) }} aria-label="Add to wishlist">
            <Heart className={cn('h-3.5 w-3.5', isWished && 'fill-red-500 text-red-500')} />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-md border border-border/50"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCompare() }} aria-label="Compare">
            <GitCompareArrows className={cn('h-3.5 w-3.5', isComparing && 'text-accent')} />
          </Button>
        </div>

        {/* Stock badge — bottom-left */}
        <div className="absolute bottom-2 left-2">
          <Badge variant={stock.variant} className="text-[9px] h-5 font-medium backdrop-blur-sm bg-background/80">{stock.label}</Badge>
        </div>
      </Link>

      {/* ── Content Area ── */}
      <CardContent className="flex-1 flex flex-col p-3 pt-2.5 gap-1.5">
        {/* Brand · Category */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
          {product.brand && <span>{product.brand.name}</span>}
          {product.categories[0] && <span className="opacity-40">·</span>}
          {product.categories[0] && <span>{product.categories[0].category.name}</span>}
        </div>

        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Key specs — compact */}
        {Object.keys(specs).length > 0 && (
          <div className="text-[11px] text-muted-foreground line-clamp-1">
            {Object.values(specs).slice(0, 3).join(' · ')}
          </div>
        )}

        {/* Trust signals for refurbished */}
        {isRefurb && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
              <ShieldCheck className="h-3 w-3" /> Inspected
            </span>
            {product.warrantyMonths && <span>· {product.warrantyMonths}mo warranty</span>}
          </div>
        )}

        <div className="flex-1" />

        {/* ── Price Block ── */}
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <span className="price-display text-lg font-bold tracking-tight">{formatPrice(effectivePrice)}</span>
            {discount && product.compareAtPrice && (
              <span className="price-display text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          {discount && product.compareAtPrice && (
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Save {formatPrice(product.compareAtPrice - effectivePrice)}
            </div>
          )}
        </div>

        {/* ── Add to Cart ── */}
        <Button size="sm" className="w-full h-8 text-xs font-medium rounded-lg mt-1"
          onClick={handleAddToCart}
          disabled={product.stockCount <= 0 && product.trackInventory}>
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {product.stockCount <= 0 && product.trackInventory ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ── Product Card Skeleton ── */
export function ProductCardSkeleton() {
  return (
    <Card className="bg-card h-full flex flex-col border border-border/60 overflow-hidden">
      <div className="aspect-[4/3] bg-secondary/40 animate-pulse" />
      <CardContent className="flex-1 flex flex-col p-3 pt-2.5 gap-2">
        <div className="h-3 w-16 bg-secondary rounded animate-pulse" />
        <div className="h-4 w-full bg-secondary rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-secondary rounded animate-pulse" />
        <div className="flex-1" />
        <div className="h-5 w-24 bg-secondary rounded animate-pulse" />
        <div className="h-8 w-full bg-secondary rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  )
}
