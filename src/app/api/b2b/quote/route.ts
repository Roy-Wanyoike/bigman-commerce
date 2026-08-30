import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { promises as fs } from 'fs'
import path from 'path'

const quoteItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
})

const quoteRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  krapin: z.string().optional(),
  businessType: z.enum(['SOLE_PROPRIETOR', 'LIMITED', 'PARTNERSHIP', 'CORPORATE', 'NGO', 'GOVERNMENT']),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required').max(50, 'Maximum 50 items per request'),
  deliveryCounty: z.string().min(2, 'Delivery county is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  specialRequirements: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = quoteRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const data = result.data
    const quoteId = `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`

    const quoteRecord = {
      quoteId,
      status: 'PENDING',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const quotesDir = path.join(process.cwd(), 'data', 'quotes')
    await fs.mkdir(quotesDir, { recursive: true })

    const filePath = path.join(quotesDir, `${quoteId}.json`)
    await fs.writeFile(filePath, JSON.stringify(quoteRecord, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      quoteId,
      estimatedResponse: 'Within 24 hours',
    })
  } catch (e) {
    console.error('[B2B Quote API]', e)
    return NextResponse.json(
      { success: false, errors: { _form: ['Failed to process quote request. Please try again.'] } },
      { status: 500 },
    )
  }
}
