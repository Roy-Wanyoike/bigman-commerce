import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/security'

const orderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  productSlug: z.string().optional(),
  brandName: z.string().optional(),
  condition: z.string().optional(),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  totalPrice: z.number().min(0, 'Total price must be non-negative'),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required').max(100, 'Maximum 100 items per order'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(8, 'Valid phone number is required'),
  deliveryMethod: z.enum(['pickup', 'courier']),
  deliveryCounty: z.string().optional(),
  deliveryAddress: z.string().optional(),
  courierPhone: z.string().optional(),
  mpesaPhone: z.string().min(8, 'M-Pesa phone number is required'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  deliveryFee: z.number().min(0, 'Delivery fee must be non-negative'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  userId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = createOrderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const data = result.data
    const orderNumber = generateOrderNumber()

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        deliveryMethod: data.deliveryMethod,
        deliveryCounty: data.deliveryCounty,
        deliveryAddress: data.deliveryAddress,
        courierPhone: data.courierPhone,
        deliveryStatus: 'PENDING',
        paymentMethod: 'mpesa',
        paymentStatus: 'PENDING',
        mpesaPhone: data.mpesaPhone,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        totalAmount: data.totalAmount,
        currency: 'KES',
        status: 'PENDING',
        orderItems: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            brandName: item.brandName,
            condition: item.condition,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (e) {
    console.error('[Orders API]', e)
    return NextResponse.json(
      { success: false, errors: { _form: ['Failed to create order. Please try again.'] } },
      { status: 500 },
    )
  }
}
