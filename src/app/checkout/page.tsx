import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export const metadata = {
  title: 'Checkout | Bigman Computers',
  description: 'Complete your purchase at Bigman Computers. M-Pesa, delivery across Kenya.',
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutClient />
    </Suspense>
  )
}