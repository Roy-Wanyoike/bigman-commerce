'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, Plus, Trash2, X } from 'lucide-react'

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  REFURBISHED: 'Refurbished',
  USED: 'Used',
  OPEN_BOX: 'Open Box',
  CLEARANCE: 'Clearance',
}

const gradeLabels: Record<string, string> = {
  A_PLUS: 'A+', A: 'A', B_PLUS: 'B+', B: 'B', C: 'C',
}

interface Brand { id: string; name: string }
interface FlatCategory { id: string; name: string; slug: string; parentId: string | null; level: number; children?: FlatCategory[] }

function flattenCategories(nodes: FlatCategory[], prefix = ''): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const node of nodes) {
    const label = prefix ? `${prefix} > ${node.name}` : node.name
    result.push({ id: node.id, name: label })
    if (node.children?.length) result.push(...flattenCategories(node.children, label))
  }
  return result
}

export default function AdminNewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [allCategories, setAllCategories] = useState<FlatCategory[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    brandId: '',
    condition: 'NEW',
    conditionGrade: '',
    conditionNote: '',
    basePrice: '',
    salePrice: '',
    costPrice: '',
    compareAtPrice: '',
    wholesalePrice: '',
    corporatePrice: '',
    trackInventory: true,
    stockCount: 0,
    lowStockThreshold: 5,
    warrantyMonths: '',
    warrantyInfo: '',
    isFeatured: false,
    isDeal: false,
    isGaming: false,
    sku: '',
    partNumber: '',
    compatibleModels: '',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
  })

  const updateField = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          fetch('/api/admin/categories').then((r) => r.json()),
          fetch('/api/admin/products?pageSize=200').then((r) => r.json()),
        ])
        setAllCategories(catsRes.categories || [])
        const brandSet = new Map<string, Brand>()
        ;(brandsRes.products || []).forEach((p: { brand?: Brand | null }) => {
          if (p.brand) brandSet.set(p.brand.id, p.brand)
        })
        setAllBrands(Array.from(brandSet.values()).sort((a, b) => a.name.localeCompare(b.name)))
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!form.name || !form.basePrice) {
      alert('Product name and base price are required.')
      return
    }
    setSaving(true)
    try {
      const specsObj: Record<string, string> = {}
      specs.forEach((s) => { if (s.key.trim()) specsObj[s.key.trim()] = s.value })

      const body = {
        ...form,
        basePrice: parseFloat(form.basePrice) || 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : null,
        corporatePrice: form.corporatePrice ? parseFloat(form.corporatePrice) : null,
        warrantyMonths: form.warrantyMonths ? parseInt(form.warrantyMonths) : null,
        brandId: form.brandId || null,
        conditionGrade: form.conditionGrade || null,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        specifications: Object.keys(specsObj).length > 0 ? specsObj : null,
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to create product')
        return
      }

      const data = await res.json()
      router.push(`/admin/products/${data.product.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const flatCategories = flattenCategories(allCategories)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
            <p className="text-sm text-muted-foreground">Create a new product in the catalog.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Create Product
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Dell Latitude 5540" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="auto-generated if empty" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={form.brandId || '_none'} onValueChange={(v) => updateField('brandId', v === '_none' ? '' : v)}>
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
                  <Select value={form.condition} onValueChange={(v) => updateField('condition', v)}>
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
                  <Select value={form.conditionGrade || '_none'} onValueChange={(v) => updateField('conditionGrade', v === '_none' ? '' : v)}>
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
                <Input value={form.conditionNote} onChange={(e) => updateField('conditionNote', e.target.value)} placeholder="e.g. Minor scratches on lid" />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={5} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Part Number</Label>
                  <Input value={form.partNumber} onChange={(e) => updateField('partNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Compatible Models</Label>
                  <Input value={form.compatibleModels} onChange={(e) => updateField('compatibleModels', e.target.value)} placeholder="Comma-separated" />
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
                  <Input type="number" step="0.01" value={form.basePrice} onChange={(e) => updateField('basePrice', e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price</Label>
                  <Input type="number" step="0.01" value={form.salePrice} onChange={(e) => updateField('salePrice', e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price</Label>
                  <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => updateField('costPrice', e.target.value)} placeholder="Hidden" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Compare At Price</Label>
                  <Input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => updateField('compareAtPrice', e.target.value)} placeholder={'"Was" price'} />
                </div>
                <div className="space-y-2">
                  <Label>Wholesale Price</Label>
                  <Input type="number" step="0.01" value={form.wholesalePrice} onChange={(e) => updateField('wholesalePrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Corporate Price</Label>
                  <Input type="number" step="0.01" value={form.corporatePrice} onChange={(e) => updateField('corporatePrice', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
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
                      <button type="button" onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== catId))} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
              <Select onValueChange={(v) => {
                if (v && !selectedCategories.includes(v)) setSelectedCategories((prev) => [...prev, v])
              }}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Add category..." />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Specifications</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => setSpecs((prev) => [...prev, { key: '', value: '' }])}>
                  <Plus className="size-3 mr-1" /> Add Spec
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.length === 0 && <p className="text-sm text-muted-foreground">No specifications added yet.</p>}
              {specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input placeholder="Key (e.g. Processor)" value={spec.key} onChange={(e) => setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, key: e.target.value } : s))} className="flex-1" />
                  <Input placeholder="Value" value={spec.value} onChange={(e) => setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, value: e.target.value } : s))} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== idx))}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Flags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch id="isFeatured" checked={form.isFeatured} onCheckedChange={(v) => updateField('isFeatured', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isDeal">Deal</Label>
                <Switch id="isDeal" checked={form.isDeal} onCheckedChange={(v) => updateField('isDeal', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isGaming">Gaming</Label>
                <Switch id="isGaming" checked={form.isGaming} onCheckedChange={(v) => updateField('isGaming', v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Inventory</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="trackInventory">Track Inventory</Label>
                <Switch id="trackInventory" checked={form.trackInventory} onCheckedChange={(v) => updateField('trackInventory', v)} />
              </div>
              {form.trackInventory && (
                <>
                  <div className="space-y-2">
                    <Label>Stock Count</Label>
                    <Input type="number" value={form.stockCount} onChange={(e) => updateField('stockCount', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Low Stock Threshold</Label>
                    <Input type="number" value={form.lowStockThreshold} onChange={(e) => updateField('lowStockThreshold', parseInt(e.target.value) || 5)} />
                  </div>
                </>
              )}
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Warranty (months)</Label>
                  <Input type="number" value={form.warrantyMonths} onChange={(e) => updateField('warrantyMonths', e.target.value)} placeholder="e.g. 12" />
                </div>
                <div className="space-y-2">
                  <Label>Warranty Info</Label>
                  <Input value={form.warrantyInfo} onChange={(e) => updateField('warrantyInfo', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={form.seoTitle} onChange={(e) => updateField('seoTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea value={form.seoDescription} onChange={(e) => updateField('seoDescription', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input value={form.metaKeywords} onChange={(e) => updateField('metaKeywords', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
