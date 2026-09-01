import { formatPrice } from '@/lib/prices'

/**
 * Product shape expected by B2B pricing helpers.
 * Compatible with the Prisma Product model's scalar price fields.
 */
interface PriceableProduct {
  basePrice: number
  salePrice: number | null
  wholesalePrice: number | null
  corporatePrice: number | null
}

/**
 * Item in a bulk quote — must have a unit price and quantity.
 */
interface BulkQuoteItem {
  unitPrice: number
  quantity: number
}

/**
 * Resolves the appropriate price for a product based on the user's role.
 *
 * Priority:
 *  1. Verified business → corporatePrice
 *  2. Staff → wholesalePrice
 *  3. Everyone else → salePrice (if active) or basePrice
 */
export function getB2BPrice(product: PriceableProduct, userRole: string, isVerifiedBusiness?: boolean): number {
  // Verified business users get corporate pricing
  if (isVerifiedBusiness || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
    if (product.corporatePrice != null && product.corporatePrice > 0) {
      return product.corporatePrice
    }
  }

  // Staff get wholesale pricing
  if (userRole === 'STAFF') {
    if (product.wholesalePrice != null && product.wholesalePrice > 0) {
      return product.wholesalePrice
    }
  }

  // Fallback: sale price if available, else base price
  if (product.salePrice != null && product.salePrice > 0) {
    return product.salePrice
  }

  return product.basePrice
}

/**
 * Calculates a bulk discount based on total item count.
 *
 * Tiers:
 *   5+ items  → 5%
 *   10+ items → 8%
 *   20+ items → 12%
 *   50+ items → 15%
 */
export function getBulkDiscount(quantity: number, baseTotal: number): number {
  let rate = 0
  if (quantity >= 50) rate = 0.15
  else if (quantity >= 20) rate = 0.12
  else if (quantity >= 10) rate = 0.08
  else if (quantity >= 5) rate = 0.05

  return Math.round(baseTotal * rate)
}

/**
 * Formats a bulk quote summary with subtotal, discount, and total.
 */
export function formatBulkQuote(items: BulkQuoteItem[]): {
  subtotal: number
  discount: number
  total: number
  formatted: {
    subtotal: string
    discount: string
    total: string
  }
} {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
  const discount = getBulkDiscount(totalQuantity, subtotal)
  const total = subtotal - discount

  return {
    subtotal,
    discount,
    total,
    formatted: {
      subtotal: formatPrice(subtotal),
      discount: formatPrice(discount),
      total: formatPrice(total),
    },
  }
}

// Re-export formatPrice for convenience
export { formatPrice } from '@/lib/prices'
