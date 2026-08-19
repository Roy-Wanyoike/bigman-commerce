import { create } from 'zustand'

export interface CartItem {
  productId: string
  name: string
  price: number
  image?: string
  quantity: number
  condition?: string
  conditionGrade?: string
}

export interface CompareItem {
  productId: string
  name: string
  price: number
  brand?: string
  image?: string
  specs: Record<string, string>
}

interface StoreState {
  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number

  // Wishlist
  wishlist: string[]
  toggleWishlist: (productId: string) => void

  // Compare
  compareList: CompareItem[]
  addToCompare: (item: CompareItem) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void

  // Mobile menu
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void

  // Search
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // Active category filter
  activeCategory: string | null
  setActiveCategory: (cat: string | null) => void
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  addToCart: (item) => set((s) => {
    const existing = s.cart.find(c => c.productId === item.productId)
    if (existing) {
      return { cart: s.cart.map(c => c.productId === item.productId ? { ...c, quantity: c.quantity + item.quantity } : c) }
    }
    return { cart: [...s.cart, item] }
  }),
  removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter(c => c.productId !== productId) })),
  clearCart: () => set({ cart: [] }),
  cartTotal: () => get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
  cartCount: () => get().cart.reduce((sum, c) => sum + c.quantity, 0),

  wishlist: [],
  toggleWishlist: (productId) => set((s) => ({
    wishlist: s.wishlist.includes(productId) ? s.wishlist.filter(id => id !== productId) : [...s.wishlist, productId]
  })),

  compareList: [],
  addToCompare: (item) => set((s) => {
    if (s.compareList.length >= 4 || s.compareList.find(c => c.productId === item.productId)) return s
    return { compareList: [...s.compareList, item] }
  }),
  removeFromCompare: (productId) => set((s) => ({ compareList: s.compareList.filter(c => c.productId !== productId) })),
  clearCompare: () => set({ compareList: [] }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  activeCategory: null,
  setActiveCategory: (cat) => set({ activeCategory: cat }),
}))
