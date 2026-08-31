'use client'

import { ShoppingCart, Heart, GitCompareArrows } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Props {
  productId: string
  name: string
  price: number
  condition: string
  conditionGrade?: string
  brand?: string
  specs: Record<string, string>
  outOfStock: boolean
  image?: string
}

export default function ProductActions({
  productId, name, price, condition, conditionGrade, brand, specs, outOfStock, image,
}: Props) {
  const { addToCart, toggleWishlist, wishlist, addToCompare, compareList } = useStore()

  const isWished = wishlist.some(w => w.productId === productId)
  const isComparing = compareList.some(c => c.productId === productId)
  const compareFull = compareList.length >= 4

  const handleAddToCart = () => {
    addToCart({
      productId, name, price, quantity: 1,
      condition, conditionGrade,
      image,
    })
  }

  const handleCompare = () => {
    if (isComparing) return
    addToCompare({ productId, name, price, brand, specs, image })
  }

  return (
    <div className="flex items-stretch gap-3">
      <Button
        size="lg"
        className="flex-1 h-12 text-sm font-semibold"
        onClick={handleAddToCart}
        disabled={outOfStock}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="h-12 w-12 px-0"
        onClick={() => toggleWishlist({ productId, name, price, image, slug: undefined, brand })}
        aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('h-5 w-5', isWished && 'fill-red-500 text-red-500')} />
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="h-12 w-12 px-0"
        onClick={handleCompare}
        disabled={compareFull && !isComparing}
        aria-label={isComparing ? 'Already comparing' : compareFull ? 'Compare list full (max 4)' : 'Add to compare'}
        title={compareFull && !isComparing ? 'Compare list is full (max 4 items)' : undefined}
      >
        <GitCompareArrows className={cn('h-5 w-5', isComparing && 'text-accent')} />
      </Button>
    </div>
  )
}
