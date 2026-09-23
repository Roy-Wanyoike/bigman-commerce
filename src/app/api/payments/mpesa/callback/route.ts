import { NextRequest, NextResponse } from 'next/server'

/**
 * M-Pesa STK Push callback — development stub.
 *
 * Safaricom calls this endpoint after the customer completes (or cancels)
 * the STK Push prompt on their phone.
 *
 * TODO: Production implementation:
 *   1. Verify the callback signature / origin.
 *   2. Extract ResultCode from stkCallback.
 *   3. If ResultCode === 0, mark order as PAID and record M-Pesa receipt.
 *   4. If ResultCode !== 0, mark order as PAYMENT_FAILED.
 *   5. Trigger order confirmation email via sendOrderConfirmation().
 */

interface MpesaCallbackBody {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string
      CheckoutRequestID?: string
      ResultCode?: number | string
      ResultDesc?: string
      CallbackMetadata?: {
        Item?: Array<{ Name: string; Value?: string | number }>
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MpesaCallbackBody = await request.json()

    const callback = body.Body?.stkCallback
    if (!callback) {
      console.error('[M-Pesa Callback] Missing stkCallback in body')
      return NextResponse.json({ success: false, error: 'Invalid callback structure' }, { status: 400 })
    }

    const resultCode = Number(callback.ResultCode)
    const resultDesc = callback.ResultDesc ?? 'Unknown'
    const checkoutRequestId = callback.CheckoutRequestID ?? 'unknown'

    if (resultCode === 0) {
      // Payment succeeded
      const metadata = callback.CallbackMetadata?.Item ?? []
      const mpesaReceipt = metadata.find((i) => i.Name === 'MpesaReceiptNumber')?.Value ?? ''
      const amount = metadata.find((i) => i.Name === 'Amount')?.Value ?? 0
      const phone = metadata.find((i) => i.Name === 'PhoneNumber')?.Value ?? ''

      console.log('[M-Pesa Callback] Payment SUCCESS:', {
        checkoutRequestId,
        mpesaReceipt,
        amount,
        phone,
      })

      // TODO: Update order payment status in database
      // await db.order.update({
      //   where: { checkoutRequestId },
      //   data: { paymentStatus: 'PAID', mpesaReceipt, paidAt: new Date() },
      // })
      // TODO: Send order confirmation email
      // const order = await db.order.findUnique({ where: { checkoutRequestId } })
      // if (order) await sendOrderConfirmation(order)
    } else {
      // Payment failed or was cancelled
      console.log('[M-Pesa Callback] Payment FAILED:', {
        checkoutRequestId,
        resultCode,
        resultDesc,
      })

      // TODO: Update order payment status in database
      // await db.order.update({
      //   where: { checkoutRequestId },
      //   data: { paymentStatus: 'PAYMENT_FAILED', paymentFailureReason: resultDesc },
      // })
    }

    // Safaricom expects a 200 OK regardless of our processing result
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[M-Pesa Callback] Error processing callback:', error)
    // Still return 200 to avoid Daraja retries for server errors
    return NextResponse.json({ success: false, error: 'Internal processing error' })
  }
}
