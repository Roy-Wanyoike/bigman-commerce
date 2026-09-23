/**
 * Email service — currently a stub that logs to console.
 * Production: integrate Resend, SendGrid, or Nodemailer+SMTP.
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
  if (process.env.NODE_ENV === 'production') {
    console.warn('[Email] Production email not configured. Implement Resend/SendGrid integration.')
  }
  console.log('[Email] Sending:', options.subject, 'to:', options.to)
  return { success: true, messageId: `stub-${Date.now()}` }
}

export async function sendOrderConfirmation(order: { orderNumber: string; customerEmail: string; customerName: string; totalAmount: number }) {
  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `<h1>Thank you for your order!</h1><p>Order ${order.orderNumber} for KSh ${order.totalAmount.toLocaleString()} has been received.</p>`,
    text: `Thank you for your order! Order ${order.orderNumber} for KSh ${order.totalAmount.toLocaleString()} has been received.`,
  })
}

export async function sendContactNotification(data: { name: string; email: string; message: string }) {
  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'info@bigmancomputers.co.ke',
    subject: `Contact Form: ${data.name}`,
    html: `<p><strong>${data.name}</strong> (${data.email}) wrote:</p><p>${data.message}</p>`,
    text: `${data.name} (${data.email}) wrote: ${data.message}`,
  })
}
