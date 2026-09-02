'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, User, Pencil, X, Check, Mail, Phone, MapPin } from 'lucide-react'

interface ProfileEditorProps {
  user: {
    name: string | null
    email: string
    phone: string | null
    county: string | null
    address: string | null
  }
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    county: user.county || '',
    address: user.address || '',
  })

  const resetForm = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      county: user.county || '',
      address: user.address || '',
    })
  }

  const startEditing = () => {
    resetForm()
    setError('')
    setEditing(true)
  }

  const cancelEditing = () => {
    resetForm()
    setError('')
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const payload: Record<string, string> = {}
      if (formData.name !== (user.name || '')) payload.name = formData.name
      if (formData.phone !== (user.phone || '')) payload.phone = formData.phone
      if (formData.county !== (user.county || '')) payload.county = formData.county
      if (formData.address !== (user.address || '')) payload.address = formData.address

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setEditing(false)
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="text-sm bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone number"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="county" className="text-sm font-medium">County</Label>
            <Input
              id="county"
              value={formData.county}
              onChange={e => setFormData(prev => ({ ...prev, county: e.target.value }))}
              placeholder="County"
              className="text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Delivery address"
              className="text-sm"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
            Save Changes
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing} disabled={saving}>
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <User className="h-3.5 w-3.5" /> Name
          </div>
          <p className="text-sm font-medium">{user.name || 'Not set'}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5" /> Email
          </div>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Phone className="h-3.5 w-3.5" /> Phone
          </div>
          <p className="text-sm font-medium">{user.phone || 'Not set'}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5" /> County
          </div>
          <p className="text-sm font-medium">{user.county || 'Not set'}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5" /> Address
          </div>
          <p className="text-sm font-medium">{user.address || 'Not set'}</p>
        </div>
      </div>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={startEditing}>
          <Pencil className="h-4 w-4 mr-1.5" />
          Edit Profile
        </Button>
      </div>
    </div>
  )
}