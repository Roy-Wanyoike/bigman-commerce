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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Loader2,
  Settings,
  BadgeCheck,
} from 'lucide-react'

interface CategoryNode {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  level: number
  showInNav: boolean
  navIcon: string | null
  navColumns: number
  children: CategoryNode[]
}

interface AttributeDef {
  id: string
  name: string
  key: string
  type: string
  unit: string | null
  options: string | null
  isRequired: boolean
  sortOrder: number
  isActive: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Create category dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCat, setNewCat] = useState({
    name: '', slug: '', description: '', parentId: '', sortOrder: 0, isActive: true, isFeatured: false,
  })

  // Attributes dialog
  const [attrDialogOpen, setAttrDialogOpen] = useState(false)
  const [attrCat, setAttrCat] = useState<CategoryNode | null>(null)
  const [attributes, setAttributes] = useState<AttributeDef[]>([])
  const [attrLoading, setAttrLoading] = useState(false)
  const [attrForm, setAttrForm] = useState({ name: '', key: '', type: 'TEXT', unit: '', isRequired: false })
  const [attrSubmitting, setAttrSubmitting] = useState(false)

  function loadCategories() {
    setLoading(true)
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || [])
        // Expand top-level by default
        const expandedSet = new Set<string>()
        ;(data.categories || []).forEach((c: CategoryNode) => expandedSet.add(c.id))
        setExpanded(expandedSet)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCat.name || !newCat.slug) {
      alert('Name and slug are required.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCat,
          parentId: newCat.parentId || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to create category')
        return
      }
      setCreateDialogOpen(false)
      setNewCat({ name: '', slug: '', description: '', parentId: '', sortOrder: 0, isActive: true, isFeatured: false })
      loadCategories()
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  async function openAttributes(cat: CategoryNode) {
    setAttrCat(cat)
    setAttrDialogOpen(true)
    setAttrLoading(true)
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}/attributes`)
      const data = await res.json()
      setAttributes(data.attributes || [])
    } catch (e) {
      console.error(e)
    } finally {
      setAttrLoading(false)
    }
  }

  async function handleAddAttribute(e: React.FormEvent) {
    e.preventDefault()
    if (!attrCat || !attrForm.name || !attrForm.key) {
      alert('Name and key are required.')
      return
    }
    setAttrSubmitting(true)
    try {
      const res = await fetch(`/api/admin/categories/${attrCat.id}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attrForm),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to create attribute')
        return
      }
      setAttrForm({ name: '', key: '', type: 'TEXT', unit: '', isRequired: false })
      // Reload attributes
      const reload = await fetch(`/api/admin/categories/${attrCat.id}/attributes`)
      const data = await reload.json()
      setAttributes(data.attributes || [])
    } catch (e) {
      console.error(e)
    } finally {
      setAttrSubmitting(false)
    }
  }

  function flatList(nodes: CategoryNode[]): { cat: CategoryNode; depth: number }[] {
    const result: { cat: CategoryNode; depth: number }[] = []
    function walk(items: CategoryNode[], depth: number) {
      for (const item of items) {
        result.push({ cat: item, depth })
        if (item.children?.length) walk(item.children, depth + 1)
      }
    }
    walk(nodes, 0)
    return result
  }

  const flat = flatList(categories)

  // Build a parent select list for create dialog
  function buildParentOptions(nodes: CategoryNode[], prefix = ''): { id: string; label: string }[] {
    const result: { id: string; label: string }[] = []
    for (const node of nodes) {
      const label = prefix ? `${prefix} > ${node.name}` : node.name
      result.push({ id: node.id, label })
      if (node.children?.length) result.push(...buildParentOptions(node.children, label))
    }
    return result
  }

  const parentOptions = buildParentOptions(categories)

  const typeLabels: Record<string, string> = {
    TEXT: 'Text',
    NUMBER: 'Number',
    SELECT: 'Select',
    MULTI_SELECT: 'Multi-Select',
    BOOLEAN: 'Boolean',
    RANGE: 'Range',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="size-5" />
            Categories
          </h1>
          <p className="text-muted-foreground">Manage your product category tree and attribute definitions.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4 mr-1" /> New Category
        </Button>
      </div>

      {/* Category Tree */}
      <Card>
        <CardHeader><CardTitle className="text-base">Category Tree</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No categories yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flat.map(({ cat, depth }) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
                        {cat.children.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(cat.id)}
                            className="text-muted-foreground hover:text-foreground p-0"
                          >
                            {expanded.has(cat.id) ? (
                              <ChevronDown className="size-3" />
                            ) : (
                              <ChevronRight className="size-3" />
                            )}
                          </button>
                        ) : (
                          <span className="w-3" />
                        )}
                        <span className={cat.children.length > 0 ? 'font-medium' : ''}>{cat.name}</span>
                        {cat.isFeatured && <BadgeCheck className="size-3 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">L{cat.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openAttributes(cat)}>
                        <Settings className="size-3 mr-1" /> Attributes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new category to the tree.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={newCat.name}
                onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Laptops"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                value={newCat.slug}
                onChange={(e) => setNewCat((p) => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. laptops"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select
                value={newCat.parentId || '_root'}
                onValueChange={(v) => setNewCat((p) => ({ ...p, parentId: v === '_root' ? '' : v }))}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Root level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_root">Root (no parent)</SelectItem>
                  {parentOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCat.description}
                onChange={(e) => setNewCat((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={newCat.sortOrder}
                  onChange={(e) => setNewCat((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="cat-active"
                    checked={newCat.isActive}
                    onCheckedChange={(v) => setNewCat((p) => ({ ...p, isActive: v }))}
                  />
                  <Label htmlFor="cat-active" className="text-sm">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="size-4 animate-spin" /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attributes Dialog */}
      <Dialog open={attrDialogOpen} onOpenChange={setAttrDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Attribute Definitions</DialogTitle>
            <DialogDescription>
              Manage attribute definitions for &quot;{attrCat?.name}&quot;.
            </DialogDescription>
          </DialogHeader>

          {/* Existing attributes */}
          <div className="flex-1 overflow-y-auto max-h-60">
            {attrLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : attributes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No attribute definitions yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributes.map((attr) => (
                    <TableRow key={attr.id}>
                      <TableCell className="font-medium text-sm">{attr.name}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{attr.key}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{typeLabels[attr.type] || attr.type}</Badge>
                        {attr.unit && <span className="ml-1 text-xs text-muted-foreground">({attr.unit})</span>}
                      </TableCell>
                      <TableCell>
                        {attr.isRequired ? (
                          <Badge variant="secondary" className="text-xs">Yes</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Add attribute form */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Add New Attribute</p>
            <form onSubmit={handleAddAttribute} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={attrForm.name}
                  onChange={(e) => setAttrForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. RAM"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Key *</Label>
                <Input
                  value={attrForm.key}
                  onChange={(e) => setAttrForm((p) => ({ ...p, key: e.target.value }))}
                  placeholder="e.g. ram"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={attrForm.type} onValueChange={(v) => setAttrForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={attrForm.unit}
                  onChange={(e) => setAttrForm((p) => ({ ...p, unit: e.target.value }))}
                  placeholder="e.g. GB"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-end col-span-2 gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={attrForm.isRequired}
                    onCheckedChange={(v) => setAttrForm((p) => ({ ...p, isRequired: v }))}
                  />
                  <Label className="text-xs">Required</Label>
                </div>
                <Button type="submit" size="sm" disabled={attrSubmitting} className="ml-auto">
                  {attrSubmitting ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                  Add
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
