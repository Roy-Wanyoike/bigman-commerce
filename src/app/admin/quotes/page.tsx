'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/prices'

type QuoteItem = {
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type Quote = {
  quoteId: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  kraPin: string
  businessType: string
  status: string
  requestedAt: string
  validUntil: string
  deliveryCounty: string
  deliveryAddress: string
  notes: string
  items: QuoteItem[]
  subtotal: number
  discountPercent: number
  discountAmount: number
  deliveryFee: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  currency: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  APPROVED: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  REJECTED: 'bg-red-100 text-red-700 hover:bg-red-100',
  DRAFT: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  EXPIRED: 'bg-slate-200 text-slate-500 hover:bg-slate-200',
  CONVERTED: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/quotes')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch {
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="size-6" />
            B2B Quotes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {quotes.length} quote{quotes.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <Separator />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Loading quotes...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && quotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FileText className="size-12 mb-3 text-slate-300" />
          <p className="text-sm">No B2B quotes found</p>
        </div>
      )}

      {/* Quotes list */}
      {!loading && quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((quote) => {
            const isExpanded = expandedId === quote.quoteId
            return (
              <Card key={quote.quoteId}>
                <CardContent className="p-0">
                  {/* Header row - clickable */}
                  <button
                    onClick={() => toggleExpand(quote.quoteId)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">
                          {quote.quoteId}
                        </span>
                        <Badge className={statusColors[quote.status] || statusColors.DRAFT}>
                          {quote.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {quote.businessType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Building2 className="size-3.5" />
                          {quote.companyName}
                        </span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hidden sm:inline">{quote.contactName}</span>
                        <span className="hidden md:inline">|</span>
                        <span className="hidden md:inline flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {quote.deliveryCounty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          Requested: {formatDate(quote.requestedAt)}
                        </span>
                        <span>{quote.items.length} item{quote.items.length !== 1 ? 's' : ''}</span>
                        <span className="font-semibold text-slate-700">
                          Total: {formatPrice(quote.totalAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="size-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <>
                      <Separator />
                      <div className="px-5 py-4 space-y-5">
                        {/* Contact & Delivery Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Company</p>
                            <p className="text-sm font-medium text-slate-900">{quote.companyName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{quote.businessType} {quote.kraPin && `· KRA PIN: ${quote.kraPin}`}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                            <p className="text-sm font-medium text-slate-900">{quote.contactName}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="size-3" /> {quote.contactEmail}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="size-3" /> {quote.contactPhone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Delivery</p>
                            <p className="text-sm text-slate-700">{quote.deliveryAddress}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Valid until: {formatDate(quote.validUntil)}</p>
                          </div>
                        </div>

                        {/* Notes */}
                        {quote.notes && (
                          <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-amber-800">{quote.notes}</p>
                          </div>
                        )}

                        {/* Line Items */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Line Items</p>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-slate-50">
                                  <TableHead className="text-xs">Product</TableHead>
                                  <TableHead className="text-xs text-right">Qty</TableHead>
                                  <TableHead className="text-xs text-right">Unit Price</TableHead>
                                  <TableHead className="text-xs text-right">Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {quote.items.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="text-sm">
                                      <div className="font-medium text-slate-900">{item.productName}</div>
                                      <div className="text-xs text-slate-400">{item.sku}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-sm text-right">{formatPrice(item.unitPrice)}</TableCell>
                                    <TableCell className="text-sm text-right font-medium">{formatPrice(item.subtotal)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                          <div className="w-full max-w-xs space-y-1.5 text-sm">
                            <div className="flex justify-between text-slate-600">
                              <span>Subtotal</span>
                              <span>{formatPrice(quote.subtotal)}</span>
                            </div>
                            {quote.discountPercent > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount ({quote.discountPercent}%)</span>
                                <span>-{formatPrice(quote.discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                              <span>Delivery</span>
                              <span>{formatPrice(quote.deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>VAT ({quote.taxRate}%)</span>
                              <span>{formatPrice(quote.taxAmount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-slate-900 text-base">
                              <span>Total</span>
                              <span>{formatPrice(quote.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
