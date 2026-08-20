import { Suspense } from 'react'
import CartClient from './CartClient'

export const metadata = {
  title: 'Cart | Bigman Computers',
  description: 'Review your cart and proceed to checkout at Bigman Computers, Nairobi.',
}

export default function CartPage() {
  return (
    <Suspense>
      <CartClient />
    </Suspense>
  )
}