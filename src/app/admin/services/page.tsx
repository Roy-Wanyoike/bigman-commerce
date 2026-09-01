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
  Wrench,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'
import { formatPrice } from '@/lib/prices'

interface ServiceItem {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  basePrice: number
  salePrice: number | null
  currency: string
  duration: string | null
  isActive: boolean
  sortOrder: number
  categoryId: string | null
  serviceType: string | null
  createdAt: string
  updatedAt: string
}

interface ServiceForm {
  name: string
  slug: string
  description: string
  shortDescription: string
  basePrice: string
  salePrice: string
  duration: string
  isActive: boolean
  sortOrder: number
  serviceType: string
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  REPAIR: 'Repair',
  UPGRADE: 'Upgrade',
  INSTALLATION: 'Installation',
  RECOVERY: 'Recovery',
  SUPPORT: 'Support',
}

const SERVICE_TYPE_COLORS: Record<string, string> = {
  REPAIR: 'bg-orange-100 text-orange-700 border-orange-200',
  UPGRADE: 'bg-sky-100 text-sky-700 border-sky-200',
  INSTALLATION: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  RECOVERY: 'bg-rose-100 text-rose-700 border-rose-200',
  SUPPORT: 'bg-violet-100 text-violet-700 border-violet-200',
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const emptyForm: ServiceForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  basePrice: '',
  salePrice: '',
  duration: '',
  isActive: true,
  sortOrder: 0,
  serviceType: '',
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  function loadServices() {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/admin/services${params}`)
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadServices()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  function openCreateDialog() {
    setEditingService(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(service: ServiceItem) {
    setEditingService(service)
    setForm({
      name: service.name,
      slug: service.slug,
      description: service.description || '',
      shortDescription: service.shortDescription || '',
      basePrice: String(service.basePrice),
      salePrice: service.salePrice ? String(service.salePrice) : '',
      duration: service.duration || '',
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      serviceType: service.serviceType || '',
    })
    setDialogOpen(true)
  }

  function handleNameChange(value: string) {
    const newSlug = editingService ? form.slug : generateSlug(value)
    setForm((p) => ({ ...p, name: value, slug: newSlug }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.basePrice) {
      alert('Name and base price are required.')
      return
    }
    setSubmitting(true)
    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services'
      const method = editingService ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice) || 0,
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          slug: form.slug || undefined,
          description: form.description || null,
          shortDescription: form.shortDescription || null,
          duration: form.duration || null,
          serviceType: form.serviceType || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Operation failed')
        return
      }

      setDialogOpen(false)
      loadServices()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete service')
        return
      }
      setDeleteTarget(null)
      loadServices()
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="size-5" />
            Services
          </h1>
          <p className="text-muted-foreground">Manage repair, upgrade, and support services.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4 mr-1" /> Add Service
        </Button>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">All Services</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : services.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {search ? 'No services match your search.' : 'No services yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Sort</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{service.name}</span>
                          {service.shortDescription && (
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {service.shortDescription}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {service.serviceType ? (
                          <Badge
                            variant="outline"
                            className={`text-xs ${SERVICE_TYPE_COLORS[service.serviceType] || ''}`}
                          >
                            {SERVICE_TYPE_LABELS[service.serviceType] || service.serviceType}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{formatPrice(service.basePrice)}</span>
                          {service.salePrice && service.salePrice < service.basePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(service.salePrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {service.duration || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            service.isActive
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {service.sortOrder}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(service)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
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
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Create Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update service details.'
                : 'Add a new service to your store.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="svc-name">Name *</Label>
                <Input
                  id="svc-name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Screen Replacement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-slug">Slug *</Label>
                <Input
                  id="svc-slug"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. screen-replacement"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="svc-type">Service Type</Label>
                <Select
                  value={form.serviceType}
                  onValueChange={(v) => setForm((p) => ({ ...p, serviceType: v }))}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="REPAIR">Repair</SelectItem>
                    <SelectItem value="UPGRADE">Upgrade</SelectItem>
                    <SelectItem value="INSTALLATION">Installation</SelectItem>
                    <SelectItem value="RECOVERY">Recovery</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-duration">Duration</Label>
                <Input
                  id="svc-duration"
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g. 1-2 hours"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="svc-price">Base Price (KSh) *</Label>
                <Input
                  id="svc-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-sale">Sale Price (KSh)</Label>
                <Input
                  id="svc-sale"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))}
                  placeholder="e.g. 4000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-short">Short Description</Label>
              <Input
                id="svc-short"
                value={form.shortDescription}
                onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
                placeholder="Brief one-liner shown in listings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-desc">Full Description</Label>
              <Textarea
                id="svc-desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Detailed service description..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="svc-sort">Sort Order</Label>
                <Input
                  id="svc-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="svc-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                  />
                  <Label htmlFor="svc-active" className="text-sm">Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin mr-1" />}
                {editingService ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="size-4 animate-spin mr-1" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
