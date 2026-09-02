'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type ContactSubmission = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  department: string
  createdAt: string
  isRead: boolean
}

const departmentColors: Record<string, string> = {
  sales: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  support: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  billing: 'bg-red-100 text-red-700 hover:bg-red-100',
  general: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
}

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contact')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch {
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const unreadCount = submissions.filter((s) => !s.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="size-6" />
            Contact Submissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} found
            {unreadCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                ({unreadCount} unread)
              </span>
            )}
          </p>
        </div>
      </div>

      <Separator />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Loading submissions...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Mail className="size-12 mb-3 text-slate-300" />
          <p className="text-sm">No contact submissions found</p>
        </div>
      )}

      {/* Submissions list */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const isExpanded = expandedId === submission.id
            return (
              <Card key={submission.id} className={
                !submission.isRead ? 'border-l-4 border-l-amber-400' : ''
              }>
                <CardContent className="p-0">
                  {/* Header row - clickable */}
                  <button
                    onClick={() => toggleExpand(submission.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900">
                          {submission.name}
                        </span>
                        <Badge className={departmentColors[submission.department] || departmentColors.general}>
                          {submission.department}
                        </Badge>
                        {!submission.isRead && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <EyeOff className="size-3" />
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mt-1 truncate">
                        {submission.subject}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>{submission.email}</span>
                        <span className="hidden sm:inline">{submission.phone}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDate(submission.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="size-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <>
                      <Separator />
                      <div className="px-5 py-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">From</p>
                            <p className="text-sm font-medium text-slate-900">{submission.name}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
                            <p className="text-sm text-slate-700">{submission.email}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                            <p className="text-sm text-slate-700 flex items-center gap-1.5">
                              <Phone className="size-3.5" />
                              {submission.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
                            <p className="text-sm text-slate-700">{formatDate(submission.createdAt)}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Message</p>
                          <div className="rounded-lg bg-slate-50 border p-4">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {submission.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
