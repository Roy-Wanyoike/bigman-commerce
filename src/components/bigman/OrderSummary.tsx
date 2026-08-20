'use client'

import { useStore, type CartItem } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface OrderSummaryProps {
  deliveryFee?: number
  showItems?: boolean
  className?: string
  compact?: boolean
}

export default function OrderSummary({ deliveryFee = 0, showItems = true, className = '', compact = false }: OrderSummaryProps) {
  const { cart } = useStore()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + deliveryFee

  return (
    <Card className={`border-border/60 ${className}`}>
      <CardContent className={compact ? 'p-4 space-y-3' : 'p-5 space-y-4'}>
        <h2 className="font-semibold">Order Summary</h2>

        {showItems && cart.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={`${item.productId}-${item.condition}`} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground/30">{item.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold price-display shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span className="font-medium price-display">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            {deliveryFee === 0 ? (
              <span className="text-sm font-medium text-emerald-600">Free</span>
            ) : (
              <span className="font-medium price-display">{formatPrice(deliveryFee)}</span>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="price-display text-lg">{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
