'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================
// TYPES
// ============================================================

interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  authorName: string | null
  createdAt: string
}

interface ReviewsData {
 reviews: Review[]
 averageRating: number
 totalReviews: number
}

// ============================================================
// STAR RATING INPUT
// ============================================================

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
        >
          <Star
            className={cn(
              'h-6 w-6',
              (hover || value) >= i
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30',
            )}
          />
        </button>
      ))}
    </div>
  )
}

// ============================================================
// STAR DISPLAY (static)
// ============================================================

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            rating >= i
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/25',
          )}
        />
      ))}
    </div>
  )
}

// ============================================================
// LOADING SKELETON
// ============================================================

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Form state
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ---- Fetch reviews ----
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // ---- Submit review ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormErrors({})
    setSuccessMsg('')

    const errors: Record<string, string> = {}
    if (rating < 1) errors.rating = 'Please select a rating'
    if (!authorName.trim()) errors.authorName = 'Name is required'
    if (!authorEmail.trim()) errors.authorEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) errors.authorEmail = 'Enter a valid email'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSuccessMsg('Thank you! Your review has been submitted and will appear after approval.')
        setRating(0)
        setTitle('')
        setBody('')
        setAuthorName('')
        setAuthorEmail('')
      } else {
        const fieldErrors = json.errors || {}
        const flat: Record<string, string> = {}
        for (const [key, val] of Object.entries(fieldErrors)) {
          if (Array.isArray(val) && val.length > 0) flat[key] = val[0]
        }
        setFormErrors(flat)
      }
    } catch {
      setFormErrors({ _form: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Star distribution counts ----
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data?.reviews.filter((r) => r.rating === star).length ?? 0,
  }))

  const maxCount = Math.max(...starCounts.map((s) => s.count), 1)

  // ---- RENDER ----
  return (
    <div className="space-y-8">
      <h2 className="text-xl md:text-2xl font-bold">Customer Reviews</h2>

      {loading && <ReviewsSkeleton />}

      {!loading && data && (
        <>
          {/* ===== SUMMARY BAR ===== */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            {/* Left: average + total */}
            <div className="flex flex-col items-center justify-center bg-secondary/30 rounded-xl p-6">
              <span className="text-5xl font-bold">{data.averageRating.toFixed(1)}</span>
              <Stars rating={Math.round(data.averageRating)} className="mt-2" />
              <span className="text-sm text-muted-foreground mt-1">
                {data.totalReviews} {data.totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Right: star distribution */}
            <div className="flex flex-col justify-center gap-1.5">
              {starCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-14 text-right">
                    {star} star{star > 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-2.5 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ===== REVIEW LIST ===== */}
          {data.reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Be the first to review this product</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {review.authorName || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <Stars rating={review.rating} className="mt-1" />
                    {review.title && (
                      <p className="text-sm font-semibold mt-2">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {review.body}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Separator />

          {/* ===== WRITE REVIEW FORM ===== */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {successMsg ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                  {successMsg}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formErrors._form && (
                    <p className="text-sm text-destructive">{formErrors._form}</p>
                  )}

                  {/* Star rating selector */}
                  <div>
                    <label className="text-sm font-medium">
                      Your Rating <span className="text-destructive">*</span>
                    </label>
                    <div className="mt-1">
                      <StarRating value={rating} onChange={setRating} />
                      {formErrors.rating && (
                        <p className="text-xs text-destructive mt-1">{formErrors.rating}</p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="review-title" className="text-sm font-medium">
                      Review Title
                    </label>
                    <Input
                      id="review-title"
                      placeholder="Summarize your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label htmlFor="review-body" className="text-sm font-medium">
                      Your Review
                    </label>
                    <Textarea
                      id="review-body"
                      placeholder="What did you like or dislike?"
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="review-name" className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="review-name"
                        placeholder="Your name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="mt-1"
                      />
                      {formErrors.authorName && (
                        <p className="text-xs text-destructive mt-1">{formErrors.authorName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="review-email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="review-email"
                        type="email"
                        placeholder="your@email.com"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        className="mt-1"
                      />
                      {formErrors.authorEmail && (
                        <p className="text-xs text-destructive mt-1">{formErrors.authorEmail}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
