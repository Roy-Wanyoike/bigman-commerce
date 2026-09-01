'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  ArrowRightLeft,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'

interface SynonymItem {
  id: string
  term: string
  synonym: string
  createdAt: string
}

interface SynonymForm {
  term: string
  synonym: string
}

const emptyForm: SynonymForm = {
  term: '',
  synonym: '',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminSynonymsPage() {
  const [synonyms, setSynonyms] = useState<SynonymItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSynonym, setEditingSynonym] = useState<SynonymItem | null>(null)
  const [form, setForm] = useState<SynonymForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<SynonymItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  function loadSynonyms() {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/admin/synonyms${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSynonyms(data.synonyms || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSynonyms()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  function openCreateDialog() {
    setEditingSynonym(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(item: SynonymItem) {
    setEditingSynonym(item)
    setForm({ term: item.term, synonym: item.synonym })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.term.trim() || !form.synonym.trim()) {
      alert('Both term and synonym are required.')
      return
    }
    setSubmitting(true)
    try {
      const url = editingSynonym
        ? `/api/admin/synonyms/${editingSynonym.id}`
        : '/api/admin/synonyms'
      const method = editingSynonym ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: form.term.trim(),
          synonym: form.synonym.trim(),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Operation failed')
        return
      }

      setDialogOpen(false)
      loadSynonyms()
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
      const res = await fetch(`/api/admin/synonyms/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete synonym')
        return
      }
      setDeleteTarget(null)
      loadSynonyms()
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
            <ArrowRightLeft className="size-5" />
            Search Synonyms
          </h1>
          <p className="text-muted-foreground">Manage search term synonyms to improve product discovery.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4 mr-1" /> Add Synonym
        </Button>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">All Synonyms</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search terms or synonyms..."
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
          ) : synonyms.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {search ? 'No synonyms match your search.' : 'No synonyms yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Synonym</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {synonyms.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-sm">
                          {item.term}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-sm">
                          {item.synonym}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSynonym ? 'Edit Synonym' : 'Create Synonym'}
            </DialogTitle>
            <DialogDescription>
              {editingSynonym
                ? 'Update synonym mapping.'
                : 'Add a new search synonym pair. When a user searches for the synonym, results for the primary term will also be shown.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="syn-term">Primary Term *</Label>
              <Input
                id="syn-term"
                value={form.term}
                onChange={(e) => setForm((p) => ({ ...p, term: e.target.value }))}
                placeholder="e.g. laptop"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="syn-synonym">Synonym *</Label>
              <Input
                id="syn-synonym"
                value={form.synonym}
                onChange={(e) => setForm((p) => ({ ...p, synonym: e.target.value }))}
                placeholder="e.g. notebook"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin mr-1" />}
                {editingSynonym ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Synonym</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the mapping from &quot;{deleteTarget?.synonym}&quot; → &quot;{deleteTarget?.term}&quot;? This action cannot be undone.
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
