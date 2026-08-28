'use client'

import { useState, useCallback } from 'react'
import {
  Plus, Trash2, Building2, FileText, CheckCircle2, Loader2, Package, User, MapPin, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

/* ── Types ── */
interface QuoteItem {
  id: string
  productId: string
  quantity: number
  notes: string
}

interface FieldErrors {
  companyName?: string[]
  contactName?: string[]
  email?: string[]
  phone?: string[]
  krapin?: string[]
  businessType?: string[]
  items?: string[] | { _errors?: string[]; productId?: string[]; quantity?: string[]; notes?: string[] }[]
  deliveryCounty?: string[]
  deliveryAddress?: string[]
  specialRequirements?: string[]
  _form?: string[]
}

const businessTypes = [
  { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietor' },
  { value: 'LIMITED', label: 'Limited Company' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'NGO', label: 'NGO' },
  { value: 'GOVERNMENT', label: 'Government' },
]

/* ── Component ── */
export default function B2BFormClient() {
  const [companyName, setCompanyName] = useState('')
  const [krapin, setKrapin] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryCounty, setDeliveryCounty] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([
    { id: crypto.randomUUID(), productId: '', quantity: 1, notes: '' },
  ])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ quoteId: string; estimatedResponse: string } | null>(null)

  const addItem = useCallback(() => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), productId: '', quantity: 1, notes: '' }])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => (prev.length > 1 ? prev.filter(i => i.id !== id) : prev))
  }, [])

  const updateItem = useCallback((id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)))
  }, [])

  const clearErrors = () => setErrors({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)

    const payload = {
      companyName,
      contactName,
      email,
      phone,
      krapin: krapin || undefined,
      businessType: businessType as QuoteItem['productId'] extends string ? string : never,
      items: items.map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity) || 1,
        notes: i.notes || undefined,
      })),
      deliveryCounty,
      deliveryAddress,
      specialRequirements: specialRequirements || undefined,
    }

    try {
      const res = await fetch('/api/b2b/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrors(data.errors || { _form: ['Something went wrong. Please try again.'] })
        return
      }

      setSuccess({ quoteId: data.quoteId, estimatedResponse: data.estimatedResponse })
    } catch {
      setErrors({ _form: ['Network error. Please check your connection and try again.'] })
    } finally {
      setLoading(false)
    }
  }

  /* ── Success State ── */
  if (success) {
    return (
      <Card className="border-2 border-green-200 dark:border-green-900/50">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold">Quote Request Submitted</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your quote reference is <Badge variant="secondary" className="font-mono text-sm px-2 py-0.5">{success.quoteId}</Badge>
          </p>
          <p className="text-sm text-muted-foreground">Our B2B team will respond {success.estimatedResponse}.</p>
          <Separator className="max-w-xs mx-auto" />
          <p className="text-xs text-muted-foreground">
            For urgent inquiries, contact us at{' '}
            <a href="mailto:business@bigmancomputers.co.ke" className="text-primary underline">
              business@bigmancomputers.co.ke
            </a>
          </p>
          <Button variant="outline" onClick={() => { setSuccess(null); setCompanyName(''); setKrapin(''); setBusinessType(''); setContactName(''); setEmail(''); setPhone(''); setDeliveryCounty(''); setDeliveryAddress(''); setSpecialRequirements(''); setItems([{ id: crypto.randomUUID(), productId: '', quantity: 1, notes: '' }]) }}>
            Submit Another Quote
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors._form && (
        <Alert variant="destructive">
          <AlertDescription>{errors._form.join('. ')}</AlertDescription>
        </Alert>
      )}

      {/* ── Company Information ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Company Information
          </CardTitle>
          <CardDescription>Business registration and identification details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input id="companyName" placeholder="Acme Kenya Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.join('. ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="krapin">KRA PIN <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="krapin" placeholder="A00XXXXXXX" value={krapin} onChange={e => setKrapin(e.target.value)} />
            {errors.krapin && <p className="text-xs text-destructive">{errors.krapin.join('. ')}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={businessType} onValueChange={v => { setBusinessType(v); setErrors(prev => ({ ...prev, businessType: undefined })) }}>
              <SelectTrigger id="businessType"><SelectValue placeholder="Select business type" /></SelectTrigger>
              <SelectContent>
                {businessTypes.map(bt => (
                  <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && <p className="text-xs text-destructive">{errors.businessType.join('. ')}</p>}
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Information ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Contact Information
          </CardTitle>
          <CardDescription>Primary point of contact for this quote request.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contactName">Full Name *</Label>
            <Input id="contactName" placeholder="John Doe" value={contactName} onChange={e => setContactName(e.target.value)} />
            {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.join('. ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email *</Label>
            <Input id="email" type="email" placeholder="john@company.co.ke" value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.join('. ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" type="tel" placeholder="0712 345 678" value={phone} onChange={e => setPhone(e.target.value)} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.join('. ')}</p>}
          </div>
        </CardContent>
      </Card>

      {/* ── Order Details ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" /> Order Details
              </CardTitle>
              <CardDescription className="mt-1">Add products and quantities for your quote.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header row - desktop */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Product / SKU</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-4">Notes</div>
              <div className="col-span-1" />
            </div>
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg border bg-card">
                <div className="sm:col-span-5 space-y-1">
                  <Label className="sm:hidden text-xs text-muted-foreground">Product / SKU *</Label>
                  <Input
                    placeholder="e.g. Dell Latitude 5540 or product URL"
                    value={item.productId}
                    onChange={e => updateItem(item.id, 'productId', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="sm:hidden text-xs text-muted-foreground">Quantity *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="sm:col-span-4 space-y-1">
                  <Label className="sm:hidden text-xs text-muted-foreground">Notes</Label>
                  <Input
                    placeholder="Specifications, preferences..."
                    value={item.notes}
                    onChange={e => updateItem(item.id, 'notes', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-1 flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {Array.isArray(errors.items) && errors.items.length > 0 && (
            <p className="text-xs text-destructive mt-2">Please ensure all items have a product name and valid quantity.</p>
          )}
          {typeof errors.items === 'string' && <p className="text-xs text-destructive mt-2">{errors.items}</p>}
        </CardContent>
      </Card>

      {/* ── Delivery ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" /> Delivery Information
          </CardTitle>
          <CardDescription>Where should the order be delivered?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="county">County *</Label>
            <Input id="county" placeholder="Nairobi" value={deliveryCounty} onChange={e => setDeliveryCounty(e.target.value)} />
            {errors.deliveryCounty && <p className="text-xs text-destructive">{errors.deliveryCounty.join('. ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Input id="address" placeholder="Rahimtulla Trust Building, Moi Avenue" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
            {errors.deliveryAddress && <p className="text-xs text-destructive">{errors.deliveryAddress.join('. ')}</p>}
          </div>
        </CardContent>
      </Card>

      {/* ── Special Requirements ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" /> Special Requirements
          </CardTitle>
          <CardDescription>Any additional specifications, preferred brands, or timeline requirements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g. All laptops must have 3-year warranty, prefer Lenovo ThinkPad series, delivery needed by end of month..."
            value={specialRequirements}
            onChange={e => setSpecialRequirements(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto min-w-[200px]">
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <><FileText className="h-4 w-4 mr-2" /> Submit Quote Request</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          By submitting, you agree to our B2B terms. No payment required at this stage.
        </p>
      </div>
    </form>
  )
}
