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
  slug?: string
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
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number

  // Wishlist
  wishlist: { productId: string; name: string; price: number; image?: string; slug?: string; brand?: string }[]
  toggleWishlist: (item: { productId: string; name: string; price: number; image?: string; slug?: string; brand?: string }) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void

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
  updateQuantity: (productId, quantity) => set((s) => {
    if (quantity <= 0) return { cart: s.cart.filter(c => c.productId !== productId) }
    return { cart: s.cart.map(c => c.productId === productId ? { ...c, quantity } : c) }
  }),
  clearCart: () => set({ cart: [] }),
  cartTotal: () => get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
  cartCount: () => get().cart.reduce((sum, c) => sum + c.quantity, 0),

  wishlist: [],
  toggleWishlist: (item) => set((s) => ({
    wishlist: s.wishlist.find(w => w.productId === item.productId)
      ? s.wishlist.filter(w => w.productId !== item.productId)
      : [...s.wishlist, item]
  })),
  removeFromWishlist: (productId) => set((s) => ({ wishlist: s.wishlist.filter(w => w.productId !== productId) })),
  clearWishlist: () => set({ wishlist: [] }),

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
