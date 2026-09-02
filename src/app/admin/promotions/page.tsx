'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tag,
  Plus,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react'

interface Promotion {
  id: string
  name: string
  slug: string
  description: string | null
  discountType: string
  discountValue: number | null
  startDate: string
  endDate: string | null
  isActive: boolean
  promoType: string
  createdAt: string
  updatedAt: string
}

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'] as const
const PROMO_TYPES = ['DEAL', 'CLEARANCE', 'FLASH_SALE', 'BUNDLE'] as const

const promoTypeLabels: Record<string, string> = {
  DEAL: 'Deal',
  CLEARANCE: 'Clearance',
  FLASH_SALE: 'Flash Sale',
  BUNDLE: 'Bundle',
}

const discountTypeLabels: Record<string, string> = {
  PERCENTAGE: 'Percentage',
  FIXED_AMOUNT: 'Fixed Amount',
  BUNDLE: 'Bundle',
}

const defaultForm = {
  name: '',
  slug: '',
  description: '',
  discountType: 'PERCENTAGE' as string,
  discountValue: '' as string,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  isActive: true,
  promoType: 'DEAL' as string,
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(defaultForm)

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function loadPromotions() {
    setLoading(true)
    fetch('/api/admin/promotions')
      .then((r) => r.json())
      .then((data) => setPromotions(data.promotions || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...defaultForm,
      startDate: new Date().toISOString().split('T')[0],
    })
    setDialogOpen(true)
  }

  function openEdit(promo: Promotion) {
    setEditingId(promo.id)
    setForm({
      name: promo.name,
      slug: promo.slug,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue != null ? String(promo.discountValue) : '',
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
      isActive: promo.isActive,
      promoType: promo.promoType,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.slug) {
      alert('Name and coupon code are required.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        discountType: form.discountType,
        discountValue: form.discountValue ? parseFloat(form.discountValue) : null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        isActive: form.isActive,
        promoType: form.promoType,
      }

      const url = editingId
        ? `/api/admin/promotions/${editingId}`
        : '/api/admin/promotions'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to save promotion')
        return
      }

      setDialogOpen(false)
      loadPromotions()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/promotions/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete promotion')
        return
      }
      setDeleteId(null)
      loadPromotions()
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="size-5" />
            Promotions
          </h1>
          <p className="text-muted-foreground">Manage coupon codes and promotional offers.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" /> Add Promotion
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Promotions</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : promotions.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No promotions yet. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="hidden sm:table-cell">Discount</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Start</TableHead>
                    <TableHead className="hidden lg:table-cell">End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{promo.name}</p>
                          {promo.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{promo.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{promo.slug}</code>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {promo.discountValue != null ? (
                          <span className="text-sm font-medium">
                            {promo.discountType === 'PERCENTAGE'
                              ? `${promo.discountValue}%`
                              : `KSh ${promo.discountValue.toLocaleString()}`}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {promoTypeLabels[promo.promoType] || promo.promoType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(promo.startDate)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {promo.endDate ? formatDate(promo.endDate) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            promo.isActive
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }
                        >
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(promo)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(promo.id)}>
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the promotion details below.'
                : 'Create a new coupon code or promotional offer.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="promo-name">Name *</Label>
                <Input
                  id="promo-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Holiday Sale"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-slug">Coupon Code *</Label>
                <Input
                  id="promo-slug"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SAVE10"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-desc">Description</Label>
              <Textarea
                id="promo-desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of this promotion..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => setForm((p) => ({ ...p, discountType: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {discountTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-value">Discount Value</Label>
                <Input
                  id="promo-value"
                  type="number"
                  min="0"
                  step="any"
                  value={form.discountValue}
                  onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                  placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 500'}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="promo-start">Start Date *</Label>
                <Input
                  id="promo-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-end">End Date</Label>
                <Input
                  id="promo-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                />
                <p className="text-[11px] text-muted-foreground">Leave empty for no end date.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Promo Type</Label>
                <Select
                  value={form.promoType}
                  onValueChange={(v) => setForm((p) => ({ ...p, promoType: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROMO_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {promoTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="promo-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                  />
                  <Label htmlFor="promo-active" className="text-sm">Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this promotion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
