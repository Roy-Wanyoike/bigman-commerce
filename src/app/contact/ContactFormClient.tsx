'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const subjectOptions = [
  'General Inquiry',
  'Product Availability',
  'Order Support',
  'Warranty Claim',
  'Bulk Order',
  'Other',
] as const

type FormState = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

export default function ContactFormClient() {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg =
          data.errors?.map((e: { message: string }) => e.message).join('. ') ||
          data.message ||
          'Something went wrong. Please try again.'
        setError(msg)
        return
      }

      setSuccess(true)
      setForm(initialState)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <p className="text-sm font-semibold text-foreground">
            Message Sent Successfully
          </p>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Thank you for your message. We will get back to you soon.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setSuccess(false)}
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Send Us a Message</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">
                Phone <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+254 700 000 000"
                value={form.phone}
                onChange={handleChange}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-sm">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.subject}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, subject: value }))
                }
                required
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Tell us how we can help you..."
              value={form.message}
              onChange={handleChange}
              className="text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive leading-relaxed">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
