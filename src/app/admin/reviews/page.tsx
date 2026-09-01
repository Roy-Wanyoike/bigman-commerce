'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Star,
  Check,
  X,
  Trash2,
  MessageSquare,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Review = {
  id: string
  productId: string
  userId: string
  rating: number
  title: string
  body: string
  authorName: string
  authorEmail: string
  isVerified: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
  product: {
    name: string
    slug: string
  }
}

type Tab = 'pending' | 'published' | 'all'

const tabs: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'published', label: 'Published' },
  { key: 'all', label: 'All' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const limit = 20

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?status=${activeTab}&page=${page}&limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setReviews(data.reviews)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      setReviews([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'unpublish' | 'delete') => {
    if (action === 'reject' || action === 'delete') {
      const confirmed = window.confirm(
        action === 'delete'
          ? 'Are you sure you want to permanently delete this review?'
          : 'Are you sure you want to reject and delete this review?'
      )
      if (!confirmed) return
    }

    setActionLoading(id)
    try {
      if (action === 'delete') {
        const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
      } else {
        const res = await fetch(`/api/admin/reviews/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
        if (!res.ok) throw new Error('Failed to update')
      }
      fetchReviews()
    } catch {
      // Error handled silently, reviews refetched on success
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="size-6" />
            Review Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} review{total !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Loading reviews...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <MessageSquare className="size-12 mb-3 text-slate-300" />
          <p className="text-sm">No reviews found</p>
        </div>
      )}

      {/* Reviews list */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Link
                        href={`/product/${review.product.slug}`}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        {review.product.name}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="font-medium">{review.authorName}</span>
                        <span className="text-slate-400">{review.authorEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {review.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <StarRating rating={review.rating} />

                  {/* Title and body */}
                  {review.title && (
                    <p className="font-semibold text-slate-900">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
                  )}

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {!review.isPublished && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => handleAction(review.id, 'approve')}
                          disabled={actionLoading === review.id}
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Approve
                        </Button>
                      )}
                      {review.isPublished && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleAction(review.id, 'unpublish')}
                          disabled={actionLoading === review.id}
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <EyeOff className="size-3.5" />
                          )}
                          Unpublish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleAction(review.id, 'delete')}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
