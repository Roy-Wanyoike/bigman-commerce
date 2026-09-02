'use client'

import { use, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/prices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  User,
  Save,
  Loader2,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────

interface OrderItem {
  id: string
  productName: string
  productSlug: string | null
  brandName: string | null
  condition: string | null
  unitPrice: number
  quantity: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryMethod: string
  deliveryCounty: string | null
  deliveryAddress: string | null
  courierPhone: string | null
  deliveryStatus: string
  trackingNumber: string | null
  dispatchedAt: string | null
  deliveredAt: string | null
  paymentMethod: string
  paymentStatus: string
  mpesaPhone: string | null
  mpesaTransactionRef: string | null
  paidAt: string | null
  subtotal: number
  deliveryFee: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

// ── Constants ──────────────────────────────────────────────

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const
const DELIVERY_STATUSES = ['PENDING', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'PICKED_UP'] as const

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const deliveryStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  DISPATCHED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  IN_TRANSIT: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PICKED_UP: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

// ── Helpers ────────────────────────────────────────────────

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ── Component ──────────────────────────────────────────────

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Data state
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [editStatus, setEditStatus] = useState('')
  const [editPaymentStatus, setEditPaymentStatus] = useState('')
  const [editDeliveryStatus, setEditDeliveryStatus] = useState('')
  const [editTrackingNumber, setEditTrackingNumber] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Saving state
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Failed to fetch order (${res.status})`)
        return
      }
      const data = await res.json()
      const o = data.order as Order
      setOrder(o)
      setEditStatus(o.status)
      setEditPaymentStatus(o.paymentStatus)
      setEditDeliveryStatus(o.deliveryStatus)
      setEditTrackingNumber(o.trackingNumber || '')
      setEditNotes(o.notes || '')
    } catch (e) {
      setError('Failed to fetch order. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleSave = async () => {
    if (!order) return
    setSaving(true)
    setSaveSuccess(false)

    try {
      const body: Record<string, string> = {}
      if (editStatus !== order.status) body.status = editStatus
      if (editPaymentStatus !== order.paymentStatus) body.paymentStatus = editPaymentStatus
      if (editDeliveryStatus !== order.deliveryStatus) body.deliveryStatus = editDeliveryStatus
      if (editTrackingNumber !== (order.trackingNumber || '')) body.trackingNumber = editTrackingNumber
      if (editNotes !== (order.notes || '')) body.notes = editNotes

      if (Object.keys(body).length === 0) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        return
      }

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to update order')
        return
      }

      const data = await res.json()
      const updated = data.order as Order
      setOrder(updated)
      setEditStatus(updated.status)
      setEditPaymentStatus(updated.paymentStatus)
      setEditDeliveryStatus(updated.deliveryStatus)
      setEditTrackingNumber(updated.trackingNumber || '')
      setEditNotes(updated.notes || '')
      setSaveSuccess(true)
      setError(null)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading order...</span>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────
  if (error && !order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) return null

  const hasChanges =
    editStatus !== order.status ||
    editPaymentStatus !== order.paymentStatus ||
    editDeliveryStatus !== order.deliveryStatus ||
    editTrackingNumber !== (order.trackingNumber || '') ||
    editNotes !== (order.notes || '')

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 mt-2">
            <Package className="h-6 w-6" />
            {order.orderNumber}
            <Badge variant="outline" className={`border text-xs ${statusColors[order.status] || ''}`}>
              {order.status}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Inline error banner */}
      {error && order && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column – Info cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Order Items ({order.orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.productSlug ? (
                            <Link href={`/products/${item.productSlug}`} className="text-sm font-medium hover:underline">
                              {item.productName}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium">{item.productName}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.brandName || '—'}</TableCell>
                        <TableCell>
                          {item.condition && (
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {item.condition.replace('_', ' ')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatPrice(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile card list */}
              <div className="md:hidden divide-y">
                {order.orderItems.map(item => (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">{item.productName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {item.brandName && <span className="text-xs text-muted-foreground">{item.brandName}</span>}
                          {item.condition && (
                            <Badge variant="secondary" className="text-[10px] capitalize">{item.condition.replace('_', ' ')}</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold ml-4">{formatPrice(item.totalPrice)}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-emerald-600">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column – Detail cards */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium mt-0.5">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium mt-0.5">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium mt-0.5">{order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="text-sm font-medium mt-0.5">
                  {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Courier Delivery'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant="outline" className={`border text-[10px] ${deliveryStatusColors[order.deliveryStatus] || ''}`}>
                  {order.deliveryStatus}
                </Badge>
              </div>
              {order.deliveryCounty && (
                <div>
                  <p className="text-xs text-muted-foreground">County</p>
                  <p className="text-sm font-medium mt-0.5">{order.deliveryCounty}</p>
                </div>
              )}
              {order.deliveryAddress && (
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium mt-0.5">{order.deliveryAddress}</p>
                </div>
              )}
              {order.courierPhone && (
                <div>
                  <p className="text-xs text-muted-foreground">Courier Phone</p>
                  <p className="text-sm font-medium mt-0.5">{order.courierPhone}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Tracking Number</p>
                  <p className="text-sm font-medium mt-0.5 font-mono">{order.trackingNumber}</p>
                </div>
              )}
              {order.dispatchedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Dispatched</p>
                  <p className="text-sm font-medium mt-0.5">{formatDateTime(order.dispatchedAt)}</p>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="text-sm font-medium mt-0.5">{formatDateTime(order.deliveredAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="text-sm font-medium mt-0.5">
                  {order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod.replace('_', ' ')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant="outline" className={`border text-[10px] ${paymentStatusColors[order.paymentStatus] || ''}`}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.mpesaPhone && (
                <div>
                  <p className="text-xs text-muted-foreground">M-Pesa Phone</p>
                  <p className="text-sm font-medium mt-0.5">{order.mpesaPhone}</p>
                </div>
              )}
              {order.mpesaTransactionRef && (
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Ref</p>
                  <p className="text-sm font-medium mt-0.5 font-mono">{order.mpesaTransactionRef}</p>
                </div>
              )}
              {order.paidAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Paid On</p>
                  <p className="text-sm font-medium mt-0.5">{formatDateTime(order.paidAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Order Created</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Payment Completed</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.paidAt)}</p>
                    </div>
                  </div>
                )}
                {order.dispatchedAt && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Order Dispatched</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.dispatchedAt)}</p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Order Delivered</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.deliveredAt)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gray-300 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(order.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Update Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Order Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Status</label>
              <Select value={editDeliveryStatus} onValueChange={setEditDeliveryStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Number</label>
              <Input
                placeholder="Enter tracking number..."
                value={editTrackingNumber}
                onChange={e => setEditTrackingNumber(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add internal order notes..."
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            {saveSuccess && (
              <span className="text-sm text-emerald-600 font-medium">Changes saved successfully!</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
