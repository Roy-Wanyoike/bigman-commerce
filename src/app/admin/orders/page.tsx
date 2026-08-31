'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/prices'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
} from 'lucide-react'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateNotes, setUpdateNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (paymentFilter) params.set('paymentStatus', paymentFilter)
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter, search, page])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      const order = orders.find(o => o.id === id)
      if (order) {
        setUpdateStatus(order.status)
        setUpdateNotes(order.notes || '')
      }
    }
  }

  const handleStatusUpdate = async (orderId: string) => {
    if (!updateStatus) return
    setUpdatingStatus(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updateStatus }),
      })
      if (res.ok) {
        const { order: updated } = await res.json()
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleNotesSave = async (orderId: string) => {
    setSavingNotes(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: updateNotes }),
      })
      if (res.ok) {
        const { order: updated } = await res.json()
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingNotes(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6" />
          Orders
          {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {ORDER_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v === 'ALL' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              {PAYMENT_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9 w-[240px]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map(order => (
                <>
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {order.orderItems[0]?.productName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border text-[10px] ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border text-[10px] ${paymentStatusColors[order.paymentStatus] || ''}`}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => toggleExpand(order.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                        {expandedId === order.id ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === order.id && (
                    <TableRow key={`${order.id}-detail`}>
                      <TableCell colSpan={8} className="bg-muted/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Customer Info */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Customer</h4>
                            <div className="space-y-1.5 text-sm">
                              <div><span className="text-muted-foreground">Name:</span> {order.customerName}</div>
                              <div><span className="text-muted-foreground">Email:</span> {order.customerEmail}</div>
                              <div><span className="text-muted-foreground">Phone:</span> {order.customerPhone}</div>
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Delivery</h4>
                            <div className="space-y-1.5 text-sm">
                              <div><span className="text-muted-foreground">Method:</span> {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Courier'}</div>
                              {order.deliveryCounty && <div><span className="text-muted-foreground">County:</span> {order.deliveryCounty}</div>}
                              {order.deliveryAddress && <div><span className="text-muted-foreground">Address:</span> {order.deliveryAddress}</div>}
                              {order.courierPhone && <div><span className="text-muted-foreground">Courier Phone:</span> {order.courierPhone}</div>}
                              {order.trackingNumber && <div><span className="text-muted-foreground">Tracking #:</span> {order.trackingNumber}</div>}
                              <div><span className="text-muted-foreground">Status:</span> {order.deliveryStatus}</div>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Payment</h4>
                            <div className="space-y-1.5 text-sm">
                              <div><span className="text-muted-foreground">Method:</span> {order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod}</div>
                              {order.mpesaPhone && <div><span className="text-muted-foreground">M-Pesa Phone:</span> {order.mpesaPhone}</div>}
                              <div><span className="text-muted-foreground">Status:</span></div>
                              <Badge variant="outline" className={`border text-[10px] ${paymentStatusColors[order.paymentStatus] || ''}`}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Order Items */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Order Items</h4>
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Condition</TableHead>
                                  <TableHead className="text-right">Qty</TableHead>
                                  <TableHead className="text-right">Unit Price</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.orderItems.map(item => (
                                  <TableRow key={item.id}>
                                    <TableCell className="text-sm">{item.productName}</TableCell>
                                    <TableCell>
                                      {item.condition && (
                                        <Badge variant="secondary" className="text-[10px] capitalize">{item.condition.replace('_', ' ')}</Badge>
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
                          <div className="mt-2 text-right text-sm space-y-0.5">
                            <div><span className="text-muted-foreground">Subtotal:</span> {formatPrice(order.subtotal)}</div>
                            {order.deliveryFee > 0 && <div><span className="text-muted-foreground">Delivery:</span> {formatPrice(order.deliveryFee)}</div>}
                            {order.discountAmount > 0 && <div><span className="text-muted-foreground">Discount:</span> -{formatPrice(order.discountAmount)}</div>}
                            <div className="font-bold">Total: {formatPrice(order.totalAmount)}</div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Status Update + Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Update Status</h4>
                            <div className="flex gap-2">
                              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                  <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id)}
                                disabled={updatingStatus === order.id}
                              >
                                {updatingStatus === order.id ? 'Updating...' : 'Update'}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Notes</h4>
                            <Textarea
                              className="min-h-[60px]"
                              value={updateNotes}
                              onChange={(e) => setUpdateNotes(e.target.value)}
                              placeholder="Add order notes..."
                            />
                            <Button
                              size="sm"
                      variant="outline"
                      onClick={() => handleNotesSave(order.id)}
                      disabled={savingNotes === order.id}
                    >
                      {savingNotes === order.id ? 'Saving...' : 'Save Notes'}
                    </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} orders)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {i > 0 && arr[i - 1] < p - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
