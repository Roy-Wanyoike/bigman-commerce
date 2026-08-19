'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  CheckCircle2,
  Globe,
  Ban,
  Archive,
} from 'lucide-react'
import { formatPrice } from '@/lib/prices'

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

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  REFURBISHED: 'Refurbished',
  USED: 'Used',
  OPEN_BOX: 'Open Box',
  CLEARANCE: 'Clearance',
}

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  status: string
  condition: string
  createdAt: string
  brand?: { id: string; name: string } | null
  categories: { category: { id: string; name: string; slug: string } }[]
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  IMPORTED: ['DRAFT'],
  DRAFT: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'DRAFT'],
  PUBLISHED: ['UNPUBLISHED'],
  UNPUBLISHED: ['PUBLISHED', 'ARCHIVED', 'DRAFT'],
  ARCHIVED: ['DRAFT'],
}

const statusActions: Record<string, { action: string; label: string; icon: React.ElementType; variant: 'default' | 'destructive' }[]> = {
  IMPORTED: [{ action: 'draft', label: 'Move to Draft', icon: Pencil, variant: 'default' }],
  DRAFT: [{ action: 'review', label: 'Send to Review', icon: Send, variant: 'default' }],
  UNDER_REVIEW: [
    { action: 'approve', label: 'Approve', icon: CheckCircle2, variant: 'default' },
    { action: 'draft', label: 'Back to Draft', icon: Pencil, variant: 'default' },
  ],
  APPROVED: [
    { action: 'publish', label: 'Publish', icon: Globe, variant: 'default' },
    { action: 'draft', label: 'Back to Draft', icon: Pencil, variant: 'default' },
  ],
  PUBLISHED: [{ action: 'unpublish', label: 'Unpublish', icon: Ban, variant: 'default' }],
  UNPUBLISHED: [
    { action: 'publish', label: 'Republish', icon: Globe, variant: 'default' },
    { action: 'archive', label: 'Archive', icon: Archive, variant: 'destructive' },
    { action: 'draft', label: 'Back to Draft', icon: Pencil, variant: 'default' },
  ],
  ARCHIVED: [],
}

function AdminProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const page = parseInt(searchParams.get('page') || '1')
  const status = searchParams.get('status') || ''
  const condition = searchParams.get('condition') || ''
  const q = searchParams.get('q') || ''
  const pageSize = 20

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      if (key !== 'page') params.set('page', '1')
      router.push(`/admin/products?${params.toString()}`)
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
        if (status) params.set('status', status)
        if (condition) params.set('condition', condition)
        if (q) params.set('q', q)

        const res = await fetch(`/api/admin/products?${params.toString()}`)
        const data = await res.json()
        setProducts(data.products || [])
        setTotal(data.total || 0)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, status, condition, q])

  const totalPages = Math.ceil(total / pageSize)

  async function handleStatusAction(product: Product, action: string) {
    setActionLoading(product.id)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to update status')
        return
      }
      // Refresh list
      const params = new URLSearchParams(searchParams.toString())
      const refresh = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await refresh.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.id)
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to archive product')
        return
      }
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      // Refresh
      const params = new URLSearchParams(searchParams.toString())
      const refresh = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await refresh.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog. {total} total products.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="size-4 mr-1" /> New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => updateParam('status', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
            <SelectItem value="IMPORTED">Imported</SelectItem>
          </SelectContent>
        </Select>
        <Select value={condition} onValueChange={(v) => updateParam('condition', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Conditions</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="REFURBISHED">Refurbished</SelectItem>
            <SelectItem value="USED">Used</SelectItem>
            <SelectItem value="OPEN_BOX">Open Box</SelectItem>
            <SelectItem value="CLEARANCE">Clearance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Brand</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden lg:table-cell">Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {p.brand?.name || '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {p.categories.length > 0
                      ? p.categories.map((c) => c.category.name).join(', ')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatPrice(p.basePrice)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {conditionLabels[p.condition] || p.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[p.status] || ''}>
                      {statusLabel[p.status] || p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${p.id}`}>
                            <Eye className="size-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil className="size-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        {(statusActions[p.status] || []).length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            {(statusActions[p.status] || []).map((sa) => {
                              const Icon = sa.icon
                              return (
                                <DropdownMenuItem
                                  key={sa.action}
                                  onClick={() => handleStatusAction(p, sa.action)}
                                  disabled={actionLoading === p.id}
                                  variant={sa.variant}
                                >
                                  <Icon className="size-4" /> {sa.label}
                                </DropdownMenuItem>
                              )
                            })}
                          </>
                        )}
                        {p.status !== 'ARCHIVED' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteTarget(p)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="size-4" /> Archive
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParam('page', String(page + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete/Archive Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;{deleteTarget?.name}&quot;? This will change the
              product status to Archived.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading !== null}>
              {actionLoading ? <Loader2 className="size-4 animate-spin" /> : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <AdminProductsContent />
    </Suspense>
  )
}
