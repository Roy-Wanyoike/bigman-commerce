'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  FileEdit,
  Clock,
  Archive,
  CheckCircle2,
  Eye,
  ArrowRight,
  Loader2,
  ShoppingCart,
  DollarSign,
} from 'lucide-react'
import { formatPrice } from '@/lib/prices'

interface DashboardStats {
  total: number
  published: number
  draft: number
  underReview: number
  archived: number
}

interface ProductRow {
  id: string
  name: string
  slug: string
  basePrice: number
  status: string
  condition: string
  createdAt: string
  brand?: { name: string } | null
}

interface OrderRow {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  currency: string
  status: string
  paymentStatus: string
  deliveryStatus: string
  createdAt: string
  orderItems: unknown[]
}

interface ObservationRow {
  id: string
  productName: string | null
  productCategory: string | null
  observedPrice: number
  source: string
  observedDate: string
  condition: string | null
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  UNDER_REVIEW: 'bg-sky-100 text-sky-800 border-sky-200',
  APPROVED: 'bg-violet-100 text-violet-800 border-violet-200',
  UNPUBLISHED: 'bg-orange-100 text-orange-800 border-orange-200',
  ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
  IMPORTED: 'bg-slate-100 text-slate-600 border-slate-200',
}

const statusLabel: Record<string, string> = {
  IMPORTED: 'Imported',
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  UNPUBLISHED: 'Unpublished',
  ARCHIVED: 'Archived',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProducts, setRecentProducts] = useState<ProductRow[]>([])
  const [recentObservations, setRecentObservations] = useState<ObservationRow[]>([])
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, obsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/products?pageSize=100').then((r) => r.json()),
          fetch('/api/admin/observations?pageSize=5').then((r) => r.json()),
          fetch('/api/admin/orders?limit=100').then((r) => r.json()),
        ])

        const products = productsRes.products || []
        const observations = obsRes.observations || []
        const orders = ordersRes.orders || []

        const s: DashboardStats = {
          total: products.length,
          published: products.filter((p: ProductRow) => p.status === 'PUBLISHED').length,
          draft: products.filter((p: ProductRow) => p.status === 'DRAFT').length,
          underReview: products.filter((p: ProductRow) => p.status === 'UNDER_REVIEW').length,
          archived: products.filter((p: ProductRow) => p.status === 'ARCHIVED').length,
        }
        setStats(s)
        setRecentProducts(products.slice(0, 10))
        setRecentObservations(observations)
        setRecentOrders(orders.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Products', value: stats?.total ?? 0, icon: Package, color: 'text-slate-700', bg: 'bg-slate-50' },
    { label: 'Published', value: stats?.published ?? 0, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Draft', value: stats?.draft ?? 0, icon: FileEdit, color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'Pending Review', value: stats?.underReview ?? 0, icon: Clock, color: 'text-sky-700', bg: 'bg-sky-50' },
    { label: 'Archived', value: stats?.archived ?? 0, icon: Archive, color: 'text-gray-600', bg: 'bg-gray-50' },
  ]

  const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const pendingOrders = recentOrders.filter(o => o.status === 'PENDING').length
  const deliveredOrders = recentOrders.filter(o => o.status === 'DELIVERED').length

  const orderStatCards = [
    { label: 'Total Orders', value: recentOrders.length, icon: ShoppingCart, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Delivered', value: deliveredOrders, icon: CheckCircle2, color: 'text-violet-700', bg: 'bg-violet-50' },
  ]

  const orderStatusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }

  const paymentStatusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your product catalog and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <Icon className={`size-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Order Stats Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {orderStatCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <Icon className={`size-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Products</CardTitle>
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="ml-1 size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Condition</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{formatPrice(p.basePrice)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColor[p.status] || ''}
                      >
                        {statusLabel[p.status] || p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {p.condition}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Observations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Eye className="size-4" />
            Recent Market Price Observations
          </CardTitle>
          <Link href="/admin/observations">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="ml-1 size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentObservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No observations yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentObservations.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm">{o.productName || '—'}</TableCell>
                    <TableCell className="text-sm">{o.productCategory || '—'}</TableCell>
                    <TableCell className="text-sm font-medium">{formatPrice(o.observedPrice)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{o.source}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(o.observedDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="ml-1 size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{formatPrice(o.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={orderStatusColor[o.status] || ''}
                      >
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={paymentStatusColor[o.paymentStatus] || ''}
                      >
                        {o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
