import { NextRequest, NextResponse } from 'next/server'

/**
 * M-Pesa STK Push — development stub.
 * TODO: Integrate Safaricom Daraja API for production.
 *   1. Generate OAuth token using consumer key/secret.
 *   2. Call POST https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest
 *   3. Return the CheckoutRequestID from Daraja response.
 *   4. Use the callback route to confirm payment.
 */

interface StkPushRequest {
  phone: string
  amount: number
  orderRef: string
}

function validateRequest(body: unknown): { valid: boolean; errors: string[]; data?: StkPushRequest } {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] }
  }

  const { phone, amount, orderRef } = body as Record<string, unknown>

  if (!phone || typeof phone !== 'string' || !/^254\d{9}$/.test(phone)) {
    errors.push('phone must be a valid 12-digit Kenyan number starting with 254')
  }

  if (amount == null || typeof amount !== 'number' || amount <= 0) {
    errors.push('amount must be a positive number')
  }

  if (!orderRef || typeof orderRef !== 'string') {
    errors.push('orderRef must be a non-empty string')
  }

  if (errors.length > 0) return { valid: false, errors }

  return { valid: true, errors: [], data: { phone: phone as string, amount: amount as number, orderRef: orderRef as string } }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateRequest(body)

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.errors }, { status: 400 })
    }

    const { phone, amount, orderRef } = validation.data!

    if (process.env.NODE_ENV === 'production') {
      console.warn('[M-Pesa] Production STK Push not yet implemented. Configure Daraja API credentials.')
      // TODO: Implement production Daraja STK Push flow
      // const token = await getDarajaOAuthToken()
      // const response = await initiateStkPush(token, { phone, amount, orderRef, shortCode, passKey, callbackUrl })
      // return NextResponse.json({ success: true, data: response })
    }

    // Mock STK Push response for development
    const mockResponse = {
      MerchantRequestID: `mock-req-${Date.now()}`,
      CheckoutRequestID: `mock-checkout-${Date.now()}`,
      ResponseCode: '0',
      ResponseDescription: 'Accept the Service Request successfully',
      CustomerMessage: 'Success. Request accepted for processing',
      // Echo back request details for debugging
      _debug: { phone, amount, orderRef },
    }

    console.log('[M-Pesa] STK Push (stub):', { phone, amount, orderRef })

    return NextResponse.json({ success: true, data: mockResponse })
  } catch (error) {
    console.error('[M-Pesa] STK Push error:', error)
    return NextResponse.json({ success: false, error: 'Failed to initiate M-Pesa payment' }, { status: 500 })
  }
}
