'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, PackageOpen, Check, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/prices'

type AlertState = 'idle' | 'loading' | 'success' | 'error'

interface AlertButtonsProps {
  productId: string
  currentPrice: number
  isOutOfStock: boolean
  productName: string
}

function PriceAlertSection({ productId, currentPrice }: { productId: string; currentPrice: number }) {
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [state, setState] = useState<AlertState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.')
      return
    }

    setState('loading')

    try {
      const body: Record<string, unknown> = {
        productId,
        customerEmail: email.trim(),
      }
      if (targetPrice.trim()) {
        const tp = parseFloat(targetPrice)
        if (isNaN(tp) || tp <= 0) {
          setErrorMsg('Target price must be a positive number.')
          setState('idle')
          return
        }
        body.targetPrice = tp
      }

      const res = await fetch('/api/alerts/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.errors?.[0]?.message || data.message || 'Something went wrong.')
        setState('idle')
        return
      }

      setState('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('idle')
    }
  }

  if (state === 'success') {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-sm text-emerald-700">Price alert set! We&apos;ll notify you at <strong>{email}</strong>.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Price Alert</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Current price: <strong>{formatPrice(currentPrice)}</strong>. Get notified when the price drops.
          </p>
          <div className="space-y-2">
            <div>
              <Label htmlFor="price-alert-email" className="text-xs">Email address *</Label>
              <Input
                id="price-alert-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="price-alert-target" className="text-xs">Target price (optional)</Label>
              <Input
                id="price-alert-target"
                type="number"
                step="any"
                min="0"
                placeholder={`e.g. ${Math.round(currentPrice * 0.9).toLocaleString()}`}
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
          <Button type="submit" size="sm" disabled={state === 'loading'} className="w-full">
            {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Bell className="h-4 w-4 mr-1.5" />}
            Notify Me
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function StockAlertSection({ productId }: { productId: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<AlertState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.')
      return
    }

    setState('loading')

    try {
      const res = await fetch('/api/alerts/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerEmail: email.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.errors?.[0]?.message || data.message || 'Something went wrong.')
        setState('idle')
        return
      }

      setState('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('idle')
    }
  }

  if (state === 'success') {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-sm text-emerald-700">Back-in-stock alert set! We&apos;ll notify you at <strong>{email}</strong>.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <PackageOpen className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Back in Stock Alert</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            This item is currently out of stock. Enter your email and we&apos;ll let you know when it&apos;s available.
          </p>
          <div>
            <Label htmlFor="stock-alert-email" className="text-xs">Email address *</Label>
            <Input
              id="stock-alert-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-8 text-sm"
            />
          </div>
          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
          <Button type="submit" size="sm" disabled={state === 'loading'} className="w-full">
            {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <PackageOpen className="h-4 w-4 mr-1.5" />}
            Notify Me
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AlertButtons({ productId, currentPrice, isOutOfStock, productName }: AlertButtonsProps) {
  return (
    <div className="space-y-3 mt-2">
      <PriceAlertSection productId={productId} currentPrice={currentPrice} />
      {isOutOfStock && <StockAlertSection productId={productId} />}
    </div>
  )
}
