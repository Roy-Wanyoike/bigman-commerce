'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Loader2,
  Send,
  CheckCircle2,
  Globe,
  Ban,
  Archive,
  Plus,
  Trash2,
  Check,
  X,
  ImageIcon,
  Tag,
  Package,
  AlertTriangle,
  Star,
  Upload,
  Search,
  Eye,
  StarOff,
  Pencil,
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

const gradeLabels: Record<string, string> = {
  A_PLUS: 'A+',
  A: 'A',
  B_PLUS: 'B+',
  B: 'B',
  C: 'C',
}

// Publish flow: DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED
const publishFlow: Record<string, string> = {
  IMPORTED: 'DRAFT',
  DRAFT: 'UNDER_REVIEW',
  UNDER_REVIEW: 'APPROVED',
  APPROVED: 'PUBLISHED',
}

interface Brand {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductImage {
  id: string
  url: string
  originalUrl: string | null
  thumbnailUrl: string | null
  altText: string | null
  caption: string | null
  imageType: string | null
  status: string
  isPrimary: boolean
  sortOrder: number
  source: string | null
  sourceUrl: string | null
  licenseStatus: string | null
  width: number | null
  height: number | null
  mimeType: string | null
  fileSize: number | null
  qualityScore: number | null
  rejectionReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
}

interface PriceHistoryEntry {
  id: string
  previousPrice: number | null
  newPrice: number
  priceField: string
  reason: string | null
  createdAt: string
}

interface ProductData {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  brandId: string | null
  businessUnitId: string | null
  condition: string
  conditionGrade: string | null
  conditionNote: string | null
  basePrice: number
  salePrice: number | null
  costPrice: number | null
  compareAtPrice: number | null
  wholesalePrice: number | null
  corporatePrice: number | null
  bundlePrice: number | null
  currency: string
  productType: string
  specifications: string | null
  thumbnail: string | null
  videoUrl: string | null
  trackInventory: boolean
  stockCount: number
  lowStockThreshold: number
  warrantyMonths: number | null
  warrantyInfo: string | null
  status: string
  isFeatured: boolean
  isDeal: boolean
  isGaming: boolean
  dealLabel: string | null
  compatibleModels: string | null
  sku: string | null
  partNumber: string | null
  upc: string | null
  lastVerifiedAt: string | null
  verifiedBy: string | null
  verifiedPrice: number | null
  seoTitle: string | null
  seoDescription: string | null
  metaKeywords: string | null
  brand: Brand | null
  categories: { categoryId: string; category: Category }[]
  productImages: ProductImage[]
  priceHistory: PriceHistoryEntry[]
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

// Flat list of all categories for multi-select
interface FlatCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  level: number
  children?: FlatCategory[]
}

function flattenCategories(nodes: FlatCategory[], prefix = ''): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const node of nodes) {
    const label = prefix ? `${prefix} > ${node.name}` : node.name
    result.push({ id: node.id, name: label })
    if (node.children?.length) {
      result.push(...flattenCategories(node.children, label))
    }
  }
  return result
}

function getStockInfo(stockCount: number, lowStockThreshold: number, trackInventory: boolean) {
  if (!trackInventory) return { label: 'Not Tracked', color: 'text-muted-foreground', bg: 'bg-gray-50' }
  if (stockCount <= 0) return { label: 'Out of Stock', color: 'text-red-700', bg: 'bg-red-50' }
  if (stockCount <= lowStockThreshold) return { label: 'Low Stock', color: 'text-amber-700', bg: 'bg-amber-50' }
  return { label: 'In Stock', color: 'text-emerald-700', bg: 'bg-emerald-50' }
}

export default function AdminProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [archiving, setArchiving] = useState(false)

  // All categories for selector
  const [allCategories, setAllCategories] = useState<FlatCategory[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])

  // Form state
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

  // Category search
  const [catSearch, setCatSearch] = useState('')

  // Delete/Archive dialog
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

  // Image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [newImageType, setNewImageType] = useState('OTHER')

  // Upload states
  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Image preview dialog
  const [previewImage, setPreviewImage] = useState<ProductImage | null>(null)

  // Editing alt text
  const [editingAltId, setEditingAltId] = useState<string | null>(null)
  const [editingAltText, setEditingAltText] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catsRes, brandsRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`).then((r) => r.json()),
          fetch('/api/admin/categories').then((r) => r.json()),
          fetch('/api/admin/products?pageSize=1').then((r) => r.json()),
        ])

        const p = prodRes.product
        if (!p) {
          setLoading(false)
          return
        }
        setProduct(p)

        // Initialize form
        setForm({
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          brandId: p.brandId || '',
          condition: p.condition,
          conditionGrade: p.conditionGrade || '',
          conditionNote: p.conditionNote || '',
          basePrice: p.basePrice,
          salePrice: p.salePrice || '',
          costPrice: p.costPrice || '',
          compareAtPrice: p.compareAtPrice || '',
          wholesalePrice: p.wholesalePrice || '',
          corporatePrice: p.corporatePrice || '',
          bundlePrice: p.bundlePrice || '',
          trackInventory: p.trackInventory,
          stockCount: p.stockCount,
          lowStockThreshold: p.lowStockThreshold,
          warrantyMonths: p.warrantyMonths || '',
          warrantyInfo: p.warrantyInfo || '',
          isFeatured: p.isFeatured,
          isDeal: p.isDeal,
          isGaming: p.isGaming,
          dealLabel: p.dealLabel || '',
          sku: p.sku || '',
          partNumber: p.partNumber || '',
          compatibleModels: p.compatibleModels || '',
          seoTitle: p.seoTitle || '',
          seoDescription: p.seoDescription || '',
          metaKeywords: p.metaKeywords || '',
        })

        setSelectedCategories(p.categories.map((c: { categoryId: string }) => c.categoryId))

        // Parse specs
        try {
          const parsed = p.specifications ? JSON.parse(p.specifications) : {}
          setSpecs(Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) })))
        } catch {
          setSpecs([])
        }

        // Set categories & brands
        setAllCategories(catsRes.categories || [])

        // Extract unique brands from the products list or use the product's brand
        const brandsData = brandsRes.products || []
        const brandSet = new Map<string, Brand>()
        if (p.brand) brandSet.set(p.brand.id, p.brand)
        brandsData.forEach((bp: { brand?: Brand | null }) => {
          if (bp.brand) brandSet.set(bp.brand.id, bp.brand)
        })
        setAllBrands(Array.from(brandSet.values()).sort((a, b) => a.name.localeCompare(b.name)))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const updateField = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  async function handleSave() {
    if (!product) return
    setSaving(true)
    try {
      const specsObj: Record<string, string> = {}
      specs.forEach((s) => {
        if (s.key.trim()) specsObj[s.key.trim()] = s.value
      })

      const body = {
        ...form,
        basePrice: form.basePrice,
        salePrice: form.salePrice || null,
        costPrice: form.costPrice || null,
        compareAtPrice: form.compareAtPrice || null,
        wholesalePrice: form.wholesalePrice || null,
        corporatePrice: form.corporatePrice || null,
        bundlePrice: form.bundlePrice || null,
        warrantyMonths: form.warrantyMonths || null,
        dealLabel: form.dealLabel || null,
        categoryIds: selectedCategories,
        specifications: Object.keys(specsObj).length > 0 ? specsObj : null,
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to save product')
        return
      }

      const data = await res.json()
      setProduct(data.product)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusAction(action: string) {
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to update status')
        return
      }
      const data = await res.json()
      setProduct((prev) => prev ? { ...prev, status: data.product.status } : prev)
    } catch (e) {
      console.error(e)
    } finally {
      setStatusLoading(false)
    }
  }

  // Quick publish flow: advance one step
  async function handleQuickPublish() {
    if (!product) return
    const nextStatus = publishFlow[product.status]
    if (!nextStatus) {
      alert('This product is already published or cannot be advanced further.')
      return
    }
    const actionMap: Record<string, string> = {
      DRAFT: 'review',
      UNDER_REVIEW: 'approve',
      APPROVED: 'publish',
    }
    const action = actionMap[product.status]
    if (action) {
      await handleStatusAction(action)
    }
  }

  async function handleArchive() {
    if (!product) return
    setArchiving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to archive product')
        return
      }
      setArchiveDialogOpen(false)
      const data = await res.json()
      setProduct((prev) => prev ? { ...prev, status: data.product.status } : prev)
    } catch (e) {
      console.error(e)
    } finally {
      setArchiving(false)
    }
  }

  async function handleAddImage() {
    if (!newImageUrl.trim()) return
    try {
      const res = await fetch(`/api/admin/products/${id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newImageUrl.trim(),
          altText: newImageAlt.trim() || null,
          imageType: newImageType || 'OTHER',
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to add image')
        return
      }
      // Reload product
      const prodRes = await fetch(`/api/admin/products/${id}`).then((r) => r.json())
      if (prodRes.product) setProduct(prodRes.product)
      setNewImageUrl('')
      setNewImageAlt('')
      setImageDialogOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleImageAction(imageId: string, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/admin/products/${id}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to update image')
        return
      }
      const prodRes = await fetch(`/api/admin/products/${id}`).then((r) => r.json())
      if (prodRes.product) setProduct(prodRes.product)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-primary' }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to set primary image')
        return
      }
      const prodRes = await fetch(`/api/admin/products/${id}`).then((r) => r.json())
      if (prodRes.product) setProduct(prodRes.product)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/products/${id}/images/${imageId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete image')
        return
      }
      const prodRes = await fetch(`/api/admin/products/${id}`).then((r) => r.json())
      if (prodRes.product) setProduct(prodRes.product)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const imageCount = product?.productImages?.length || 0
    const remaining = 5 - imageCount
    const filesToUpload = Array.from(files).slice(0, remaining)

    if (files.length > remaining) {
      alert(`Only ${remaining} more image(s) can be uploaded. ${files.length - remaining} file(s) skipped.`)
    }

    setUploading(true)
    for (const file of filesToUpload) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', id)
      formData.append('imageType', 'FRONT')
      formData.append('altText', product?.name || '')
      formData.append('isPrimary', String(imageCount === 0))

      try {
        const res = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const err = await res.json()
          alert(`Upload failed for ${file.name}: ${err.error}`)
          break
        }
      } catch {
        alert(`Upload failed for ${file.name}`)
        break
      }
    }
    setUploading(false)

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''

    // Reload product
    const prodRes = await fetch(`/api/admin/products/${id}`).then((r) => r.json())
    if (prodRes.product) setProduct(prodRes.product)
  }

  async function handleSaveAltText(imageId: string) {
    try {
      await fetch(`/api/admin/products/${id}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-alt', altText: editingAltText }),
      })
      const prodRes = await fetch(`/api/admin/products/${id}`).then((r) => r.json())
      if (prodRes.product) setProduct(prodRes.product)
    } catch (e) {
      console.error(e)
    }
    setEditingAltId(null)
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="size-4 mr-1" /> Back to Products
        </Button>
      </div>
    )
  }

  const flatCategories = flattenCategories(allCategories)
  const canAdvance = !!publishFlow[product.status]
  const nextStatusLabel = publishFlow[product.status]

  // Discount calculation
  const salePriceVal = form.salePrice ? parseFloat(form.salePrice as string) : null
  const basePriceVal = typeof form.basePrice === 'number' ? form.basePrice : parseFloat(form.basePrice as string) || 0
  const compareAtVal = form.compareAtPrice ? parseFloat(form.compareAtPrice as string) : null
  const discountPct = salePriceVal && salePriceVal > 0 && salePriceVal < basePriceVal
    ? Math.round(((basePriceVal - salePriceVal) / basePriceVal) * 100)
    : compareAtVal && compareAtVal > basePriceVal
      ? Math.round(((compareAtVal - basePriceVal) / compareAtVal) * 100)
      : null

  // Stock info
  const stockInfo = getStockInfo(
    form.stockCount as number,
    form.lowStockThreshold as number,
    form.trackInventory as boolean,
  )

  // Filter categories for search
  const filteredCats = flatCategories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()) &&
    !selectedCategories.includes(c.id)
  )

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="sticky top-0 z-10 bg-background border-b pb-4 -mt-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                <Badge variant="outline" className={statusColor[product.status] || ''}>
                  {statusLabel[product.status] || product.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">/{product.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </Button>
            {canAdvance && (
              <Button size="sm" onClick={handleQuickPublish} disabled={statusLoading}>
                {statusLoading ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
                Publish → {statusLabel[nextStatusLabel || '']}
              </Button>
            )}
            {product.status === 'PUBLISHED' && (
              <Button size="sm" variant="outline" onClick={() => handleStatusAction('unpublish')} disabled={statusLoading}>
                <Ban className="size-4" /> Unpublish
              </Button>
            )}
            {product.status !== 'ARCHIVED' && (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => handleStatusAction('archive')}
                disabled={statusLoading}
              >
                <Archive className="size-4" /> Archive
              </Button>
            )}
            {product.status !== 'ARCHIVED' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setArchiveDialogOpen(true)}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" value={(form.name as string) || ''} onChange={(e) => updateField('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={(form.slug as string) || ''} onChange={(e) => updateField('slug', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={(form.brandId as string) || '_none'} onValueChange={(v) => updateField('brandId', v === '_none' ? '' : v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">No Brand</SelectItem>
                      {allBrands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={(form.condition as string) || 'NEW'} onValueChange={(v) => updateField('condition', v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition Grade</Label>
                  <Select value={(form.conditionGrade as string) || '_none'} onValueChange={(v) => updateField('conditionGrade', v === '_none' ? '' : v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {Object.entries(gradeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Condition Note</Label>
                <Input value={(form.conditionNote as string) || ''} onChange={(e) => updateField('conditionNote', e.target.value)} placeholder="e.g. Minor scratches on lid" />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea value={(form.shortDescription as string) || ''} onChange={(e) => updateField('shortDescription', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea value={(form.description as string) || ''} onChange={(e) => updateField('description', e.target.value)} rows={5} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={(form.sku as string) || ''} onChange={(e) => updateField('sku', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Part Number</Label>
                  <Input value={(form.partNumber as string) || ''} onChange={(e) => updateField('partNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Compatible Models</Label>
                  <Input value={(form.compatibleModels as string) || ''} onChange={(e) => updateField('compatibleModels', e.target.value)} placeholder="Comma-separated slugs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle className="text-base">Pricing (KSh)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Base Price *</Label>
                  <Input type="number" step="0.01" value={form.basePrice as number || ''} onChange={(e) => updateField('basePrice', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price</Label>
                  <Input type="number" step="0.01" value={form.salePrice as string || ''} onChange={(e) => updateField('salePrice', e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price</Label>
                  <Input type="number" step="0.01" value={form.costPrice as string || ''} onChange={(e) => updateField('costPrice', e.target.value)} placeholder="Hidden from customers" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Compare At Price</Label>
                  <Input type="number" step="0.01" value={form.compareAtPrice as string || ''} onChange={(e) => updateField('compareAtPrice', e.target.value)} placeholder={'"Was" price'} />
                </div>
                <div className="space-y-2">
                  <Label>Wholesale Price</Label>
                  <Input type="number" step="0.01" value={form.wholesalePrice as string || ''} onChange={(e) => updateField('wholesalePrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Corporate Price</Label>
                  <Input type="number" step="0.01" value={form.corporatePrice as string || ''} onChange={(e) => updateField('corporatePrice', e.target.value)} />
                </div>
              </div>
              {/* Discount indicator */}
              {discountPct !== null && discountPct > 0 && (
                <div className="rounded-lg border bg-emerald-50 p-3 flex items-center gap-3">
                  <Tag className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">{discountPct}% Discount</p>
                    <p className="text-xs text-emerald-600">
                      {salePriceVal
                        ? `Sale ${formatPrice(salePriceVal)} vs Base ${formatPrice(basePriceVal)}`
                        : compareAtVal
                          ? `Now ${formatPrice(basePriceVal)} vs Was ${formatPrice(compareAtVal)}`
                          : ''}
                    </p>
                  </div>
                </div>
              )}
              {/* Verification info */}
              {product.lastVerifiedAt && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Price Verification</p>
                  <p className="text-sm">Verified: {new Date(product.lastVerifiedAt).toLocaleString()}</p>
                  {product.verifiedBy && <p className="text-sm text-muted-foreground">By: {product.verifiedBy}</p>}
                  {product.verifiedPrice && <p className="text-sm">Confirmed Price: {formatPrice(product.verifiedPrice)}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discount / Offer Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="size-4" /> Discounts & Offers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="edit-featured" className="cursor-pointer">Featured</Label>
                  <Switch id="edit-featured" checked={form.isFeatured as boolean} onCheckedChange={(v) => updateField('isFeatured', v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="edit-deal" className="cursor-pointer">Deal</Label>
                  <Switch id="edit-deal" checked={form.isDeal as boolean} onCheckedChange={(v) => updateField('isDeal', v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="edit-gaming" className="cursor-pointer">Gaming</Label>
                  <Switch id="edit-gaming" checked={form.isGaming as boolean} onCheckedChange={(v) => updateField('isGaming', v)} />
                </div>
              </div>
              {form.isDeal && (
                <div className="space-y-2">
                  <Label>Deal Label</Label>
                  <div className="flex gap-2">
                    <Select
                      value={(form.dealLabel as string) || '_custom'}
                      onValueChange={(v) => {
                        if (v !== '_custom') updateField('dealLabel', v)
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select preset..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_custom">Custom...</SelectItem>
                        <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                        <SelectItem value="Clearance">Clearance</SelectItem>
                        <SelectItem value="Holiday Deal">Holiday Deal</SelectItem>
                        <SelectItem value="Weekend Special">Weekend Special</SelectItem>
                        <SelectItem value="Best Seller">Best Seller</SelectItem>
                        <SelectItem value="New Arrival">New Arrival</SelectItem>
                        <SelectItem value="Limited Stock">Limited Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={(form.dealLabel as string) || ''}
                      onChange={(e) => updateField('dealLabel', e.target.value)}
                      placeholder="Custom label (e.g. Flash Sale)"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sale Price (discounted)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.salePrice as string || ''}
                    onChange={(e) => updateField('salePrice', e.target.value)}
                    placeholder="Leave empty for no sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compare At Price (&quot;Was&quot;)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.compareAtPrice as string || ''}
                    onChange={(e) => updateField('compareAtPrice', e.target.value)}
                    placeholder="Original price for display"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories - Enhanced with search */}
          <Card>
            <CardHeader><CardTitle className="text-base">Categories</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((catId) => {
                  const cat = flatCategories.find((c) => c.id === catId)
                  if (!cat) return null
                  return (
                    <Badge key={catId} variant="secondary" className="gap-1">
                      {cat.name}
                      <button
                        type="button"
                        onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== catId))}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )
                })}
                {selectedCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No categories assigned.</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search categories..."
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    className="pr-4"
                  />
                </div>
                <Select onValueChange={(v) => {
                  if (v && !selectedCategories.includes(v)) {
                    setSelectedCategories((prev) => [...prev, v])
                  }
                  setCatSearch('')
                }}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Add category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCats.length > 0 ? (
                      filteredCats.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_none" disabled>No matching categories</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Specifications</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSpecs((prev) => [...prev, { key: '', value: '' }])}
                >
                  <Plus className="size-3 mr-1" /> Add Spec
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.length === 0 && (
                <p className="text-sm text-muted-foreground">No specifications added yet.</p>
              )}
              {specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Key (e.g. Processor)"
                    value={spec.key}
                    onChange={(e) => setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, key: e.target.value } : s))}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, value: e.target.value } : s))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Images</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {product.productImages.length}/5 images
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* placeholder for future web search */
                    }}
                  >
                    <Search className="size-3 mr-1" /> Search Web
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImageDialogOpen(true)}
                  >
                    <Plus className="size-3 mr-1" /> Add URL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || product.productImages.length >= 5}
                  >
                    {uploading ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Upload className="size-3 mr-1" />}
                    Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.productImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="size-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No images yet. Upload files or add image URLs.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {product.productImages.map((img) => (
                    <div key={img.id} className="relative rounded-lg border overflow-hidden group bg-card">
                      {/* Thumbnail */}
                      <div
                        className="aspect-square bg-muted/50 flex items-center justify-center cursor-pointer relative"
                        onClick={() => setPreviewImage(img)}
                      >
                        {img.thumbnailUrl || img.url ? (
                          <img
                            src={img.thumbnailUrl || img.url}
                            alt={img.altText || ''}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-8 text-muted-foreground" />
                        )}
                        {/* Primary star overlay */}
                        {img.isPrimary && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-amber-500 text-white border-0 text-[10px] gap-0.5">
                              <Star className="size-2.5 fill-current" /> Primary
                            </Badge>
                          </div>
                        )}
                        {/* Image type badge */}
                        {img.imageType && img.imageType !== 'OTHER' && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                              {img.imageType}
                            </Badge>
                          </div>
                        )}
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full"
                            onClick={(e) => { e.stopPropagation(); setPreviewImage(img) }}
                            aria-label="Preview"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {!img.isPrimary && img.status === 'APPROVED' && (
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full"
                              onClick={(e) => { e.stopPropagation(); handleSetPrimary(img.id) }}
                              aria-label="Set as primary"
                            >
                              <Star className="size-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id) }}
                            aria-label="Delete image"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Info section */}
                      <div className="p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <Badge
                            variant="outline"
                            className={
                              img.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : img.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }
                          >
                            {img.status}
                          </Badge>
                          {img.source && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                              {img.source.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>

                        {/* Alt text - editable */}
                        <div className="flex items-center gap-1">
                          {editingAltId === img.id ? (
                            <div className="flex items-center gap-1 flex-1">
                              <Input
                                className="h-6 text-xs"
                                value={editingAltText}
                                onChange={(e) => setEditingAltText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveAltText(img.id)}
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSaveAltText(img.id)}>
                                <Check className="size-3" />
                              </Button>
                            </div>
                          ) : (
                            <p
                              className="text-xs text-muted-foreground truncate flex-1 cursor-pointer hover:text-foreground"
                              onClick={() => { setEditingAltId(img.id); setEditingAltText(img.altText || '') }}
                              title="Click to edit alt text"
                            >
                              {img.altText || 'No alt text'}
                            </p>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 shrink-0"
                            onClick={() => { setEditingAltId(img.id); setEditingAltText(img.altText || '') }}
                          >
                            <Pencil className="size-2.5" />
                          </Button>
                        </div>

                        {/* Dimensions & file size */}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {img.width && img.height && <span>{img.width}x{img.height}</span>}
                          {img.fileSize && <span>{formatFileSize(img.fileSize)}</span>}
                        </div>

                        {/* Status actions for PENDING */}
                        {img.status === 'PENDING' && (
                          <div className="flex gap-1 pt-0.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[11px] flex-1"
                              onClick={() => handleImageAction(img.id, 'approve')}
                            >
                              <Check className="size-2.5 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[11px] flex-1 text-destructive hover:text-destructive"
                              onClick={() => handleImageAction(img.id, 'reject')}
                            >
                              <X className="size-2.5 mr-1" /> Reject
                            </Button>
                          </div>
                        )}

                        {/* Set as primary button for non-primary approved images */}
                        {!img.isPrimary && img.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] w-full"
                            onClick={() => handleSetPrimary(img.id)}
                          >
                            <StarOff className="size-2.5 mr-1" /> Set as Primary
                          </Button>
                        )}

                        {img.rejectionReason && (
                          <p className="text-[10px] text-destructive">Rejected: {img.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price History */}
          <Card>
            <CardHeader><CardTitle className="text-base">Price History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.priceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No price changes recorded.</TableCell>
                    </TableRow>
                  ) : (
                    product.priceHistory.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium text-sm">{h.priceField}</TableCell>
                        <TableCell className="text-sm">{h.previousPrice != null ? formatPrice(h.previousPrice) : '—'}</TableCell>
                        <TableCell className="text-sm">{formatPrice(h.newPrice)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{h.reason || '—'}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline" className={statusColor[product.status] || ''}>
                {statusLabel[product.status] || product.status}
              </Badge>
              {canAdvance && (
                <p className="text-xs text-muted-foreground">
                  Next: {statusLabel[nextStatusLabel || '']}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stock Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="size-4" /> Stock Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stock status indicator */}
              <div className={`rounded-lg border p-3 ${stockInfo.bg}`}>
                <p className={`text-sm font-medium ${stockInfo.color}`}>{stockInfo.label}</p>
                {form.trackInventory && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.stockCount as number} units in stock
                    {(form.lowStockThreshold as number) > 0 && ` · Threshold: ${form.lowStockThreshold as number}`}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-trackInventory">Track Inventory</Label>
                <Switch
                  id="edit-trackInventory"
                  checked={form.trackInventory as boolean}
                  onCheckedChange={(v) => updateField('trackInventory', v)}
                />
              </div>
              {form.trackInventory && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stockCount">Stock Count</Label>
                    <Input
                      id="edit-stockCount"
                      type="number"
                      value={form.stockCount as number}
                      onChange={(e) => updateField('stockCount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="edit-lowStockThreshold"
                      type="number"
                      value={form.lowStockThreshold as number}
                      onChange={(e) => updateField('lowStockThreshold', parseInt(e.target.value) || 5)}
                    />
                    <p className="text-xs text-muted-foreground">Product shows &quot;Low Stock&quot; when count is at or below this value.</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Warranty (months)</Label>
                  <Input type="number" value={form.warrantyMonths as string || ''} onChange={(e) => updateField('warrantyMonths', e.target.value)} placeholder="e.g. 12" />
                </div>
                <div className="space-y-2">
                  <Label>Warranty Info</Label>
                  <Input value={form.warrantyInfo as string || ''} onChange={(e) => updateField('warrantyInfo', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={(form.seoTitle as string) || ''} onChange={(e) => updateField('seoTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea value={(form.seoDescription as string) || ''} onChange={(e) => updateField('seoDescription', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input value={(form.metaKeywords as string) || ''} onChange={(e) => updateField('metaKeywords', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">ID:</span> {product.id}</p>
              <p><span className="font-medium text-foreground">Created:</span> {new Date(product.createdAt).toLocaleString()}</p>
              <p><span className="font-medium text-foreground">Updated:</span> {new Date(product.updatedAt).toLocaleString()}</p>
              {product.publishedAt && <p><span className="font-medium text-foreground">Published:</span> {new Date(product.publishedAt).toLocaleString()}</p>}
              <p><span className="font-medium text-foreground">Currency:</span> {product.currency}</p>
              <p><span className="font-medium text-foreground">Type:</span> {product.productType}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete/Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;{product.name}&quot;? This will change the
              product status to Archived. The product will no longer be visible on the storefront.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleArchive} disabled={archiving}>
              {archiving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Archive Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            {previewImage && (
              <DialogDescription className="flex items-center gap-3 text-xs text-muted-foreground">
                {previewImage.altText || 'No alt text'}
                {previewImage.width && previewImage.height && `· ${previewImage.width}x${previewImage.height}`}
                {previewImage.source && `· ${previewImage.source.replace(/_/g, ' ')}`}
              </DialogDescription>
            )}
          </DialogHeader>
          {previewImage && (
            <div className="rounded-lg overflow-hidden bg-muted/30">
              <img
                src={previewImage.url}
                alt={previewImage.altText || ''}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image from URL</DialogTitle>
            <DialogDescription>Enter the image URL and metadata. The image will be added with PENDING status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} placeholder="Description for accessibility" />
            </div>
            <div className="space-y-2">
              <Label>Image Type</Label>
              <Select value={newImageType} onValueChange={setNewImageType}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['FRONT', 'BACK', 'SIDE', 'PORTS', 'PACKAGING', 'ACCESSORIES', 'CLOSEUP', 'LIFESTYLE', 'KEYBOARD', 'DISPLAY', 'BOTTOM', 'CHARGER', 'SCREEN', 'OTHER'].map((t) => (
                    <SelectItem key={t} value={t}>{t.charAt() + t.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddImage} disabled={!newImageUrl.trim()}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
