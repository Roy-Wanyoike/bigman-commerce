// KSh price formatting - always uses "KSh" prefix, comma-separated, 0 decimals
export function formatPrice(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`
}

export function getDiscount(base: number, compare: number | null): number | null {
  if (!compare || compare <= base) return null
  return Math.round(((compare - base) / compare) * 100)
}

export const conditionLabels: Record<string, string> = {
  NEW: 'New',
  REFURBISHED: 'Refurbished',
  USED: 'Used',
  OPEN_BOX: 'Open Box',
  CLEARANCE: 'Clearance',
}

export const conditionGrades: Record<string, string> = {
  A_PLUS: 'A+',
  A: 'A',
  B_PLUS: 'B+',
  B: 'B',
  C: 'C',
}

export function stockStatus(stock: number, tracking: boolean): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (!tracking) return { label: 'In Stock', variant: 'default' }
  if (stock <= 0) return { label: 'Out of Stock', variant: 'destructive' }
  if (stock <= 5) return { label: `Only ${stock} left`, variant: 'secondary' }
  return { label: 'In Stock', variant: 'default' }
}
