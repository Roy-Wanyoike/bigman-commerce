'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, MapPin, Wallet, CheckCircle2, ArrowLeft, ArrowRight,
  ShoppingBag, Truck, Phone, MapPinned, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/prices'
import { generateOrderNumber } from '@/lib/security'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import OrderSummary from '@/components/bigman/OrderSummary'
import type { CartItem } from '@/lib/store'

const STEPS = [
  { id: 1, label: 'Contact', icon: User },
  { id: 2, label: 'Delivery', icon: MapPin },
  { id: 3, label: 'Payment', icon: Wallet },
  { id: 4, label: 'Confirmation', icon: CheckCircle2 },
]

const PICKUP_FEE = 0
const COURIER_FEE = 500

interface CheckoutData {
  fullName: string
  email: string
  phone: string
  deliveryMethod: 'pickup' | 'courier'
  county: string
  address: string
  courierPhone: string
  mpesaPhone: string
  orderNumber: string
}

const STORAGE_KEY = 'bigman_checkout_data'

function loadCheckoutData(): Partial<CheckoutData> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCheckoutData(data: Partial<CheckoutData>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function clearCheckoutData() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// generateOrderNumber imported from @/lib/security.ts

function getInitialState(): Partial<CheckoutData> {
  return loadCheckoutData()
}

// --- Extracted Components ---

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-8">
      {STEPS.map((s, i) => {
        const isActive = currentStep === s.id
        const isDone = currentStep > s.id
        const Icon = s.icon
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-18px] sm:mt-[-18px] ${currentStep > s.id ? 'bg-emerald-600' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StepContact({
  data, updateData, errors
}: {
  data: Partial<CheckoutData>
  updateData: (patch: Partial<CheckoutData>) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground mt-1">We&apos;ll use this for order updates.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="e.g. John Kamau"
            value={data.fullName ?? ''}
            onChange={e => updateData({ fullName: e.target.value })}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. john@example.com"
            value={data.email ?? ''}
            onChange={e => updateData({ email: e.target.value })}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +254712345678"
              className="pl-10"
              value={data.phone ?? ''}
              onChange={e => updateData({ phone: e.target.value })}
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>
    </div>
  )
}

function StepDelivery({
  data, updateData, errors
}: {
  data: Partial<CheckoutData>
  updateData: (patch: Partial<CheckoutData>) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Delivery Method</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose how you&apos;d like to receive your order.</p>
      </div>

      <RadioGroup
        value={data.deliveryMethod ?? ''}
        onValueChange={v => updateData({ deliveryMethod: v as 'pickup' | 'courier' })}
        className="space-y-3"
      >
        <label htmlFor="pickup" className={`block cursor-pointer rounded-xl border-2 p-4 transition-colors ${data.deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="pickup" id="pickup" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Nairobi Pickup</span>
                <Badge variant="secondary" className="text-[10px]">Free</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Rahimtulla Trust Building, Moi Avenue, Nairobi</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pick up during business hours (Mon-Sat, 8am-6pm)</p>
            </div>
          </div>
        </label>

        <label htmlFor="courier" className={`block cursor-pointer rounded-xl border-2 p-4 transition-colors ${data.deliveryMethod === 'courier' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="courier" id="courier" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Kenya Courier</span>
                <Badge variant="secondary" className="text-[10px]">KSh 500</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Delivered to your door across Kenya (2-5 business days)</p>
            </div>
          </div>
        </label>
      </RadioGroup>

      {errors.deliveryMethod && <p className="text-xs text-destructive">{errors.deliveryMethod}</p>}

      {data.deliveryMethod === 'courier' && (
        <div className="space-y-4 pl-1 border-l-2 border-primary/20 ml-1">
          <div className="space-y-2">
            <Label htmlFor="county">County / Town *</Label>
            <Input
              id="county"
              placeholder="e.g. Mombasa, Nakuru, Kisumu"
              value={data.county ?? ''}
              onChange={e => updateData({ county: e.target.value })}
              aria-invalid={!!errors.county}
            />
            {errors.county && <p className="text-xs text-destructive">{errors.county}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Specific Address *</Label>
            <Input
              id="address"
              placeholder="e.g. Kenyatta Ave, Plot 12, Shop 3"
              value={data.address ?? ''}
              onChange={e => updateData({ address: e.target.value })}
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="courierPhone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="courierPhone"
                type="tel"
                placeholder="e.g. +254712345678"
                className="pl-10"
                value={data.courierPhone ?? ''}
                onChange={e => updateData({ courierPhone: e.target.value })}
                aria-invalid={!!errors.courierPhone}
              />
            </div>
            {errors.courierPhone && <p className="text-xs text-destructive">{errors.courierPhone}</p>}
          </div>
        </div>
      )}

      {data.deliveryMethod === 'pickup' && (
        <Card className="border-border/60 overflow-hidden">
          <div className="h-40 bg-secondary/50 flex items-center justify-center relative">
            <div className="text-center">
              <MapPinned className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Rahimtulla Trust Building</p>
              <p className="text-[11px] text-muted-foreground">Moi Avenue, Nairobi CBD</p>
            </div>
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="text-[10px] bg-background/80">Map placeholder</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function StepPayment({
  data, updateData, errors, onPay, paying
}: {
  data: Partial<CheckoutData>
  updateData: (patch: Partial<CheckoutData>) => void
  errors: Record<string, string>
  onPay: () => void
  paying: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Payment Method</h2>
        <p className="text-sm text-muted-foreground mt-1">Pay securely with M-Pesa.</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">M-Pesa</p>
              <p className="text-[11px] text-muted-foreground">Lipa na M-Pesa (STK Push)</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="mpesaPhone">M-Pesa Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mpesaPhone"
                type="tel"
                placeholder="e.g. +254712345678"
                className="pl-10"
                value={data.mpesaPhone ?? ''}
                onChange={e => updateData({ mpesaPhone: e.target.value })}
                aria-invalid={!!errors.mpesaPhone}
              />
            </div>
            {errors.mpesaPhone && <p className="text-xs text-destructive">{errors.mpesaPhone}</p>}
            <p className="text-[11px] text-muted-foreground">You&apos;ll receive an STK push notification on this number to confirm payment.</p>
          </div>

          <Button
            className="w-full h-12 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
            onClick={onPay}
            disabled={paying}
          >
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Pay with M-Pesa
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secured by Safaricom M-Pesa
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepConfirmation({ data }: { data: Partial<CheckoutData> }) {
  return (
    <div className="text-center py-8 space-y-6">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">Order Confirmed!</h2>
        <p className="text-sm text-muted-foreground mt-1">Thank you for shopping with Bigman Computers.</p>
      </div>

      <Card className="border-border/60 max-w-sm mx-auto">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-bold font-mono">{data.orderNumber}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{data.fullName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{data.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">{data.deliveryMethod === 'pickup' ? 'Nairobi Pickup' : `Courier to ${data.county}`}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium text-emerald-600">Paid via M-Pesa</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        A confirmation email has been sent to <span className="font-medium">{data.email}</span>.<br />
        {data.deliveryMethod === 'pickup'
          ? 'Please bring your ID when picking up your order.'
          : 'You will receive delivery updates via SMS.'}
      </p>

      <Link href="/shop" className="inline-block" onClick={() => clearCheckoutData()}>
        <Button className="font-semibold" size="lg">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
      </Link>
    </div>
  )
}

function MobileSummaryToggle({
  step, cart, deliveryFee, isOpen, onToggle
}: {
  step: number
  cart: CartItem[]
  deliveryFee: number
  isOpen: boolean
  onToggle: () => void
}) {
  if (step === 4 || cart.length === 0) return null
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + deliveryFee

  return (
    <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 border-t border-border bg-background p-3">
      <button
        className="w-full flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Order total:</span>
          <span className="text-base font-bold price-display">{formatPrice(total)}</span>
        </div>
        {isOpen
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && (
        <div className="mt-3">
          <OrderSummary deliveryFee={deliveryFee} compact showItems />
        </div>
      )}
    </div>
  )
}

// --- Main Component ---

export default function CheckoutClient() {
  const router = useRouter()
  const { cart, clearCart } = useStore()
  const [step, setStep] = useState(1)
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paying, setPaying] = useState(false)
  const [data, setData] = useState<Partial<CheckoutData>>(getInitialState)

  const deliveryFee = data.deliveryMethod === 'courier' ? COURIER_FEE : PICKUP_FEE

  // Persist data on change
  const updateData = useCallback((patch: Partial<CheckoutData>) => {
    setData(prev => {
      const next = { ...prev, ...patch }
      saveCheckoutData(next)
      return next
    })
    setErrors(prev => {
      const keys = Object.keys(patch)
      const next = { ...prev }
      keys.forEach(k => delete next[k])
      return next
    })
  }, [])

  // Redirect if cart is empty and not on confirmation
  useEffect(() => {
    if (cart.length === 0 && step < 4) {
      router.push('/cart')
    }
  }, [cart.length, step, router])

  // --- Validation ---
  function validateStep(s: number): boolean {
    const e: Record<string, string> = {}

    if (s === 1) {
      if (!data.fullName?.trim()) e.fullName = 'Full name is required'
      if (!data.email?.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email address'
      if (!data.phone?.trim()) e.phone = 'Phone number is required'
      else if (!/^\+254\d{9}$/.test(data.phone.replace(/\s/g, ''))) e.phone = 'Use format +254XXXXXXXXX'
    }

    if (s === 2) {
      if (!data.deliveryMethod) e.deliveryMethod = 'Select a delivery method'
      if (data.deliveryMethod === 'courier') {
        if (!data.county?.trim()) e.county = 'County/Town is required'
        if (!data.address?.trim()) e.address = 'Address is required'
        if (!data.courierPhone?.trim()) e.courierPhone = 'Phone number is required'
        else if (!/^\+254\d{9}$/.test(data.courierPhone.replace(/\s/g, ''))) e.courierPhone = 'Use format +254XXXXXXXXX'
      }
    }

    if (s === 3) {
      if (!data.mpesaPhone?.trim()) e.mpesaPhone = 'M-Pesa phone number is required'
      else if (!/^\+254\d{9}$/.test(data.mpesaPhone.replace(/\s/g, ''))) e.mpesaPhone = 'Use format +254XXXXXXXXX'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, 4))
  }

  function goBack() {
    setStep(s => Math.max(s - 1, 1))
  }

  function handlePay() {
    if (!validateStep(3)) return
    setPaying(true)
    setTimeout(() => {
      const orderNum = generateOrderNumber()
      updateData({ orderNumber: orderNum })
      clearCart()
      setPaying(false)
      setStep(4)
    }, 2000)
  }

  function renderStepContent(): ReactNode {
    switch (step) {
      case 1: return <StepContact data={data} updateData={updateData} errors={errors} />
      case 2: return <StepDelivery data={data} updateData={updateData} errors={errors} />
      case 3: return <StepPayment data={data} updateData={updateData} errors={errors} onPay={handlePay} paying={paying} />
      case 4: return <StepConfirmation data={data} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />

      <main className="flex-1 container-main py-8 md:py-12">
        {step > 1 && step < 4 && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {step < 4 && <StepIndicator currentStep={step} />}

        <div className={step < 4 ? 'grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0' : ''}>
          <div className={step < 4 ? 'lg:col-span-2' : ''}>
            {renderStepContent()}

            {step < 4 && step > 0 && (
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button variant="outline" onClick={goBack} className="font-medium">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back
                  </Button>
                ) : (
                  <Link href="/cart">
                    <Button variant="outline" className="font-medium">
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Cart
                    </Button>
                  </Link>
                )}
                {step < 3 ? (
                  <Button onClick={goNext} className="font-medium">
                    Continue <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          {step < 4 && cart.length > 0 && (
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <OrderSummary deliveryFee={deliveryFee} />
              </div>
            </div>
          )}
        </div>
      </main>

      {step < 4 && <BigmanFooter categories={[]} />}
      {step < 4 && <MobileBottomNav />}
      {step < 4 && <div className="lg:hidden h-14" />}

      <MobileSummaryToggle
        step={step}
        cart={cart}
        deliveryFee={deliveryFee}
        isOpen={mobileSummaryOpen}
        onToggle={() => setMobileSummaryOpen(o => !o)}
      />
    </div>
  )
}