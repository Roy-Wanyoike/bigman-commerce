'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Bell,
  Loader2,
  Check,
  X,
  TrendingDown,
  Package,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/prices'

type PriceAlert = {
  id: string
  productId: string
  userId: string | null
  customerEmail: string | null
  customerPhone: string | null
  targetPrice: number | null
  currentPrice: number | null
  status: string
  createdAt: string
  triggeredAt: string | null
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    thumbnail: string | null
  }
}

type StockAlert = {
  id: string
  productId: string
  userId: string | null
  customerEmail: string | null
  customerPhone: string | null
  status: string
  createdAt: string
  triggeredAt: string | null
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    thumbnail: string | null
  }
}

type AlertTab = 'price' | 'stock'

type StatusFilter = 'all' | string

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  WAITING: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  TRIGGERED: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  CANCELLED: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  WAITING: 'Waiting',
  TRIGGERED: 'Triggered',
  CANCELLED: 'Cancelled',
}

export default function AdminAlertsPage() {
  const [activeTab, setActiveTab] = useState<AlertTab>('price')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: activeTab })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const res = await fetch(`/api/admin/alerts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPriceAlerts(data.priceAlerts || [])
      setStockAlerts(data.stockAlerts || [])
    } catch {
      setPriceAlerts([])
      setStockAlerts([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, statusFilter])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleStatusUpdate = async (type: string, id: string, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      const confirmed = window.confirm('Are you sure you want to cancel this alert?')
      if (!confirmed) return
    }

    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/alerts/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      fetchAlerts()
    } catch {
      // Silently refetch on success
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const currentAlerts = activeTab === 'price' ? priceAlerts : stockAlerts
  const totalCount = activeTab === 'price' ? priceAlerts.length : stockAlerts.length

  const priceStatuses = ['all', 'ACTIVE', 'TRIGGERED', 'CANCELLED']
  const stockStatuses = ['all', 'WAITING', 'TRIGGERED', 'CANCELLED']
  const currentStatuses = activeTab === 'price' ? priceStatuses : stockStatuses

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="size-6" />
            Alerts Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalCount} alert{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        <button
          onClick={() => { setActiveTab('price'); setStatusFilter('all') }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'price'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="size-4" />
          Price Alerts
          {priceAlerts.length > 0 && (
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {priceAlerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('stock'); setStatusFilter('all') }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'stock'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="size-4" />
          Stock Alerts
          {stockAlerts.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {stockAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {currentStatuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
              statusFilter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? 'All' : statusLabels[s] || s}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Loading alerts...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && currentAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Bell className="size-12 mb-3 text-slate-300" />
          <p className="text-sm">No {activeTab} alerts found</p>
        </div>
      )}

      {/* Alerts table */}
      {!loading && currentAlerts.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Contact</th>
                  {activeTab === 'price' && (
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Target / Current</th>
                  )}
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeTab === 'price'
                  ? priceAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{alert.product.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{alert.product.slug}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700">{alert.customerEmail || alert.customerPhone || '—'}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-slate-900 font-medium">
                            {alert.targetPrice ? formatPrice(alert.targetPrice) : 'Any drop'}
                          </div>
                          <div className="text-xs text-slate-400">
                            Current: {alert.currentPrice ? formatPrice(alert.currentPrice) : formatPrice(alert.product.basePrice)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[alert.status] || ''}>
                            {statusLabels[alert.status] || alert.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(alert.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {alert.status !== 'TRIGGERED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleStatusUpdate('price', alert.id, 'TRIGGERED')}
                                disabled={actionLoading === alert.id}
                              >
                                {actionLoading === alert.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3" />
                                )}
                                Mark Triggered
                              </Button>
                            )}
                            {alert.status !== 'CANCELLED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleStatusUpdate('price', alert.id, 'CANCELLED')}
                                disabled={actionLoading === alert.id}
                              >
                                {actionLoading === alert.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <X className="size-3" />
                                )}
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  : stockAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{alert.product.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{alert.product.slug}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700">{alert.customerEmail || alert.customerPhone || '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[alert.status] || ''}>
                            {statusLabels[alert.status] || alert.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(alert.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {alert.status !== 'TRIGGERED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleStatusUpdate('stock', alert.id, 'TRIGGERED')}
                                disabled={actionLoading === alert.id}
                              >
                                {actionLoading === alert.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3" />
                                )}
                                Mark Triggered
                              </Button>
                            )}
                            {alert.status !== 'CANCELLED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleStatusUpdate('stock', alert.id, 'CANCELLED')}
                                disabled={actionLoading === alert.id}
                              >
                                {actionLoading === alert.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <X className="size-3" />
                                )}
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
