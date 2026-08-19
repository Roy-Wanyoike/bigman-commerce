'use client'

import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Shield, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export default function CartClient() {
  const { cart, removeFromCart, updateQuantity, clearCart, setMobileMenuOpen, searchOpen, setSearchOpen, mobileMenuOpen } = useStore()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground mb-8">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h2 className="text-lg font-semibold mb-1">Your cart is waiting</h2>
            <p className="text-sm text-muted-foreground mb-6">Browse our catalog and add products you love.</p>
            <Link href="/shop">
              <Button className="font-medium">Shop Computers <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map(item => (
                <Card key={`${item.productId}-${item.condition}`} className="border-border/60">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-muted-foreground/20">{item.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold line-clamp-1">{item.name}</h3>
                          {item.condition === 'REFURBISHED' && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Refurbished</span>
                          )}
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg">
                          <button className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors rounded-l-lg"
                            onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))} aria-label="Decrease quantity">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-8 w-10 flex items-center justify-center text-sm font-medium border-x border-border">{item.quantity}</span>
                          <button className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors rounded-r-lg"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Increase quantity">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold price-display">{formatPrice(item.price * item.quantity)}</div>
                          {item.quantity > 1 && <div className="text-[10px] text-muted-foreground">{formatPrice(item.price)} each</div>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear cart</button>
            </div>

            {/* Order summary */}
            <div>
              <Card className="border-border/60 sticky top-24">
                <CardContent className="p-5 space-y-4">
                  <h2 className="font-semibold">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium price-display">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="price-display text-lg">{formatPrice(subtotal)}</span>
                  </div>
                  <Button className="w-full font-semibold h-11" size="lg">
                    Proceed to Checkout <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                  <div className="space-y-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secure payment</div>
                    <div className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> M-Pesa accepted</div>
                    <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Delivery available</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}