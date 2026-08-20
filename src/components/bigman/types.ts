export interface CategoryNode {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  level: number
  navIcon: string | null
  navColumns: number
  showInNav: boolean
  children: CategoryNode[]
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  isActive: boolean
  _count?: { products: number }
}

export interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  brandId: string | null
  businessUnitId: string | null
  condition: string
  conditionGrade: string | null
  conditionNote: string | null
  basePrice: number
  salePrice: number | null
  costPrice: number | null
  compareAtPrice: number | null
  wholesalePrice: number | null
  corporatePrice: number | null
  currency: string
  productType: string
  specifications: string | null
  thumbnail: string | null
  images: string | null
  videoUrl: string | null
  trackInventory: boolean
  stockCount: number
  warrantyMonths: number | null
  status: string
  isFeatured: boolean
  isDeal: boolean
  isGaming: boolean
  publishedAt: Date | null
  compatibleModels: string | null
  sku: string | null
  partNumber: string | null
  brand: Brand | null
  categories: { category: { id: string; name: string; slug: string } }[]
  productImages?: {
    id: string
    url: string
    altText?: string
    isPrimary: boolean
    imageType?: string
    status: string
    width?: number
    height?: number
  }[]
}

export interface ServiceItem {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  basePrice: number
  salePrice: number | null
  currency: string
  duration: string | null
  isActive: boolean
  serviceType: string | null
}

import type { LucideIcon } from 'lucide-react'
import { GraduationCap, Code, Palette, Gamepad2, Building2, Home } from 'lucide-react'

export const useCases: { name: string; slug: string; icon: LucideIcon; desc: string }[] = [
  { name: 'For Students', slug: 'students', icon: GraduationCap, desc: 'Affordable laptops and accessories for academic success' },
  { name: 'For Developers', slug: 'developers', icon: Code, desc: 'High-performance machines for coding and engineering' },
  { name: 'For Designers', slug: 'designers', icon: Palette, desc: 'Color-accurate displays and creative workstations' },
  { name: 'For Gamers', slug: 'gamers', icon: Gamepad2, desc: 'Gaming laptops, PCs, monitors and peripherals' },
  { name: 'For Businesses', slug: 'businesses', icon: Building2, desc: 'Corporate solutions, bulk orders and IT setup' },
  { name: 'For Remote Work', slug: 'remote', icon: Home, desc: 'Work-from-home essentials and setups' },
]

export const budgetPages = [
  { label: 'Under KSh 20K', max: 20000 },
  { label: 'Under KSh 30K', max: 30000 },
  { label: 'Under KSh 50K', max: 50000 },
  { label: 'Under KSh 75K', max: 75000 },
  { label: 'Under KSh 100K', max: 100000 },
]
