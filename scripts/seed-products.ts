/**
 * Bigman Commerce - Product Seeding Script
 * Seeds 45+ products across all categories with 2-4 images each.
 * Idempotent: skips products that already exist by slug.
 */
import { db } from '../src/lib/db'

// ── helpers ──────────────────────────────────────────────────────────────────
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toKebab(name: string): string {
  return slug(name)
}

function compareAt(base: number, pct: number): number {
  return Math.round(base * (1 + pct / 100))
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ── types ────────────────────────────────────────────────────────────────────
interface ProductSeed {
  name: string
  brand: string
  condition: 'NEW' | 'REFURBISHED'
  conditionGrade?: string
  basePrice: number
  compareAtPct: number      // percentage above basePrice for "was" price
  warrantyMonths: number
  stockCount: number
  isFeatured: boolean
  isDeal: boolean
  isGaming: boolean
  dealLabel?: string
  categories: string[]       // slug patterns to match
  specifications: Record<string, string>
  shortDescription: string
  seoTitle: string
  seoDescription: string
  sku: string
  imageCount: number         // 2-4
}

// ── product data ─────────────────────────────────────────────────────────────
const products: ProductSeed[] = [
  // ════════════════════════════════════════════════════════════════════
  // LAPTOPS (10)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'HP ProBook 450 G10', brand: 'HP', condition: 'NEW',
    basePrice: 89500, compareAtPct: 15, warrantyMonths: 12, stockCount: 12,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['laptops', 'laptops/hp', 'laptops/business', 'laptops/new'],
    specifications: { processor: 'Intel Core i5-1335U (12M Cache, up to 4.6 GHz)', ram: '8GB DDR5-4800', storage: '512GB PCIe NVMe SSD', display: '15.6" FHD (1920×1080) IPS, 250 nits', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Pro', battery: 'Up to 10 hours', weight: '1.74 kg' },
    shortDescription: 'Reliable business laptop with 13th Gen Intel Core i5, 8GB DDR5 RAM, and 512GB SSD. Ideal for professionals.',
    seoTitle: 'HP ProBook 450 G10 Laptop Kenya - Bigman Computers',
    seoDescription: 'Buy HP ProBook 450 G10 with Intel Core i5-1335U, 8GB DDR5, 512GB SSD in Nairobi. Best price at Bigman Computers.',
    sku: 'HP-PB450G10-I5', imageCount: 3
  },
  {
    name: 'HP EliteBook 860 G10', brand: 'HP', condition: 'REFURBISHED', conditionGrade: 'A',
    basePrice: 105000, compareAtPct: 20, warrantyMonths: 6, stockCount: 5,
    isFeatured: true, isDeal: true, isGaming: false, dealLabel: 'Refurbished Deal',
    categories: ['laptops', 'laptops/hp', 'laptops/business'],
    specifications: { processor: 'Intel Core i7-1365U (12M Cache, up to 5.2 GHz)', ram: '16GB DDR5-5600', storage: '512GB PCIe NVMe SSD', display: '16" WUXGA (1920×1200) IPS, 400 nits', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Pro', battery: 'Up to 13 hours', weight: '1.81 kg' },
    shortDescription: 'Premium refurbished business laptop with Intel Core i7, 16GB RAM, 16" WUXGA display. Grade A condition.',
    seoTitle: 'HP EliteBook 860 G10 Refurbished Laptop Kenya',
    seoDescription: 'Save big on HP EliteBook 860 G10 refurbished. Intel i7-1365U, 16GB DDR5, 512GB SSD. Grade A. Bigman Computers Nairobi.',
    sku: 'HP-EB860G10-RFB', imageCount: 3
  },
  {
    name: 'Dell Inspiron 15 3530', brand: 'Dell', condition: 'NEW',
    basePrice: 62000, compareAtPct: 12, warrantyMonths: 12, stockCount: 18,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['laptops', 'laptops/dell', 'laptops/new'],
    specifications: { processor: 'Intel Core i5-1335U (12M Cache, up to 4.6 GHz)', ram: '8GB DDR5-4800', storage: '256GB PCIe NVMe SSD', display: '15.6" FHD (1920×1080) WVA, 250 nits', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Home', battery: 'Up to 8 hours', weight: '1.76 kg' },
    shortDescription: 'Affordable everyday laptop with Intel i5, 8GB RAM, and 256GB SSD. Great for home and student use.',
    seoTitle: 'Dell Inspiron 15 3530 Laptop Kenya - Bigman Computers',
    seoDescription: 'Buy Dell Inspiron 15 3530 with Intel Core i5, 8GB DDR5, 256GB SSD. Best prices in Nairobi at Bigman Computers.',
    sku: 'DEL-IN153530-I5', imageCount: 3
  },
  {
    name: 'Dell Vostro 3520', brand: 'Dell', condition: 'NEW',
    basePrice: 58000, compareAtPct: 15, warrantyMonths: 12, stockCount: 15,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Business Value',
    categories: ['laptops', 'laptops/dell', 'laptops/business'],
    specifications: { processor: 'Intel Core i3-1215U (10M Cache, up to 4.4 GHz)', ram: '8GB DDR4-3200', storage: '256GB PCIe NVMe SSD', display: '15.6" FHD (1920×1080) WVA, 250 nits', gpu: 'Intel UHD Graphics', os: 'Windows 11 Pro', battery: 'Up to 7 hours', weight: '1.69 kg' },
    shortDescription: 'Budget-friendly business laptop with Intel Core i3, 8GB RAM, and Windows 11 Pro.',
    seoTitle: 'Dell Vostro 3520 Business Laptop Kenya',
    seoDescription: 'Dell Vostro 3520 with Intel i3, 8GB DDR4, 256GB SSD, Windows 11 Pro. Best business laptop deal at Bigman Computers.',
    sku: 'DEL-V3520-I3', imageCount: 2
  },
  {
    name: 'Dell Latitude 7440', brand: 'Dell', condition: 'REFURBISHED', conditionGrade: 'A',
    basePrice: 120000, compareAtPct: 20, warrantyMonths: 6, stockCount: 4,
    isFeatured: true, isDeal: true, isGaming: false, dealLabel: 'Premium Refurbished',
    categories: ['laptops', 'laptops/dell', 'laptops/business'],
    specifications: { processor: 'Intel Core i7-1365U (12M Cache, up to 5.2 GHz)', ram: '16GB LPDDR5-5200', storage: '512GB PCIe NVMe SSD', display: '14" QHD+ (2560×1600) IPS, 300 nits', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Pro', battery: 'Up to 14 hours', weight: '1.39 kg' },
    shortDescription: 'Ultra-light premium refurbished business laptop. QHD+ display, 16GB RAM, Grade A condition.',
    seoTitle: 'Dell Latitude 7440 Refurbished - Bigman Computers',
    seoDescription: 'Dell Latitude 7440 refurbished in Grade A. Intel i7, 16GB, 512GB SSD, 14" QHD+ display. 6-month warranty.',
    sku: 'DEL-L7440-RFB', imageCount: 3
  },
  {
    name: 'Lenovo ThinkPad T14 Gen 4', brand: 'Lenovo', condition: 'NEW',
    basePrice: 155000, compareAtPct: 15, warrantyMonths: 12, stockCount: 8,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['laptops', 'laptops/lenovo', 'laptops/business', 'laptops/new'],
    specifications: { processor: 'Intel Core i7-1365U (12M Cache, up to 5.2 GHz)', ram: '16GB DDR5-5600', storage: '512GB PCIe Gen4 NVMe SSD', display: '14" WUXGA (1920×1200) IPS, 400 nits, low power', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Pro', battery: 'Up to 15 hours', weight: '1.37 kg' },
    shortDescription: 'Legendary ThinkPad keyboard and durability. Intel i7, 16GB DDR5, WUXGA display.',
    seoTitle: 'Lenovo ThinkPad T14 Gen 4 Kenya - Bigman Computers',
    seoDescription: 'Buy Lenovo ThinkPad T14 Gen 4 with Intel i7-1365U, 16GB DDR5, 512GB SSD. Best ThinkPad deals at Bigman Computers.',
    sku: 'LNV-T14G4-I7', imageCount: 4
  },
  {
    name: 'Lenovo IdeaPad Slim 5', brand: 'Lenovo', condition: 'NEW',
    basePrice: 72000, compareAtPct: 12, warrantyMonths: 12, stockCount: 20,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['laptops', 'laptops/lenovo', 'laptops/new'],
    specifications: { processor: 'AMD Ryzen 5 7530U (8C/16T, up to 4.5 GHz)', ram: '8GB LPDDR5-6400', storage: '512GB PCIe NVMe SSD', display: '14" WUXGA (1920×1200) OLED, 400 nits', gpu: 'AMD Radeon Graphics', os: 'Windows 11 Home', battery: 'Up to 12 hours', weight: '1.46 kg' },
    shortDescription: 'Stylish thin-and-light with OLED display and AMD Ryzen 5. Great value for everyday computing.',
    seoTitle: 'Lenovo IdeaPad Slim 5 Laptop Kenya',
    seoDescription: 'Buy Lenovo IdeaPad Slim 5 with AMD Ryzen 5, 8GB, 512GB SSD, 14" OLED display. Bigman Computers Nairobi.',
    sku: 'LNV-IPS5-R5', imageCount: 3
  },
  {
    name: 'ASUS ZenBook 14', brand: 'ASUS', condition: 'NEW',
    basePrice: 95000, compareAtPct: 18, warrantyMonths: 12, stockCount: 10,
    isFeatured: true, isDeal: true, isGaming: false, dealLabel: 'Premium Ultrabook',
    categories: ['laptops', 'laptops/asus', 'laptops/new'],
    specifications: { processor: 'Intel Core i7-1355U (12M Cache, up to 5.0 GHz)', ram: '16GB LPDDR5-5200', storage: '512GB PCIe NVMe SSD', display: '14" 2.8K (2880×1800) OLED, 600 nits, 90Hz', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Home', battery: 'Up to 14 hours', weight: '1.28 kg' },
    shortDescription: 'Stunning 2.8K OLED display in a 1.28kg ultraportable. Intel i7, 16GB RAM, all-day battery.',
    seoTitle: 'ASUS ZenBook 14 OLED Laptop Kenya',
    seoDescription: 'Buy ASUS ZenBook 14 with 2.8K OLED, Intel i7-1355U, 16GB, 512GB SSD. Premium ultrabook at Bigman Computers.',
    sku: 'ASUS-ZB14-I7', imageCount: 3
  },
  {
    name: 'Acer Aspire 5', brand: 'Acer', condition: 'REFURBISHED', conditionGrade: 'B',
    basePrice: 45000, compareAtPct: 15, warrantyMonths: 6, stockCount: 7,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Budget Deal',
    categories: ['laptops', 'laptops/acer', 'laptops/student'],
    specifications: { processor: 'AMD Ryzen 3 5300U (4C/8T, up to 3.8 GHz)', ram: '8GB DDR4-3200', storage: '256GB PCIe NVMe SSD', display: '15.6" FHD (1920×1080) IPS, 300 nits', gpu: 'AMD Radeon Graphics', os: 'Windows 11 Home', battery: 'Up to 8 hours', weight: '1.8 kg' },
    shortDescription: 'Affordable refurbished laptop for students and home use. Grade B with full functionality.',
    seoTitle: 'Acer Aspire 5 Refurbished Laptop Kenya',
    seoDescription: 'Buy refurbished Acer Aspire 5 with AMD Ryzen 3, 8GB, 256GB SSD. Grade B, 6-month warranty. Bigman Computers.',
    sku: 'ACR-AP5-RFB', imageCount: 2
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', condition: 'REFURBISHED', conditionGrade: 'A',
    basePrice: 185000, compareAtPct: 20, warrantyMonths: 6, stockCount: 3,
    isFeatured: true, isDeal: true, isGaming: false, dealLabel: 'Flagship Refurbished',
    categories: ['laptops', 'laptops/lenovo', 'laptops/business'],
    specifications: { processor: 'Intel Core i7-1365U (12M Cache, up to 5.2 GHz)', ram: '32GB LPDDR5-5200', storage: '1TB PCIe Gen4 NVMe SSD', display: '14" 2.8K (2880×1800) OLED, 400 nits', gpu: 'Intel Iris Xe Graphics', os: 'Windows 11 Pro', battery: 'Up to 15 hours', weight: '1.12 kg' },
    shortDescription: 'The ultimate business ultrabook. 2.8K OLED, 32GB RAM, 1TB SSD, 1.12kg. Grade A refurbished.',
    seoTitle: 'Lenovo ThinkPad X1 Carbon Gen 11 Refurbished Kenya',
    seoDescription: 'Save on Lenovo X1 Carbon Gen 11. Intel i7, 32GB, 1TB SSD, 2.8K OLED. Grade A. Bigman Computers Nairobi.',
    sku: 'LNV-X1C11-RFB', imageCount: 4
  },

  // ════════════════════════════════════════════════════════════════════
  // DESKTOPS (4)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'HP ProDesk 600 G9 Desktop', brand: 'HP', condition: 'NEW',
    basePrice: 85000, compareAtPct: 15, warrantyMonths: 12, stockCount: 10,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['desktops', 'desktops/office', 'desktops/business'],
    specifications: { processor: 'Intel Core i5-12500T (12M Cache, up to 4.4 GHz)', ram: '8GB DDR5-4800', storage: '512GB PCIe NVMe SSD', gpu: 'Intel UHD Graphics 770', os: 'Windows 11 Pro', case: 'SFF Tower', expansion: '1x PCIe 4.0 x16, 2x PCIe 3.0 x1', ports: '6x USB-A, 2x USB-C, DisplayPort, HDMI' },
    shortDescription: 'Compact and powerful office desktop with 12th Gen Intel i5, 8GB DDR5, 512GB SSD.',
    seoTitle: 'HP ProDesk 600 G9 Desktop PC Kenya',
    seoDescription: 'Buy HP ProDesk 600 G9 with Intel i5-12500T, 8GB DDR5, 512GB SSD. Best desktop prices at Bigman Computers.',
    sku: 'HP-PD600G9-I5', imageCount: 2
  },
  {
    name: 'Dell OptiPlex 7010 SFF', brand: 'Dell', condition: 'NEW',
    basePrice: 92000, compareAtPct: 12, warrantyMonths: 12, stockCount: 8,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['desktops', 'desktops/office', 'desktops/business'],
    specifications: { processor: 'Intel Core i5-13500 (24M Cache, up to 4.8 GHz)', ram: '8GB DDR5-4800', storage: '256GB PCIe NVMe SSD', gpu: 'Intel UHD Graphics 770', os: 'Windows 11 Pro', case: 'Small Form Factor', expansion: '1x PCIe 5.0 x16, 1x PCIe 3.0 x1', ports: '5x USB-A, 1x USB-C, DP, HDMI, RJ-45' },
    shortDescription: 'Reliable business desktop with 13th Gen Intel i5, 8GB DDR5, and Windows 11 Pro.',
    seoTitle: 'Dell OptiPlex 7010 SFF Desktop Kenya',
    seoDescription: 'Buy Dell OptiPlex 7010 SFF with Intel i5-13500, 8GB DDR5, 256GB SSD. Business desktop at Bigman Computers.',
    sku: 'DEL-O7010SFF-I5', imageCount: 2
  },
  {
    name: 'Lenovo ThinkCentre M70s', brand: 'Lenovo', condition: 'REFURBISHED', conditionGrade: 'A',
    basePrice: 65000, compareAtPct: 18, warrantyMonths: 6, stockCount: 6,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Refurbished Desktop',
    categories: ['desktops', 'desktops/office', 'desktops/refurbished'],
    specifications: { processor: 'Intel Core i5-11400T (12M Cache, up to 4.1 GHz)', ram: '8GB DDR4-3200', storage: '256GB PCIe NVMe SSD', gpu: 'Intel UHD Graphics 730', os: 'Windows 11 Pro', case: 'Tower', expansion: '1x PCIe 4.0 x16, 2x PCIe 3.0 x1', ports: '6x USB-A, 1x USB-C, DP, HDMI' },
    shortDescription: 'Refurbished Lenovo desktop with Intel i5, 8GB RAM, 256GB SSD. Grade A, office-ready.',
    seoTitle: 'Lenovo ThinkCentre M70s Refurbished Desktop Kenya',
    seoDescription: 'Buy refurbished Lenovo ThinkCentre M70s. Intel i5, 8GB DDR4, 256GB SSD. Grade A, 6-month warranty. Bigman Computers.',
    sku: 'LNV-M70S-RFB', imageCount: 2
  },
  {
    name: 'HP EliteDesk 805 G8 Mini PC', brand: 'HP', condition: 'NEW',
    basePrice: 110000, compareAtPct: 15, warrantyMonths: 12, stockCount: 5,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['desktops', 'desktops/office', 'desktops/mini-pcs'],
    specifications: { processor: 'AMD Ryzen 5 PRO 5650G (6C/12T, up to 4.4 GHz)', ram: '16GB DDR4-3200', storage: '512GB PCIe NVMe SSD', gpu: 'AMD Radeon Graphics (integrated)', os: 'Windows 11 Pro', case: 'Mini PC (1L)', expansion: '1x PCIe 3.0 x16, 1x M.2', ports: '5x USB-A, 1x USB-C, DP, HDMI, RJ-45' },
    shortDescription: 'Ultra-compact mini PC with AMD Ryzen 5 PRO, 16GB RAM. Perfect for space-constrained offices.',
    seoTitle: 'HP EliteDesk 805 G8 Mini PC Kenya',
    seoDescription: 'Buy HP EliteDesk 805 G8 Mini PC with AMD Ryzen 5 PRO, 16GB, 512GB SSD. Compact business desktop at Bigman Computers.',
    sku: 'HP-ED805G8-R5', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // MONITORS (4)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'LG 24MR400-B 24" Monitor', brand: 'LG', condition: 'NEW',
    basePrice: 22000, compareAtPct: 15, warrantyMonths: 12, stockCount: 15,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Office Value',
    categories: ['monitors', 'monitors/office'],
    specifications: { size: '24"', resolution: '1920×1080 (FHD)', panel: 'IPS', refreshRate: '75Hz', responseTime: '5ms', ports: 'HDMI, VGA', features: 'Reader Mode, Flicker Safe, OnScreen Control' },
    shortDescription: 'Affordable 24" IPS monitor with 75Hz refresh rate. Perfect for office work and everyday use.',
    seoTitle: 'LG 24MR400-B 24" Monitor Kenya',
    seoDescription: 'Buy LG 24MR400-B 24" FHD IPS 75Hz monitor. Best office monitor price in Nairobi at Bigman Computers.',
    sku: 'LG-24MR400', imageCount: 2
  },
  {
    name: 'Samsung ViewFinity S27A600U 27" 4K', brand: 'Samsung', condition: 'NEW',
    basePrice: 58000, compareAtPct: 12, warrantyMonths: 12, stockCount: 8,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['monitors', 'monitors/4k', 'monitors/professional'],
    specifications: { size: '27"', resolution: '3840×2160 (4K UHD)', panel: 'IPS', refreshRate: '60Hz', responseTime: '5ms', ports: 'USB-C (90W PD), 2x HDMI, DisplayPort', features: 'HDR10, TÜV Rheinland Eye Comfort, USB Hub', color: '99% sRGB, 95% DCI-P3' },
    shortDescription: 'Professional 27" 4K IPS monitor with USB-C 90W power delivery and HDR10 support.',
    seoTitle: 'Samsung ViewFinity S27A600U 4K Monitor Kenya',
    seoDescription: 'Buy Samsung ViewFinity S27A600U 27" 4K USB-C monitor. Professional display at best price. Bigman Computers Nairobi.',
    sku: 'SAM-S27A600U', imageCount: 3
  },
  {
    name: 'Dell UltraSharp U2723QE 27" 4K', brand: 'Dell', condition: 'NEW',
    basePrice: 78000, compareAtPct: 15, warrantyMonths: 12, stockCount: 6,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['monitors', 'monitors/4k', 'monitors/professional', 'monitors/office'],
    specifications: { size: '27"', resolution: '3840×2160 (4K UHD)', panel: 'IPS Black', refreshRate: '60Hz', responseTime: '5ms', ports: 'USB-C (90W PD), 2x HDMI, DP 1.4, 5x USB-A, RJ-45', features: 'KVM Switch, Picture-by-Picture, ComfortView Plus', color: '98% DCI-P3, 100% sRGB' },
    shortDescription: 'Premium 27" 4K monitor with IPS Black panel, USB-C hub with RJ-45, and built-in KVM switch.',
    seoTitle: 'Dell UltraSharp U2723QE 4K Monitor Kenya',
    seoDescription: 'Buy Dell UltraSharp U2723QE 27" 4K USB-C monitor. IPS Black panel, KVM, 90W PD. Premium display at Bigman Computers.',
    sku: 'DEL-U2723QE', imageCount: 3
  },
  {
    name: 'HP E24 G5 FHD Monitor', brand: 'HP', condition: 'NEW',
    basePrice: 28000, compareAtPct: 12, warrantyMonths: 12, stockCount: 12,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['monitors', 'monitors/office'],
    specifications: { size: '24"', resolution: '1920×1080 (FHD)', panel: 'IPS', refreshRate: '75Hz', responseTime: '5ms', ports: 'HDMI, DisplayPort, VGA', features: 'Low Blue Light, Adjustable stand (tilt, swivel, pivot, height)', ergonomics: '100mm height adjust, 90° pivot, ±45° swivel' },
    shortDescription: 'Ergonomic 24" FHD IPS monitor with adjustable stand. Ideal for long work sessions.',
    seoTitle: 'HP E24 G5 FHD Monitor Kenya',
    seoDescription: 'Buy HP E24 G5 24" FHD IPS monitor with ergonomic stand. Best office monitor at Bigman Computers Nairobi.',
    sku: 'HP-E24G5', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // KEYBOARDS (3)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'Logitech K380 Multi-Device Keyboard', brand: 'Logitech', condition: 'NEW',
    basePrice: 5500, compareAtPct: 15, warrantyMonths: 12, stockCount: 25,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/keyboards'],
    specifications: { type: 'Wireless Bluetooth', layout: 'Full-size compact', connectivity: 'Bluetooth 3.0, Bluetooth 4.0 LE', battery: '2x AAA (up to 24 months)', compatibility: 'Windows, macOS, Chrome OS, Android, iOS', weight: '423g', color: 'Graphite' },
    shortDescription: 'Slim wireless keyboard that connects to 3 devices. Perfect for multi-device workflows.',
    seoTitle: 'Logitech K380 Multi-Device Keyboard Kenya',
    seoDescription: 'Buy Logitech K380 Bluetooth keyboard. Connects to 3 devices, 24-month battery. Best price at Bigman Computers.',
    sku: 'LOG-K380', imageCount: 2
  },
  {
    name: 'HP K3100 Wireless Keyboard', brand: 'HP', condition: 'NEW',
    basePrice: 4500, compareAtPct: 18, warrantyMonths: 12, stockCount: 20,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Accessory Deal',
    categories: ['accessories', 'accessories/keyboards'],
    specifications: { type: 'Wireless 2.4GHz', layout: 'Full-size with numeric keypad', connectivity: 'USB 2.4GHz dongle', battery: '2x AAA (up to 12 months)', compatibility: 'Windows, Chrome OS', weight: '520g', features: 'Adjustable tilt feet, spill-resistant' },
    shortDescription: 'Reliable wireless keyboard with full-size layout and numeric keypad. Spill-resistant design.',
    seoTitle: 'HP K3100 Wireless Keyboard Kenya',
    seoDescription: 'Buy HP K3100 wireless keyboard with numeric keypad. Spill-resistant, 12-month battery. Bigman Computers Nairobi.',
    sku: 'HP-K3100', imageCount: 2
  },
  {
    name: 'Dell KB216 Wired Keyboard', brand: 'Dell', condition: 'NEW',
    basePrice: 2500, compareAtPct: 20, warrantyMonths: 12, stockCount: 30,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/keyboards'],
    specifications: { type: 'Wired USB', layout: 'Full-size with numeric keypad', connectivity: 'USB-A', compatibility: 'Windows', weight: '460g', features: 'Adjustable feet, durably built' },
    shortDescription: 'Simple and reliable wired USB keyboard. Full-size layout with numeric keypad.',
    seoTitle: 'Dell KB216 Wired Keyboard Kenya',
    seoDescription: 'Buy Dell KB216 wired USB keyboard. Full-size, reliable, affordable. Bigman Computers Nairobi.',
    sku: 'DEL-KB216', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // MICE (3)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'Logitech M590 Multi-Device Mouse', brand: 'Logitech', condition: 'NEW',
    basePrice: 5200, compareAtPct: 12, warrantyMonths: 12, stockCount: 22,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/mice'],
    specifications: { type: 'Wireless', connectivity: 'Bluetooth 4.0 LE, 2.4GHz USB', sensor: '1000 DPI optical', battery: '1x AA (up to 24 months)', buttons: '5 (including Forward/Back)', compatibility: 'Windows, macOS, Linux', weight: '110g', features: 'Silent clicks, dual-device, scroll wheel' },
    shortDescription: 'Silent wireless mouse with dual-device connectivity. 24-month battery life.',
    seoTitle: 'Logitech M590 Silent Mouse Kenya',
    seoDescription: 'Buy Logitech M590 multi-device silent mouse. Bluetooth + USB, 24-month battery. Bigman Computers Nairobi.',
    sku: 'LOG-M590', imageCount: 2
  },
  {
    name: 'HP X3000 Wireless Mouse', brand: 'HP', condition: 'NEW',
    basePrice: 2200, compareAtPct: 20, warrantyMonths: 12, stockCount: 30,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Budget Accessory',
    categories: ['accessories', 'accessories/mice'],
    specifications: { type: 'Wireless', connectivity: '2.4GHz USB dongle', sensor: '1600 DPI optical', battery: '1x AA (up to 12 months)', buttons: '3', compatibility: 'Windows, Chrome OS', weight: '80g' },
    shortDescription: 'Affordable and reliable wireless mouse with 1600 DPI sensor.',
    seoTitle: 'HP X3000 Wireless Mouse Kenya',
    seoDescription: 'Buy HP X3000 wireless mouse. 1600 DPI, 12-month battery, affordable. Bigman Computers Nairobi.',
    sku: 'HP-X3000', imageCount: 2
  },
  {
    name: 'Dell MS116 Wired Mouse', brand: 'Dell', condition: 'NEW',
    basePrice: 1500, compareAtPct: 15, warrantyMonths: 12, stockCount: 40,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/mice'],
    specifications: { type: 'Wired USB', connectivity: 'USB-A', sensor: '1000 DPI optical', buttons: '3', compatibility: 'Windows, Linux', weight: '75g' },
    shortDescription: 'Simple wired optical mouse. Plug and play, no drivers needed.',
    seoTitle: 'Dell MS116 Wired Mouse Kenya',
    seoDescription: 'Buy Dell MS116 wired USB mouse. Simple, reliable, affordable. Bigman Computers Nairobi.',
    sku: 'DEL-MS116', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // STORAGE (4)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'Samsung T7 Portable SSD 1TB', brand: 'Samsung', condition: 'NEW',
    basePrice: 14500, compareAtPct: 12, warrantyMonths: 12, stockCount: 18,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['storage', 'storage/external-ssd'],
    specifications: { capacity: '1TB', interface: 'USB 3.2 Gen 2', readSpeed: 'Up to 1,050 MB/s', writeSpeed: 'Up to 1,000 MB/s', formFactor: 'Portable (85g)', security: 'AES 256-bit hardware encryption', durability: 'IP65 water/dust resistant, drop-resistant', features: 'USB-C cable included, LED indicator' },
    shortDescription: 'Ultra-fast portable SSD with 1,050 MB/s read speeds. IP65 water and dust resistant.',
    seoTitle: 'Samsung T7 1TB Portable SSD Kenya',
    seoDescription: 'Buy Samsung T7 1TB portable SSD. 1,050 MB/s, IP65, USB-C. Best portable SSD price at Bigman Computers.',
    sku: 'SAM-T7-1TB', imageCount: 3
  },
  {
    name: 'WD Elements 2TB External HDD', brand: 'Western Digital', condition: 'NEW',
    basePrice: 9500, compareAtPct: 15, warrantyMonths: 12, stockCount: 14,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Storage Deal',
    categories: ['storage', 'storage/external-hdd'],
    specifications: { capacity: '2TB', interface: 'USB 3.0', readSpeed: 'Up to 120 MB/s', formFactor: '2.5" Portable', compatibility: 'Windows, macOS (reformat required)', weight: '134g', features: 'Plug and play, pre-formatted for Windows' },
    shortDescription: 'Reliable portable 2TB hard drive. Plug and play USB 3.0 for easy backups.',
    seoTitle: 'WD Elements 2TB External HDD Kenya',
    seoDescription: 'Buy WD Elements 2TB portable hard drive. USB 3.0, plug & play. Best price at Bigman Computers Nairobi.',
    sku: 'WD-ELEM-2TB', imageCount: 2
  },
  {
    name: 'Seagate Expansion 1TB External HDD', brand: 'Seagate', condition: 'NEW',
    basePrice: 6500, compareAtPct: 18, warrantyMonths: 12, stockCount: 20,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['storage', 'storage/external-hdd'],
    specifications: { capacity: '1TB', interface: 'USB 3.0', readSpeed: 'Up to 103 MB/s', formFactor: '2.5" Portable', compatibility: 'Windows, macOS', weight: '159g', features: 'Plug and play, drag-and-drop backup' },
    shortDescription: 'Affordable 1TB portable hard drive with USB 3.0. Simple drag-and-drop backup.',
    seoTitle: 'Seagate Expansion 1TB External HDD Kenya',
    seoDescription: 'Buy Seagate Expansion 1TB portable HDD. USB 3.0, plug & play. Best external hard drive price at Bigman Computers.',
    sku: 'SEA-EXP-1TB', imageCount: 2
  },
  {
    name: 'Kingston NV2 1TB NVMe SSD', brand: 'Kingston', condition: 'NEW',
    basePrice: 8900, compareAtPct: 15, warrantyMonths: 12, stockCount: 16,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'SSD Value',
    categories: ['storage', 'storage/ssd', 'hardware/ssds'],
    specifications: { capacity: '1TB', interface: 'PCIe Gen4x4 NVMe', formFactor: 'M.2 2280', readSpeed: '3,500 MB/s', writeSpeed: '2,800 MB/s', tbw: '640 TBW', controller: 'Phison E27T', features: 'Single-sided, slim design for notebooks' },
    shortDescription: 'High-performance PCIe 4.0 NVMe SSD. 3,500 MB/s read, single-sided M.2 2280 design.',
    seoTitle: 'Kingston NV2 1TB NVMe SSD Kenya',
    seoDescription: 'Buy Kingston NV2 1TB PCIe 4.0 NVMe SSD. 3,500 MB/s read. Best SSD price in Nairobi at Bigman Computers.',
    sku: 'KNG-NV2-1TB', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // NETWORKING (3)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'TP-Link Deco X50 WiFi 6 Mesh System (3-Pack)', brand: 'TP-Link', condition: 'NEW',
    basePrice: 32000, compareAtPct: 15, warrantyMonths: 12, stockCount: 8,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['networking', 'networking/routers'],
    specifications: { standard: 'WiFi 6 (802.11ax)', speed: 'AX3000 (2402 Mbps on 5GHz, 574 Mbps on 2.4GHz)', coverage: 'Up to 550 m² (3-pack)', ports: '2x Gigabit Ethernet per unit', features: 'Seamless roaming, HomeCare (antivirus, parental controls, QoS)', mesh: 'Deco Mesh Technology', bands: 'Dual-band' },
    shortDescription: 'Whole-home WiFi 6 mesh system. Covers up to 550 m² with seamless roaming and built-in security.',
    seoTitle: 'TP-Link Deco X50 WiFi 6 Mesh Kenya',
    seoDescription: 'Buy TP-Link Deco X50 3-pack mesh WiFi 6 system. Covers 550 m², AX3000. Best mesh WiFi price at Bigman Computers.',
    sku: 'TP-DECX50-3PK', imageCount: 3
  },
  {
    name: 'TP-Link TL-SG108 8-Port Gigabit Switch', brand: 'TP-Link', condition: 'NEW',
    basePrice: 8500, compareAtPct: 20, warrantyMonths: 12, stockCount: 15,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Networking Deal',
    categories: ['networking', 'networking/switches'],
    specifications: { ports: '8x Gigabit Ethernet (10/100/1000 Mbps)', switching: 'Non-blocking line-rate forwarding', buffer: '1.5 Mbit packet buffer', features: 'Plug and play, IGMP snooping, IEEE 802.3x flow control', power: 'Maximum 5.5W', standard: 'IEEE 802.3, 802.3u, 802.3ab, 802.3x' },
    shortDescription: 'Reliable 8-port unmanaged gigabit switch. Plug and play, no configuration needed.',
    seoTitle: 'TP-Link TL-SG108 8-Port Switch Kenya',
    seoDescription: 'Buy TP-Link TL-SG108 8-port gigabit switch. Plug & play, reliable. Best switch price at Bigman Computers.',
    sku: 'TP-SG108', imageCount: 2
  },
  {
    name: 'D-Link DIR-X1860 WiFi 6 Router', brand: 'D-Link', condition: 'NEW',
    basePrice: 15000, compareAtPct: 15, warrantyMonths: 12, stockCount: 10,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['networking', 'networking/routers'],
    specifications: { standard: 'WiFi 6 (802.11ax)', speed: 'AX1800 (1201 Mbps on 5GHz, 574 Mbps on 2.4GHz)', antennas: '4x high-gain external', ports: '4x Gigabit LAN, 1x Gigabit WAN', features: 'WPA3 encryption, MU-MIMO, OFDMA, BSS Coloring', processor: '1.5 GHz dual-core', memory: '256MB RAM, 128MB Flash' },
    shortDescription: 'High-performance WiFi 6 router with AX1800 speeds. WPA3 security, MU-MIMO, OFDMA.',
    seoTitle: 'D-Link DIR-X1860 WiFi 6 Router Kenya',
    seoDescription: 'Buy D-Link DIR-X1860 WiFi 6 router. AX1800, WPA3, MU-MIMO. Best router price at Bigman Computers Nairobi.',
    sku: 'DL-X1860', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // PRINTERS (3)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'HP DeskJet 2755e All-in-One Printer', brand: 'HP', condition: 'NEW',
    basePrice: 14000, compareAtPct: 15, warrantyMonths: 12, stockCount: 10,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Printer Deal',
    categories: ['printers', 'printers/hp', 'printers/all-in-one', 'printers/inkjet'],
    specifications: { type: 'All-in-One (Print, Scan, Copy)', technology: 'Thermal Inkjet', printSpeed: 'Up to 7.5 ppm (black), 5.5 ppm (color)', resolution: '1200 x 1200 dpi (black), 4800 x 1200 dpi (color)', connectivity: 'WiFi, USB, Bluetooth', paper: 'A4, A5, B5, Envelopes', features: 'Auto duplex, HP Smart app, 6 months Instant Ink included' },
    shortDescription: 'Affordable all-in-one printer with WiFi, auto duplex, and HP Instant Ink support.',
    seoTitle: 'HP DeskJet 2755e All-in-One Printer Kenya',
    seoDescription: 'Buy HP DeskJet 2755e all-in-one printer. Print, scan, copy, WiFi, auto duplex. Best price at Bigman Computers.',
    sku: 'HP-DJ2755E', imageCount: 3
  },
  {
    name: 'Canon PIXMA G3020 MegaTank Printer', brand: 'Canon', condition: 'NEW',
    basePrice: 24000, compareAtPct: 12, warrantyMonths: 12, stockCount: 7,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['printers', 'printers/canon', 'printers/all-in-one', 'printers/inkjet'],
    specifications: { type: 'All-in-One (Print, Scan, Copy)', technology: 'MegaTank Ink Tank', printSpeed: '10.8 ipm (black), 6.0 ipm (color)', resolution: '600 x 1200 dpi', connectivity: 'WiFi, USB', paper: 'A4, A5, B5, Envelopes, Photo Paper', features: 'Refillable ink tanks, borderless photo printing, built-in Wi-Fi', yield: 'Up to 7,700 pages (black), 7,700 pages (color)' },
    shortDescription: 'Ultra-low-cost-per-page printer with refillable ink tanks. Print up to 7,700 pages per set.',
    seoTitle: 'Canon PIXMA G3020 MegaTank Printer Kenya',
    seoDescription: 'Buy Canon PIXMA G3020 MegaTank printer. Refillable tanks, 7,700 pages, WiFi. Best tank printer price at Bigman Computers.',
    sku: 'CAN-G3020', imageCount: 3
  },
  {
    name: 'Epson WorkForce WF-2830 All-in-One', brand: 'Epson', condition: 'NEW',
    basePrice: 18000, compareAtPct: 15, warrantyMonths: 12, stockCount: 6,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['printers', 'printers/epson', 'printers/all-in-one', 'printers/inkjet'],
    specifications: { type: 'All-in-One (Print, Scan, Copy, Fax)', technology: 'PrecisionCore Inkjet', printSpeed: '14 ppm (black), 7.5 ppm (color)', resolution: '4800 x 1200 dpi', connectivity: 'WiFi, USB, WiFi Direct', paper: 'A4, A5, B5, Envelopes, Legal', features: '30-page ADF, auto duplex, 2.4" LCD, Epson Print Enabler', dutyCycle: 'Up to 3,000 pages/month' },
    shortDescription: 'Versatile all-in-one with fax, ADF, auto duplex, and WiFi Direct.',
    seoTitle: 'Epson WorkForce WF-2830 Printer Kenya',
    seoDescription: 'Buy Epson WorkForce WF-2830 all-in-one. Print, scan, copy, fax, ADF, WiFi. Best price at Bigman Computers.',
    sku: 'EPS-WF2830', imageCount: 3
  },

  // ════════════════════════════════════════════════════════════════════
  // ACCESSORIES (4)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'Targus Drifter II 17.3" Laptop Backpack', brand: 'Targus', condition: 'NEW',
    basePrice: 5500, compareAtPct: 18, warrantyMonths: 12, stockCount: 15,
    isFeatured: false, isDeal: true, isGaming: false, dealLabel: 'Bag Deal',
    categories: ['accessories', 'accessories/bags', 'bags-protection', 'bags-protection/backpacks'],
    specifications: { fit: 'Up to 17.3" laptops', material: 'Durable nylon', compartments: 'Padded laptop, tablet, accessories, front organizer', features: 'Ergonomic padded back, shoulder straps, trolley strap, rain cover', dimensions: '460 x 310 x 220 mm', weight: '1.1 kg' },
    shortDescription: 'Spacious 17.3" laptop backpack with padded compartment, ergonomic design, and rain cover.',
    seoTitle: 'Targus Drifter II 17.3" Backpack Kenya',
    seoDescription: 'Buy Targus Drifter II 17.3" laptop backpack. Padded, ergonomic, rain cover. Best backpack price at Bigman Computers.',
    sku: 'TG-DRII-173', imageCount: 3
  },
  {
    name: 'HP 240 Large Mouse Pad', brand: 'HP', condition: 'NEW',
    basePrice: 2500, compareAtPct: 20, warrantyMonths: 12, stockCount: 25,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/cleaning'],
    specifications: { size: '400 x 300 x 3 mm', material: 'Non-slip rubber base, smooth fabric surface', features: 'Anti-slip, edge stitching, machine washable', weight: '180g', color: 'Black' },
    shortDescription: 'Large non-slip mouse pad with smooth surface and anti-slip rubber base.',
    seoTitle: 'HP 240 Large Mouse Pad Kenya',
    seoDescription: 'Buy HP 240 large mouse pad. Non-slip, edge stitched, 400x300mm. Best price at Bigman Computers.',
    sku: 'HP-MP240', imageCount: 2
  },
  {
    name: 'Logitech C920 HD Pro Webcam', brand: 'Logitech', condition: 'NEW',
    basePrice: 12000, compareAtPct: 15, warrantyMonths: 12, stockCount: 10,
    isFeatured: true, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/webcams', 'office-technology/conference-cameras'],
    specifications: { resolution: '1080p Full HD at 30fps, 720p at 60fps', sensor: 'CMOS', fov: '78° diagonal', focus: 'Autofocus', mic: 'Dual stereo microphones with noise reduction', mounting: 'Universal clip (laptop, monitor, tripod)', compatibility: 'Windows, macOS, Chrome OS, Linux', cable: '1.5m USB-A' },
    shortDescription: 'Professional 1080p HD webcam with autofocus and dual stereo microphones for video calls.',
    seoTitle: 'Logitech C920 HD Pro Webcam Kenya',
    seoDescription: 'Buy Logitech C920 HD Pro 1080p webcam. Autofocus, stereo mics. Best webcam price at Bigman Computers Nairobi.',
    sku: 'LOG-C920', imageCount: 2
  },
  {
    name: 'Kensington SD4700P USB-C Docking Station', brand: 'Kensington', condition: 'NEW',
    basePrice: 18000, compareAtPct: 12, warrantyMonths: 12, stockCount: 5,
    isFeatured: false, isDeal: false, isGaming: false,
    categories: ['accessories', 'accessories/docking-stations'],
    specifications: { powerDelivery: '100W USB-C Power Delivery', video: 'Dual 4K HDMI (2x 4K@30Hz or 1x 4K@60Hz)', ports: '2x HDMI, 1x DisplayPort, 4x USB-A 3.2, 2x USB-C, 1x Gigabit Ethernet, 3.5mm audio', charging: '100W PD pass-through to laptop', compatibility: 'USB-C laptops (Windows, macOS, Chrome OS, Android)', weight: '370g' },
    shortDescription: 'Universal USB-C docking station with 100W PD, dual 4K HDMI, and Gigabit Ethernet.',
    seoTitle: 'Kensington SD4700P USB-C Dock Kenya',
    seoDescription: 'Buy Kensington SD4700P USB-C dock. 100W PD, dual 4K HDMI, GbE. Best dock price at Bigman Computers.',
    sku: 'KEN-SD4700P', imageCount: 2
  },

  // ════════════════════════════════════════════════════════════════════
  // GAMING (4 + 3 extra gaming peripherals = 7)
  // ════════════════════════════════════════════════════════════════════
  {
    name: 'ASUS ROG Strix G18 Gaming Laptop', brand: 'ASUS', condition: 'NEW',
    basePrice: 245000, compareAtPct: 15, warrantyMonths: 12, stockCount: 4,
    isFeatured: true, isDeal: false, isGaming: true,
    categories: ['laptops', 'laptops/asus', 'laptops/gaming', 'gaming', 'gaming/laptops'],
    specifications: { processor: 'Intel Core i9-13980HX (24C/32T, up to 5.6 GHz)', ram: '32GB DDR5-4800', storage: '1TB PCIe Gen4 NVMe SSD', display: '18" WUXGA (1920×1200) IPS, 240Hz, 3ms', gpu: 'NVIDIA RTX 4070 8GB GDDR6', os: 'Windows 11 Home', battery: '90Wh, up to 6 hours', weight: '2.7 kg', keyboard: 'RGB backlit, 1.7mm travel', cooling: '4x fans, 7x heat pipes, liquid metal on CPU' },
    shortDescription: 'Flagship 18" gaming laptop with Intel i9, RTX 4070, 240Hz display, and advanced cooling.',
    seoTitle: 'ASUS ROG Strix G18 Gaming Laptop Kenya',
    seoDescription: 'Buy ASUS ROG Strix G18 with i9-13980HX, RTX 4070, 32GB, 1TB. Premium gaming laptop at Bigman Computers.',
    sku: 'ASUS-ROG18G', imageCount: 4
  },
  {
    name: 'Acer Nitro V15 Gaming Laptop', brand: 'Acer', condition: 'NEW',
    basePrice: 135000, compareAtPct: 12, warrantyMonths: 12, stockCount: 6,
    isFeatured: true, isDeal: true, isGaming: true, dealLabel: 'Gaming Value',
    categories: ['laptops', 'laptops/acer', 'laptops/gaming', 'gaming', 'gaming/laptops'],
    specifications: { processor: 'Intel Core i5-13420H (8C/12T, up to 4.6 GHz)', ram: '16GB DDR5-4800', storage: '512GB PCIe Gen4 NVMe SSD', display: '15.6" FHD (1920×1080) IPS, 144Hz', gpu: 'NVIDIA RTX 4050 6GB GDDR6', os: 'Windows 11 Home', battery: '57.5Wh, up to 5 hours', weight: '2.1 kg', keyboard: 'RGB backlit, Acer NitroSense key', cooling: 'Dual fans, Acer CoolBoost technology' },
    shortDescription: 'Powerful mid-range gaming laptop with RTX 4050, 144Hz display, and 16GB DDR5.',
    seoTitle: 'Acer Nitro V15 Gaming Laptop Kenya',
    seoDescription: 'Buy Acer Nitro V15 with RTX 4050, i5-13420H, 16GB, 144Hz. Best gaming laptop deal at Bigman Computers.',
    sku: 'ACR-NV15', imageCount: 3
  },
  {
    name: 'Lenovo Legion Slim 5', brand: 'Lenovo', condition: 'REFURBISHED', conditionGrade: 'A',
    basePrice: 145000, compareAtPct: 20, warrantyMonths: 6, stockCount: 3,
    isFeatured: true, isDeal: true, isGaming: true, dealLabel: 'Refurbished Gaming',
    categories: ['laptops', 'laptops/lenovo', 'laptops/gaming', 'gaming', 'gaming/laptops'],
    specifications: { processor: 'AMD Ryzen 7 7840HS (8C/16T, up to 5.1 GHz)', ram: '16GB DDR5-5600', storage: '512GB PCIe Gen4 NVMe SSD', display: '16" WUXGA (2560×1600) IPS, 165Hz, 3ms', gpu: 'NVIDIA RTX 4060 8GB GDDR6', os: 'Windows 11 Home', battery: '71.4Wh, up to 7 hours', weight: '2.15 kg', keyboard: 'RGB backlit, 1.5mm travel', cooling: 'Coldfront 5.0 thermal system' },
    shortDescription: 'Sleek gaming laptop with RTX 4060, Ryzen 7, 165Hz display. Grade A refurbished.',
    seoTitle: 'Lenovo Legion Slim 5 Refurbished Kenya',
    seoDescription: 'Buy refurbished Lenovo Legion Slim 5. RTX 4060, Ryzen 7, 16GB, 165Hz. Grade A, 6-month warranty. Bigman Computers.',
    sku: 'LNV-LS5-RFB', imageCount: 3
  },
  {
    name: 'Dell G15 Gaming Laptop 5530', brand: 'Dell', condition: 'REFURBISHED', conditionGrade: 'B',
    basePrice: 98000, compareAtPct: 18, warrantyMonths: 6, stockCount: 5,
    isFeatured: false, isDeal: true, isGaming: true, dealLabel: 'Budget Gaming',
    categories: ['laptops', 'laptops/dell', 'laptops/gaming', 'gaming', 'gaming/laptops'],
    specifications: { processor: 'Intel Core i5-13450HX (10C/16T, up to 4.6 GHz)', ram: '8GB DDR5-4800', storage: '512GB PCIe NVMe SSD', display: '15.6" FHD (1920×1080) WVA, 120Hz', gpu: 'NVIDIA RTX 3050 6GB GDDR6', os: 'Windows 11 Home', battery: '86Wh, up to 5 hours', weight: '2.63 kg', keyboard: 'Blue backlit, 1.4mm travel', cooling: 'Dual fans, thermal venting' },
    shortDescription: 'Affordable refurbished gaming laptop with RTX 3050 and 120Hz display. Grade B.',
    seoTitle: 'Dell G15 5530 Refurbished Gaming Laptop Kenya',
    seoDescription: 'Buy refurbished Dell G15 5530. RTX 3050, i5, 8GB, 120Hz. Grade B, 6-month warranty. Bigman Computers.',
    sku: 'DEL-G15R-RFB', imageCount: 3
  },
  {
    name: 'HyperX Alloy Origins 60 Mechanical Keyboard', brand: 'HyperX', condition: 'NEW',
    basePrice: 11000, compareAtPct: 15, warrantyMonths: 12, stockCount: 8,
    isFeatured: true, isDeal: false, isGaming: true,
    categories: ['accessories', 'accessories/keyboards', 'gaming', 'gaming/keyboards'],
    specifications: { type: 'Mechanical (60% layout)', switches: 'HyperX Red (linear)', backlight: 'Per-key RGB, HyperX NGENUITY software', frame: 'Aircraft-grade aluminum', actuation: '1.8mm travel, 45g actuation force', features: 'On-board memory (3 profiles), detachable USB-C cable', compatibility: 'Windows, macOS, PS5, Xbox', weight: '843g' },
    shortDescription: 'Compact 60% mechanical keyboard with HyperX Red switches and per-key RGB lighting.',
    seoTitle: 'HyperX Alloy Origins 60 Keyboard Kenya',
    seoDescription: 'Buy HyperX Alloy Origins 60 mechanical keyboard. Red switches, per-key RGB, aluminum frame. Bigman Computers.',
    sku: 'HGX-AO60', imageCount: 2
  },
  {
    name: 'Logitech G502 HERO Gaming Mouse', brand: 'Logitech', condition: 'NEW',
    basePrice: 8000, compareAtPct: 15, warrantyMonths: 12, stockCount: 12,
    isFeatured: true, isDeal: false, isGaming: true,
    categories: ['accessories', 'accessories/mice', 'gaming', 'gaming/mice'],
    specifications: { sensor: 'HERO 25K (up to 25,600 DPI)', buttons: '11 programmable', weight: '121g (adjustable with included weights)', switches: 'Mechanical, 50M click durability', lighting: 'RGB Lightsync', features: 'On-board memory, 5 configurable weights (up to 16g), G HUB software', cable: '2.1m braided USB-A', feet: 'PTFE for low friction' },
    shortDescription: 'Iconic gaming mouse with HERO 25K sensor, 11 buttons, and adjustable weight system.',
    seoTitle: 'Logitech G502 HERO Gaming Mouse Kenya',
    seoDescription: 'Buy Logitech G502 HERO gaming mouse. 25,600 DPI, 11 buttons, adjustable weight. Best gaming mouse at Bigman Computers.',
    sku: 'LOG-G502H', imageCount: 3
  },
  {
    name: 'Razer Barracuda Pro Wireless Gaming Headset', brand: 'Razer', condition: 'NEW',
    basePrice: 18000, compareAtPct: 12, warrantyMonths: 12, stockCount: 7,
    isFeatured: false, isDeal: true, isGaming: true, dealLabel: 'Audio Deal',
    categories: ['accessories', 'accessories/headsets', 'gaming', 'gaming/headsets'],
    specifications: { type: 'Wireless over-ear', driver: '50mm TriForce Titanium', surround: 'THX Spatial Audio', mic: 'Detachable HyperClear Supercardioid', connectivity: '2.4GHz wireless + Bluetooth 5.2', battery: 'Up to 40 hours (with RGB off)', weight: '310g', features: 'Active Noise Cancellation, memory foam ear cushions, Razer Synapse' },
    shortDescription: 'Premium wireless gaming headset with THX Spatial Audio, ANC, and 40-hour battery.',
    seoTitle: 'Razer Barracuda Pro Wireless Headset Kenya',
    seoDescription: 'Buy Razer Barracuda Pro wireless gaming headset. THX Spatial Audio, ANC, 40h battery. Bigman Computers.',
    sku: 'RZR-BARPRO', imageCount: 3
  },
]

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════
async function main() {
  console.log('🔍 Looking up brands and categories...')

  // Build brand lookup
  const allBrands = await db.brand.findMany({ select: { id: true, name: true } })
  const brandMap = new Map(allBrands.map(b => [b.name, b.id]))

  // Build category lookup (both simple slug and parent/slug composite)
  const allCats = await db.category.findMany({ select: { id: true, slug: true, parentId: true } })
  const catMap = new Map<string, string>()
  for (const c of allCats) {
    catMap.set(c.slug, c.id)
    const parent = c.parentId ? allCats.find(p => p.id === c.parentId) : null
    if (parent) {
      catMap.set(`${parent.slug}/${c.slug}`, c.id)
    }
  }

  console.log(`   Brands: ${brandMap.size} | Categories: ${allCats.length}`)

  // Step 1: Update any DRAFT products to ACTIVE
  console.log('\n📦 Updating any DRAFT products to ACTIVE...')
  const draftUpdate = await db.product.updateMany({
    where: { status: 'DRAFT' },
    data: { status: 'ACTIVE', publishedAt: new Date() },
  })
  console.log(`   Updated ${draftUpdate.count} DRAFT products → ACTIVE`)

  // Step 2: Get business unit ID
  const bu = await db.businessUnit.findFirst({ where: { type: 'COMPUTERS' } })
  const businessUnitId = bu?.id || null

  // Step 3: Seed products
  console.log(`\n🚀 Seeding ${products.length} products...`)

  let created = 0
  let skipped = 0
  let imagesCreated = 0

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const productSlug = slug(p.name)

    // Check if already exists
    const existing = await db.product.findUnique({ where: { slug: productSlug } })
    if (existing) {
      skipped++
      console.log(`   ⏭️  [${i + 1}/${products.length}] SKIP (exists): ${p.name}`)
      continue
    }

    // Resolve brand ID
    const brandId = brandMap.get(p.brand) || null

    // Resolve category IDs
    const categoryConnects: { categoryId: string; sortOrder: number }[] = []
    for (const catSlug of p.categories) {
      const catId = catMap.get(catSlug)
      if (catId) {
        categoryConnects.push({ categoryId: catId, sortOrder: categoryConnects.length })
      }
    }

    if (categoryConnects.length === 0) {
      console.log(`   ⚠️  [${i + 1}/${products.length}] NO CATEGORIES FOUND: ${p.name} (${p.categories.join(', ')})`)
      skipped++
      continue
    }

    const compareAtPrice = compareAt(p.basePrice, p.compareAtPct)

    // Create product with images
    const product = await db.product.create({
      data: {
        name: p.name,
        slug: productSlug,
        shortDescription: p.shortDescription,
        description: `The ${p.name} is available at Bigman Computers, Nairobi. ${p.shortDescription} Visit our store or order online for the best price in Kenya.`,
        brandId,
        businessUnitId,
        condition: p.condition,
        conditionGrade: p.conditionGrade || null,
        basePrice: p.basePrice,
        compareAtPrice,
        currency: 'KES',
        warrantyMonths: p.warrantyMonths,
        specifications: JSON.stringify(p.specifications),
        stockCount: p.stockCount,
        trackInventory: true,
        lowStockThreshold: 5,
        status: 'ACTIVE',
        publishedAt: new Date(),
        isFeatured: p.isFeatured,
        isDeal: p.isDeal,
        isGaming: p.isGaming,
        dealLabel: p.dealLabel || null,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        sku: p.sku,
        categories: {
          create: categoryConnects,
        },
        productImages: {
          create: Array.from({ length: p.imageCount }, (_, imgIdx) => {
            const categorySlug = p.categories[0] || 'product'
            return {
              url: `/placeholder/product-${categorySlug.replace(/[^a-z0-9]/g, '-')}-${i + 1}-${imgIdx + 1}.jpg`,
              altText: imgIdx === 0
                ? `${p.name} - Main product image`
                : `${p.name} - ${['Side view', 'Detail view', 'Lifestyle shot', 'Angle view'][imgIdx - 1] || `Image ${imgIdx + 1}`}`,
              sortOrder: imgIdx,
              isPrimary: imgIdx === 0,
              imageType: imgIdx === 0 ? 'MAIN' : 'GALLERY',
              status: 'APPROVED',
              width: 800,
              height: 600,
              source: 'BIGMAN_OWN',
              mimeType: 'image/jpeg',
            }
          }),
        },
      },
    })

    created++
    imagesCreated += p.imageCount
    console.log(
      `   ✅ [${i + 1}/${products.length}] ${p.name}` +
      ` | KSh ${p.basePrice.toLocaleString()}` +
      ` | ${p.condition}${p.conditionGrade ? ` (${p.conditionGrade})` : ''}` +
      ` | ${p.imageCount} images` +
      (p.isFeatured ? ' ⭐' : '') +
      (p.isDeal ? ' 🏷️' : '') +
      (p.isGaming ? ' 🎮' : '')
    )
  }

  // Summary
  const totalProducts = await db.product.count()
  const activeProducts = await db.product.count({ where: { status: 'ACTIVE' } })
  const totalImages = await db.productImage.count()
  const featuredCount = await db.product.count({ where: { isFeatured: true, status: 'ACTIVE' } })
  const dealCount = await db.product.count({ where: { isDeal: true, status: 'ACTIVE' } })
  const gamingCount = await db.product.count({ where: { isGaming: true, status: 'ACTIVE' } })
  const refurbishedCount = await db.product.count({ where: { condition: 'REFURBISHED', status: 'ACTIVE' } })

  console.log('\n' + '═'.repeat(60))
  console.log('📊 SEED SUMMARY')
  console.log('═'.repeat(60))
  console.log(`   Products created:  ${created}`)
  console.log(`   Products skipped:  ${skipped}`)
  console.log(`   Images created:    ${imagesCreated}`)
  console.log('─'.repeat(60))
  console.log(`   Total products:   ${totalProducts}`)
  console.log(`   Active products:  ${activeProducts}`)
  console.log(`   Total images:     ${totalImages}`)
  console.log('─'.repeat(60))
  console.log(`   ⭐ Featured:       ${featuredCount}`)
  console.log(`   🏷️  Deals:          ${dealCount}`)
  console.log(`   🎮 Gaming:         ${gamingCount}`)
  console.log(`   ♻️  Refurbished:    ${refurbishedCount}`)
  console.log('═'.repeat(60))
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => db.$disconnect())
