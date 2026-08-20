'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from 'lucide-react'
import { formatPrice } from '@/lib/prices'

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  REFURBISHED: 'Refurbished',
  USED: 'Used',
  OPEN_BOX: 'Open Box',
}

interface Observation {
  id: string
  productName: string | null
  productCategory: string | null
  observedPrice: number
  source: string
  observedDate: string
  condition: string | null
  notes: string | null
  url: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  level: number
  children?: Category[]
}

function flattenCategories(nodes: Category[], prefix = ''): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const node of nodes) {
    const label = prefix ? `${prefix} > ${node.name}` : node.name
    result.push({ id: node.id, name: label })
    if (node.children?.length) result.push(...flattenCategories(node.children, label))
  }
  return result
}

function AdminObservationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [observations, setObservations] = useState<Observation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  // Form state
  const [form, setForm] = useState({
    source: '',
    productName: '',
    productCategory: '',
    observedPrice: '',
    observedDate: new Date().toISOString().split('T')[0],
    condition: '',
    notes: '',
    url: '',
  })

  const page = parseInt(searchParams.get('page') || '1')
  const source = searchParams.get('source') || ''
  const category = searchParams.get('category') || ''
  const pageSize = 20

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      if (key !== 'page') params.set('page', '1')
      router.push(`/admin/observations?${params.toString()}`)
    },
    [router, searchParams]
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        if (source) params.set('source', source)
        if (category) params.set('category', category)

        const [obsRes, catsRes] = await Promise.all([
          fetch(`/api/admin/observations?${params.toString()}`).then((r) => r.json()),
          fetch('/api/admin/categories').then((r) => r.json()),
        ])

        setObservations(obsRes.observations || [])
        setTotal(obsRes.total || 0)
        setAllCategories(catsRes.categories || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, source, category])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.source || !form.observedPrice || !form.observedDate) {
      alert('Source, price, and date are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          observedPrice: parseFloat(form.observedPrice),
          productCategory: form.productCategory || null,
          condition: form.condition || null,
          url: form.url || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to create observation')
        return
      }
      setShowForm(false)
      setForm({
        source: '', productName: '', productCategory: '', observedPrice: '',
        observedDate: new Date().toISOString().split('T')[0], condition: '', notes: '', url: '',
      })
      // Reload
      const params = new URLSearchParams(searchParams.toString())
      const obsRes = await fetch(`/api/admin/observations?${params.toString()}`).then((r) => r.json())
      setObservations(obsRes.observations || [])
      setTotal(obsRes.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)
  const flatCategories = flattenCategories(allCategories)

  // Collect unique sources from observations
  const sources = Array.from(new Set(observations.map((o) => o.source))).sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="size-5" />
            Market Price Observations
          </h1>
          <p className="text-muted-foreground">Track competitor and market pricing data. {total} observations.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1" /> {showForm ? 'Cancel' : 'New Observation'}
        </Button>
      </div>

      {/* Add Observation Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New Observation</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="obs-source">Source *</Label>
                  <Input
                    id="obs-source"
                    value={form.source}
                    onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
                    placeholder="e.g. Jiji, Pigiame, WhatsApp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs-product">Product Name</Label>
                  <Input
                    id="obs-product"
                    value={form.productName}
                    onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs-price">Observed Price (KSh) *</Label>
                  <Input
                    id="obs-price"
                    type="number"
                    step="0.01"
                    value={form.observedPrice}
                    onChange={(e) => setForm((p) => ({ ...p, observedPrice: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs-date">Date *</Label>
                  <Input
                    id="obs-date"
                    type="date"
                    value={form.observedDate}
                    onChange={(e) => setForm((p) => ({ ...p, observedDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.productCategory || '_none'}
                    onValueChange={(v) => setForm((p) => ({ ...p, productCategory: v === '_none' ? '' : v }))}
                  >
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {flatCategories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={form.condition || '_none'}
                    onValueChange={(v) => setForm((p) => ({ ...p, condition: v === '_none' ? '' : v }))}
                  >
                    <SelectTrigger className="w-full"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Any</SelectItem>
                      {Object.entries(conditionLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs-url">Source URL</Label>
                <Input
                  id="obs-url"
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs-notes">Notes</Label>
                <Textarea
                  id="obs-notes"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save Observation
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={source || '_all'} onValueChange={(v) => updateParam('source', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category || '_all'} onValueChange={(v) => updateParam('category', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            {flatCategories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="hidden md:table-cell">Condition</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : observations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No observations found.
                </TableCell>
              </TableRow>
            ) : (
              observations.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{o.productName || '—'}</div>
                    {o.url && (
                      <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block max-w-[200px]">
                        {o.url}
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {o.productCategory || '—'}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{formatPrice(o.observedPrice)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{o.source}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {o.condition ? (
                      <Badge variant="outline" className="text-xs">{conditionLabels[o.condition] || o.condition}</Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {new Date(o.observedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {o.notes || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => updateParam('page', String(page + 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminObservationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <AdminObservationsContent />
    </Suspense>
  )
}
