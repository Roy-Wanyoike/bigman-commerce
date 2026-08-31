import WishlistClient from './WishlistClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wishlist | Bigman Computers',
  description: 'Your saved products and favorites at Bigman Computers.',
}

export default function WishlistPage() {
  return <WishlistClient />
}
