'use client'

import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export default function WishlistClient() {
  const { wishlist, removeFromWishlist, clearWishlist, addToCart } = useStore()

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={[]} />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <Heart className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h1 className="text-lg font-semibold mb-1">Your wishlist is empty</h1>
          <p className="text-sm text-muted-foreground mb-6">Save products you love and come back to them later.</p>
          <Link href="/shop">
            <Button className="font-medium">Browse Products <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
          </Link>
        </main>
        <BigmanFooter categories={[]} />
        <MobileBottomNav />
        <div className="lg:hidden h-14" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1 container-main py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearWishlist} className="text-xs">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map(item => (
            <Card key={item.productId} className="border-border/60 overflow-hidden">
              <Link href={`/product/${item.slug || item.productId}`} className="block">
                <div className="w-full aspect-[4/3] bg-secondary/40 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-muted-foreground/20">{item.name[0]}</span>
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4 space-y-3">
                {item.brand && (
                  <div className="text-xs text-muted-foreground font-medium">{item.brand}</div>
                )}
                <Link href={`/product/${item.slug || item.productId}`}>
                  <h3 className="text-sm font-semibold line-clamp-2 hover:text-accent transition-colors">{item.name}</h3>
                </Link>
                <div className="text-lg font-bold price-display">{formatPrice(item.price)}</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs font-medium"
                    onClick={() => addToCart({
                      productId: item.productId, name: item.name, price: item.price,
                      quantity: 1, image: item.image,
                    })}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 px-0"
                    onClick={() => removeFromWishlist(item.productId)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
