import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'

// ============================================================
// SCHEMAS
// ============================================================

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().optional(),
  body: z.string().optional(),
  authorName: z.string().min(1, 'Your name is required'),
  authorEmail: z.string().email('A valid email is required'),
})

// ============================================================
// POST – Submit a review (pending admin approval)
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = createReviewSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const data = result.data

    const review = await db.review.create({
      data: {
        productId: data.productId,
        rating: data.rating,
        title: data.title || null,
        body: data.body || null,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        isVerified: false,
        isPublished: false,
      },
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (e) {
    console.error('[Reviews API] POST error', e)
    return NextResponse.json(
      { success: false, errors: { _form: ['Failed to submit review. Please try again.'] } },
      { status: 500 },
    )
  }
}

// ============================================================
// GET – List published reviews for a product
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { success: false, errors: { productId: ['productId query parameter is required'] } },
        { status: 400 },
      )
    }

    const reviews = await db.review.findMany({
      where: { productId, isPublished: true },
      orderBy: { createdAt: 'desc' },
    })

    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0

    return NextResponse.json({
      success: true,
      reviews,
      averageRating,
      totalReviews,
    })
  } catch (e) {
    console.error('[Reviews API] GET error', e)
    return NextResponse.json(
      { success: false, errors: { _form: ['Failed to load reviews.'] } },
      { status: 500 },
    )
  }
}
