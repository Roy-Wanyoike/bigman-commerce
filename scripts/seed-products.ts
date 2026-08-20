import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Image pools per category - real product image URLs
const LAPTOP_IMAGES = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
]

const GAMING_IMAGES = [
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
]

const MONITOR_IMAGES = [
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
  'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800',
  'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800',
]

const DESKTOP_IMAGES = [
  'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800',
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
]

const ACCESSORY_IMAGES = [
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800',
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
]

const STORAGE_IMAGES = [
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
]

const NETWORK_IMAGES = [
  'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800',
  'https://images.unsplash.com/photo-1563239406-0b370a331432?w=800',
]

const PART_IMAGES = [
  'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800',
  'https://images.unsplash.com/photo-1593152167544-085d3b9c4938?w=800',
]

// Helper: pick N images from pool with different types
function pickImages(pool: string[], count: number) {
  const types = ['FRONT', 'BACK', 'SIDE', 'OPEN', 'DETAIL']
  return pool.slice(0, count).map((url, i) => ({
    url,
    altText: '',
    imageType: types[i] || 'FRONT',
    isPrimary: i === 0,
    status: 'APPROVED' as const,
    sortOrder: i,
    source: 'STOCK_PHOTO' as const,
    licenseStatus: 'LICENSED' as const,
  }))
}

// Helper: generate nanoid-like ID
function id() {
  return 'cmt' + Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 8)
}

interface NewProduct {
  name: string
  slug: string
  brandSlug: string
  categorySlugs: string[]
  basePrice: number
  salePrice?: number
  compareAtPrice?: number
  condition: 'NEW' | 'REFURBISHED'
  conditionGrade?: string
  isGaming?: boolean
  isDeal?: boolean
  isFeatured?: boolean
  shortDescription: string
  description?: string
  specifications: Record<string, string>
  warrantyMonths: number
  stockCount: number
  imagePool: string[]
  sku?: string
}

const products: NewProduct[] = [
  // ═══════════════ LAPTOPS ═══════════════
  {
    name: 'Dell XPS 15 9530',
    slug: 'dell-xps-15-9530',
    brandSlug: 'dell',
    categorySlugs: ['laptops', 'dell'],
    basePrice: 195000,
    compareAtPrice: 220000,
    isDeal: true,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: '15.6" OLED 3.5K, Intel Core i7-13700H, 16GB RAM, 512GB SSD, NVIDIA RTX 4060',
    specifications: { Processor: 'Intel Core i7-13700H', RAM: '16GB DDR5', Storage: '512GB NVMe SSD', Display: '15.6" OLED 3.5K 3456x2160', GPU: 'NVIDIA RTX 4060 8GB', OS: 'Windows 11 Pro', Battery: '86Wh', Weight: '1.86 kg' },
    warrantyMonths: 12, stockCount: 5,
    imagePool: LAPTOP_IMAGES,
    sku: 'DXPS159530',
  },
  {
    name: 'HP Pavilion 15',
    slug: 'hp-pavilion-15',
    brandSlug: 'hp',
    categorySlugs: ['laptops', 'hp', 'student'],
    basePrice: 52000,
    salePrice: 47999,
    compareAtPrice: 58000,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '15.6" FHD, Intel Core i5-1335U, 8GB RAM, 512GB SSD, Intel Iris Xe',
    specifications: { Processor: 'Intel Core i5-1335U', RAM: '8GB DDR4', Storage: '512GB NVMe SSD', Display: '15.6" FHD 1920x1080 IPS', GPU: 'Intel Iris Xe', OS: 'Windows 11 Home', Battery: '43Wh', Weight: '1.75 kg' },
    warrantyMonths: 12, stockCount: 12,
    imagePool: LAPTOP_IMAGES,
    sku: 'HPP15-1335U',
  },
  {
    name: 'Lenovo IdeaPad Flex 5',
    slug: 'lenovo-ideapad-flex-5',
    brandSlug: 'lenovo',
    categorySlugs: ['laptops', 'lenovo', 'design'],
    basePrice: 68000,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: '14" 2K IPS Touch, AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 360° hinge',
    specifications: { Processor: 'AMD Ryzen 7 7730U', RAM: '16GB LPDDR5', Storage: '512GB NVMe SSD', Display: '14" 2K 2160x1350 IPS Touch', GPU: 'AMD Radeon 680M', OS: 'Windows 11 Home', Battery: '56Wh', Weight: '1.5 kg' },
    warrantyMonths: 12, stockCount: 8,
    imagePool: LAPTOP_IMAGES,
    sku: 'LIF5-R7',
  },
  {
    name: 'Acer Swift Go 14',
    slug: 'acer-swift-go-14',
    brandSlug: 'acer',
    categorySlugs: ['laptops', 'acer'],
    basePrice: 55000,
    condition: 'NEW',
    shortDescription: '14" 2.8K OLED, Intel Core i5-13500H, 8GB RAM, 512GB SSD',
    specifications: { Processor: 'Intel Core i5-13500H', RAM: '8GB LPDDR5', Storage: '512GB NVMe SSD', Display: '14" 2.8K OLED 2880x1800', GPU: 'Intel Iris Xe', OS: 'Windows 11 Home', Battery: '65Wh', Weight: '1.25 kg' },
    warrantyMonths: 12, stockCount: 6,
    imagePool: LAPTOP_IMAGES,
    sku: 'ASG14-13500H',
  },
  {
    name: 'ASUS VivoBook 15',
    slug: 'asus-vivobook-15',
    brandSlug: 'asus',
    categorySlugs: ['laptops', 'asus'],
    basePrice: 45000,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '15.6" FHD, Intel Core i3-1215U, 8GB RAM, 256GB SSD',
    specifications: { Processor: 'Intel Core i3-1215U', RAM: '8GB DDR4', Storage: '256GB NVMe SSD', Display: '15.6" FHD 1920x1080', GPU: 'Intel UHD Graphics', OS: 'Windows 11 Home', Battery: '42Wh', Weight: '1.7 kg' },
    warrantyMonths: 12, stockCount: 15,
    imagePool: LAPTOP_IMAGES,
    sku: 'AVB15-I3',
  },
  {
    name: 'HP ProBook 440 G9',
    slug: 'hp-probook-440-g9',
    brandSlug: 'hp',
    categorySlugs: ['laptops', 'hp', 'business'],
    basePrice: 78000,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: '14" FHD, Intel Core i5-1245U, 16GB RAM, 512GB SSD, Fingerprint',
    specifications: { Processor: 'Intel Core i5-1245U', RAM: '16GB DDR4', Storage: '512GB NVMe SSD', Display: '14" FHD 1920x1080 IPS', GPU: 'Intel Iris Xe', OS: 'Windows 11 Pro', Battery: '45Wh', Weight: '1.4 kg' },
    warrantyMonths: 24, stockCount: 10,
    imagePool: LAPTOP_IMAGES,
    sku: 'HPP440G9',
  },
  {
    name: 'Dell Latitude 5430 - Refurbished',
    slug: 'dell-latitude-5430-refurbished',
    brandSlug: 'dell',
    categorySlugs: ['laptops', 'dell', 'refurbished'],
    basePrice: 38000,
    condition: 'REFURBISHED',
    conditionGrade: 'A',
    isFeatured: true,
    shortDescription: '14" FHD, Intel Core i5-1145G7, 16GB RAM, 256GB SSD - Bigman Inspected Grade A',
    specifications: { Processor: 'Intel Core i5-1145G7', RAM: '16GB DDR4', Storage: '256GB NVMe SSD', Display: '14" FHD 1920x1080', GPU: 'Intel Iris Xe', OS: 'Windows 11 Pro', Battery: '50Wh (Good condition)', Weight: '1.39 kg' },
    warrantyMonths: 6, stockCount: 4,
    imagePool: LAPTOP_IMAGES,
    sku: 'DL5430R-A',
  },
  {
    name: 'Lenovo ThinkPad T480 - Refurbished',
    slug: 'lenovo-thinkpad-t480-refurbished',
    brandSlug: 'lenovo',
    categorySlugs: ['laptops', 'lenovo', 'refurbished', 'programming'],
    basePrice: 28000,
    condition: 'REFURBISHED',
    conditionGrade: 'B_PLUS',
    shortDescription: '14" FHD, Intel Core i5-8250U, 8GB RAM, 256GB SSD - Bigman Inspected Grade B+',
    specifications: { Processor: 'Intel Core i5-8250U', RAM: '8GB DDR4', Storage: '256GB NVMe SSD', Display: '14" FHD 1920x1080', GPU: 'Intel UHD 620', OS: 'Windows 11 Pro', Battery: '57Wh (Good)', Weight: '1.6 kg' },
    warrantyMonths: 3, stockCount: 7,
    imagePool: LAPTOP_IMAGES,
    sku: 'LT480R-BP',
  },
  // ═══════════════ GAMING ═══════════════
  {
    name: 'ASUS ROG Strix G16',
    slug: 'asus-rog-strix-g16',
    brandSlug: 'asus',
    categorySlugs: ['gaming', 'laptops', 'asus'],
    basePrice: 185000,
    isGaming: true,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: '16" 165Hz FHD+, Intel Core i7-13650HX, 16GB RAM, 1TB SSD, RTX 4070',
    specifications: { Processor: 'Intel Core i7-13650HX', RAM: '16GB DDR5', Storage: '1TB NVMe SSD', Display: '16" 165Hz FHD+ 1920x1200', GPU: 'NVIDIA RTX 4070 8GB', OS: 'Windows 11 Home', Battery: '90Wh', Weight: '2.5 kg' },
    warrantyMonths: 24, stockCount: 3,
    imagePool: GAMING_IMAGES,
    sku: 'ROGG16-4070',
  },
  {
    name: 'Acer Nitro 5',
    slug: 'acer-nitro-5',
    brandSlug: 'acer',
    categorySlugs: ['gaming', 'laptops', 'acer'],
    basePrice: 95000,
    salePrice: 89999,
    isGaming: true,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '15.6" 144Hz FHD, Intel Core i5-12500H, 8GB RAM, 512GB SSD, RTX 3050',
    specifications: { Processor: 'Intel Core i5-12500H', RAM: '8GB DDR4', Storage: '512GB NVMe SSD', Display: '15.6" 144Hz FHD IPS', GPU: 'NVIDIA RTX 3050 4GB', OS: 'Windows 11 Home', Battery: '57.5Wh', Weight: '2.2 kg' },
    warrantyMonths: 12, stockCount: 6,
    imagePool: GAMING_IMAGES,
    sku: 'AN5-3050',
  },
  {
    name: 'Razer BlackWidow V4',
    slug: 'razer-blackwidow-v4',
    brandSlug: 'razer',
    categorySlugs: ['gaming', 'accessories'],
    basePrice: 18000,
    isGaming: true,
    isDeal: true,
    condition: 'NEW',
    shortDescription: 'Mechanical gaming keyboard with Razer Green switches, RGB Chroma, magnetic wrist rest',
    specifications: { 'Switch Type': 'Razer Green Mechanical', Layout: 'Full Size', Backlighting: 'Razer Chroma RGB', Connectivity: 'USB-C', 'Wrist Rest': 'Magnetic Leatherette', 'Key Rollover': 'N-Key Rollover' },
    warrantyMonths: 24, stockCount: 8,
    imagePool: GAMING_IMAGES,
    sku: 'RBWV4-Green',
  },
  {
    name: 'Logitech G Pro X Superlight 2',
    slug: 'logitech-g-pro-x-superlight-2',
    brandSlug: 'logitech',
    categorySlugs: ['gaming', 'accessories'],
    basePrice: 12000,
    isGaming: true,
    condition: 'NEW',
    shortDescription: 'Ultra-lightweight wireless gaming mouse, 60g, HERO 2 sensor, 44000 DPI, LIGHTSPEED',
    specifications: { Sensor: 'HERO 2 (44000 DPI)', Weight: '60g', Connectivity: 'LIGHTSPEED Wireless + Bluetooth', Battery: '95 hours', 'Switches': 'LIGHTFORCE Hybrid', 'Polling Rate': '4000Hz' },
    warrantyMonths: 24, stockCount: 10,
    imagePool: GAMING_IMAGES,
    sku: 'LGPXSL2',
  },
  {
    name: 'Samsung Odyssey G5 27"',
    slug: 'samsung-odyssey-g5-27',
    brandSlug: 'samsung',
    categorySlugs: ['gaming', 'monitors', 'samsung'],
    basePrice: 42000,
    isGaming: true,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '27" QHD 165Hz, 1ms response, AMD FreeSync Premium, HDR10',
    specifications: { 'Screen Size': '27"', Resolution: '2560x1440 QHD', 'Refresh Rate': '165Hz', 'Response Time': '1ms (GtG)', Panel: 'VA', HDR: 'HDR10', 'Sync Technology': 'AMD FreeSync Premium' },
    warrantyMonths: 24, stockCount: 5,
    imagePool: MONITOR_IMAGES,
    sku: 'SOG5-27QHD',
  },
  // ═══════════════ DESKTOPS ═══════════════
  {
    name: 'HP EliteDesk 800 G6 SFF',
    slug: 'hp-elitedesk-800-g6',
    brandSlug: 'hp',
    categorySlugs: ['desktops', 'hp', 'office'],
    basePrice: 48000,
    condition: 'NEW',
    shortDescription: 'Intel Core i5-10500, 8GB RAM, 256GB SSD, Windows 11 Pro, Small Form Factor',
    specifications: { Processor: 'Intel Core i5-10500', RAM: '8GB DDR4', Storage: '256GB NVMe SSD', GPU: 'Intel UHD 630', OS: 'Windows 11 Pro', Form: 'Small Form Factor', 'Expansion': '2x RAM slots, 1x PCIe x16' },
    warrantyMonths: 36, stockCount: 4,
    imagePool: DESKTOP_IMAGES,
    sku: 'HPED800G6',
  },
  {
    name: 'Dell OptiPlex 7090 Ultra',
    slug: 'dell-optiplex-7090-ultra',
    brandSlug: 'dell',
    categorySlugs: ['desktops', 'dell', 'business'],
    basePrice: 72000,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: 'Intel Core i7-11700, 16GB RAM, 512GB SSD, Ultra Compact Form Factor',
    specifications: { Processor: 'Intel Core i7-11700', RAM: '16GB DDR4', Storage: '512GB NVMe SSD', GPU: 'Intel UHD 750', OS: 'Windows 11 Pro', Form: 'Ultra Compact', Ports: 'USB-C, DisplayPort, HDMI' },
    warrantyMonths: 36, stockCount: 3,
    imagePool: DESKTOP_IMAGES,
    sku: 'DO7090U',
  },
  // ═══════════════ MONITORS ═══════════════
  {
    name: 'Dell S2421HN 24"',
    slug: 'dell-s2421hn-24',
    brandSlug: 'dell',
    categorySlugs: ['monitors', 'dell'],
    basePrice: 22000,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '23.8" FHD IPS, 75Hz, AMD FreeSync, slim bezels, HDMI + VGA',
    specifications: { 'Screen Size': '23.8"', Resolution: '1920x1080 FHD', 'Refresh Rate': '75Hz', Panel: 'IPS', 'Response Time': '5ms', Ports: 'HDMI 1.4, VGA', 'Color Support': '16.7M colors, 99% sRGB' },
    warrantyMonths: 36, stockCount: 12,
    imagePool: MONITOR_IMAGES,
    sku: 'DS2421HN',
  },
  {
    name: 'BenQ GW2480 24"',
    slug: 'benq-gw2480-24',
    brandSlug: 'dell',
    categorySlugs: ['monitors'],
    basePrice: 19500,
    condition: 'NEW',
    shortDescription: '23.8" FHD IPS, 60Hz, Low Blue Light, Brightness Intelligence, HDMI + DP',
    specifications: { 'Screen Size': '23.8"', Resolution: '1920x1080 FHD', 'Refresh Rate': '60Hz', Panel: 'IPS', 'Response Time': '5ms', Ports: 'HDMI, DisplayPort', Features: 'Low Blue Light, Brightness Intelligence' },
    warrantyMonths: 36, stockCount: 8,
    imagePool: MONITOR_IMAGES,
    sku: 'BGW2480',
  },
  // ═══════════════ STORAGE ═══════════════
  {
    name: 'Samsung 980 Pro 1TB NVMe',
    slug: 'samsung-980-pro-1tb',
    brandSlug: 'samsung',
    categorySlugs: ['storage', 'hardware', 'samsung'],
    basePrice: 14500,
    isFeatured: true,
    isDeal: true,
    condition: 'NEW',
    shortDescription: 'PCIe 4.0 x4 NVMe M.2 SSD, 7000/5000 MB/s read/write, with heatsink option',
    specifications: { Capacity: '1TB', Interface: 'PCIe 4.0 x4 NVMe', 'Read Speed': '7,000 MB/s', 'Write Speed': '5,000 MB/s', Form: 'M.2 2280', 'NAND Type': 'V-NAND TLC', 'Endurance': '600 TBW' },
    warrantyMonths: 60, stockCount: 15,
    imagePool: STORAGE_IMAGES,
    sku: 'S980P-1T',
  },
  {
    name: 'WD Blue SN570 500GB',
    slug: 'wd-blue-sn570-500gb',
    brandSlug: 'western-digital',
    categorySlugs: ['storage', 'hardware'],
    basePrice: 5500,
    isDeal: true,
    condition: 'NEW',
    shortDescription: 'PCIe 3.0 x4 NVMe M.2 SSD, 3500/3000 MB/s read/write',
    specifications: { Capacity: '500GB', Interface: 'PCIe 3.0 x4 NVMe', 'Read Speed': '3,500 MB/s', 'Write Speed': '3,000 MB/s', Form: 'M.2 2280', 'NAND Type': '3D NAND TLC', 'Endurance': '300 TBW' },
    warrantyMonths: 60, stockCount: 20,
    imagePool: STORAGE_IMAGES,
    sku: 'WDSN570-500',
  },
  {
    name: 'Seagate Barracuda 2TB HDD',
    slug: 'seagate-barracuda-2tb',
    brandSlug: 'seagate',
    categorySlugs: ['storage', 'hardware'],
    basePrice: 8500,
    condition: 'NEW',
    shortDescription: '3.5" SATA HDD, 7200RPM, 256MB Cache, 2TB capacity',
    specifications: { Capacity: '2TB', Interface: 'SATA III 6Gb/s', 'Rotational Speed': '7200 RPM', Cache: '256MB', Form: '3.5"', 'NAND Type': 'CMR', 'MTBF': '2M hours' },
    warrantyMonths: 24, stockCount: 10,
    imagePool: STORAGE_IMAGES,
    sku: 'SB-2TB',
  },
  {
    name: 'Kingston A400 480GB SSD',
    slug: 'kingston-a400-480gb',
    brandSlug: 'kingston',
    categorySlugs: ['storage', 'hardware'],
    basePrice: 4200,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '2.5" SATA III SSD, 500/450 MB/s read/write, ideal for laptop upgrade',
    specifications: { Capacity: '480GB', Interface: 'SATA III 6Gb/s', 'Read Speed': '500 MB/s', 'Write Speed': '450 MB/s', Form: '2.5" 7mm', 'NAND Type': '3D NAND TLC', Features: 'Shock resistant' },
    warrantyMonths: 36, stockCount: 25,
    imagePool: STORAGE_IMAGES,
    sku: 'KA400-480',
  },
  // ═══════════════ RAM ═══════════════
  {
    name: 'Corsair Vengeance 32GB DDR5-5600',
    slug: 'corsair-vengeance-32gb-ddr5',
    brandSlug: 'corsair',
    categorySlugs: ['ram-memory', 'hardware', 'ddr5', 'gaming'],
    basePrice: 16500,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: '2x16GB DDR5-5600 CL36 desktop memory kit, low profile, XMP 3.0',
    specifications: { Capacity: '32GB (2x16GB)', Type: 'DDR5', Speed: '5600MHz', Latency: 'CL36-36-36-76', Voltage: '1.35V', Profile: 'Low Profile (44mm)', Features: 'XMP 3.0, AMD EXPO' },
    warrantyMonths: 60, stockCount: 8,
    imagePool: PART_IMAGES,
    sku: 'CV32-5600',
  },
  {
    name: 'Kingston Fury 16GB DDR4-3200 SO-DIMM',
    slug: 'kingston-fury-16gb-ddr4-sodimm',
    brandSlug: 'kingston',
    categorySlugs: ['ram-memory', 'hardware', 'ddr4'],
    basePrice: 7500,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '16GB DDR4-3200 CL20 SO-DIMM laptop memory, plug-n-play',
    specifications: { Capacity: '16GB', Type: 'DDR4 SO-DIMM', Speed: '3200MHz', Latency: 'CL20-22-22-42', Voltage: '1.2V', Compatibility: 'Intel & AMD laptops', Features: 'Plug N Play, Auto-overclock' },
    warrantyMonths: 60, stockCount: 12,
    imagePool: PART_IMAGES,
    sku: 'KF16-3200S',
  },
  // ═══════════════ NETWORKING ═══════════════
  {
    name: 'TP-Link Archer AX73',
    slug: 'tp-link-archer-ax73',
    brandSlug: 'tp-link',
    categorySlugs: ['networking', 'routers'],
    basePrice: 15000,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: 'WiFi 6 Dual-Band Gigabit Router, 5400Mbps, 6 antennas, MU-MIMO',
    specifications: { Standard: 'WiFi 6 (802.11ax)', Speed: '5400Mbps', Bands: 'Dual-Band (2.4GHz + 5GHz)', Antennas: '6x External', Ports: '4x Gigabit LAN, 1x Gigabit WAN', Features: 'MU-MIMO, OFDMA, WPA3' },
    warrantyMonths: 36, stockCount: 7,
    imagePool: NETWORK_IMAGES,
    sku: 'TAX73',
  },
  {
    name: 'D-Link DGS-105 5-Port Switch',
    slug: 'dlink-dgs-105',
    brandSlug: 'd-link',
    categorySlugs: ['networking', 'switches'],
    basePrice: 4500,
    condition: 'NEW',
    shortDescription: '5-Port Gigabit Unmanaged Desktop Switch, plug-and-play',
    specifications: { Ports: '5x Gigabit Ethernet', Speed: '10/100/1000Mbps', Standard: 'IEEE 802.3ab', Features: 'Plug and Play, Auto-MDI/MDIX', 'Power Consumption': '3.5W', Form: 'Desktop Metal' },
    warrantyMonths: 24, stockCount: 15,
    imagePool: NETWORK_IMAGES,
    sku: 'DDGS105',
  },
  // ═══════════════ ACCESSORIES ═══════════════
  {
    name: 'Logitech MX Master 3S',
    slug: 'logitech-mx-master-3s',
    brandSlug: 'logitech',
    categorySlugs: ['accessories'],
    basePrice: 14500,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: 'Premium wireless mouse, 8000 DPI, USB-C, quiet clicks, multi-device',
    specifications: { Sensor: '8000 DPI', Connectivity: 'Bluetooth + USB-C Logi Bolt', Battery: '70 days', 'Scroll Wheel': 'MagSpeed Electromagnetic', 'Click Sound': '90% quieter', Weight: '141g' },
    warrantyMonths: 24, stockCount: 6,
    imagePool: ACCESSORY_IMAGES,
    sku: 'LMXM3S',
  },
  {
    name: 'Anker 65W USB-C Charger',
    slug: 'anker-65w-usbc-charger',
    brandSlug: 'anker',
    categorySlugs: ['accessories', 'power', 'adapters'],
    basePrice: 5500,
    isDeal: true,
    condition: 'NEW',
    shortDescription: 'GaN II 65W USB-C wall charger, 3 ports (2x USB-C + 1x USB-A), foldable plug',
    specifications: { 'Total Output': '65W', Ports: '2x USB-C (up to 65W), 1x USB-A (22.5W)', Technology: 'GaN II', 'Input': '100-240V AC', Features: 'Foldable plug, PPS, Samsung 45W compatible' },
    warrantyMonths: 18, stockCount: 20,
    imagePool: ACCESSORY_IMAGES,
    sku: 'A65W-GAN',
  },
  {
    name: 'Targus Drifter II Backpack',
    slug: 'targus-drifter-ii-backpack',
    brandSlug: 'targus',
    categorySlugs: ['accessories', 'backpacks'],
    basePrice: 5500,
    condition: 'NEW',
    shortDescription: '16" laptop backpack, water-resistant, ergonomic, multiple compartments',
    specifications: { 'Fits Laptops': 'Up to 16"', Material: 'Polyester, Water-Resistant', Compartments: 'Padded laptop, tablet, organizer', Straps: 'Ergonomic padded shoulder', Weight: '0.9 kg', Color: 'Black' },
    warrantyMonths: 24, stockCount: 10,
    imagePool: ACCESSORY_IMAGES,
    sku: 'TDII-16',
  },
  {
    name: 'HP USB-C Docking Station G5',
    slug: 'hp-usbc-dock-g5',
    brandSlug: 'hp',
    categorySlugs: ['accessories', 'docking-stations'],
    basePrice: 22000,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: 'USB-C dock with dual 4K display, 100W power delivery, ethernet, audio',
    specifications: { 'Video Out': '2x DisplayPort, 1x HDMI (Dual 4K@60Hz)', 'Power Delivery': '100W', 'USB Ports': '3x USB-A 3.0, 2x USB-C', Network: 'Gigabit Ethernet', Audio: '3.5mm combo jack', 'Power Input': '150W AC adapter' },
    warrantyMonths: 36, stockCount: 4,
    imagePool: ACCESSORY_IMAGES,
    sku: 'HDOCK-G5',
  },
  {
    name: 'Belkin HDMI 2.1 Cable 2m',
    slug: 'belkin-hdmi-2-1-2m',
    brandSlug: 'belkin',
    categorySlugs: ['accessories', 'cables-adapters', 'hdmi'],
    basePrice: 2500,
    condition: 'NEW',
    shortDescription: 'Ultra High Speed HDMI 2.1 cable, 48Gbps, 8K@60Hz, 4K@120Hz, 2m',
    specifications: { Version: 'HDMI 2.1', 'Bandwidth': '48Gbps', Resolution: 'Up to 8K@60Hz / 4K@120Hz', Length: '2m', 'Color Depth': '10/12-bit', Features: 'eARC, VRR, ALLM', Shielding: 'Triple-layer' },
    warrantyMonths: 24, stockCount: 30,
    imagePool: ACCESSORY_IMAGES,
    sku: 'BHDMI21-2',
  },
  // ═══════════════ PARTS ═══════════════
  {
    name: 'Intel Core i5-12400F',
    slug: 'intel-core-i5-12400f',
    brandSlug: 'intel',
    categorySlugs: ['hardware', 'cpus'],
    basePrice: 18500,
    isDeal: true,
    condition: 'NEW',
    shortDescription: '6-core 12-thread desktop processor, 4.4GHz boost, LGA1700, no iGPU',
    specifications: { Cores: '6C / 12T', 'Base Clock': '2.5 GHz', 'Boost Clock': '4.4 GHz', Socket: 'LGA1700', TDP: '65W', Cache: '18MB L3', iGPU: 'None (F-series)' },
    warrantyMonths: 36, stockCount: 5,
    imagePool: PART_IMAGES,
    sku: 'I5-12400F',
  },
  {
    name: 'DeepCool AK400 Digital',
    slug: 'deepcool-ak400-digital',
    brandSlug: 'deepcool',
    categorySlugs: ['hardware', 'cooling'],
    basePrice: 6500,
    condition: 'NEW',
    shortDescription: 'Tower CPU cooler, 4 heat pipes, 120mm fan with digital display, LGA1700/AM5',
    specifications: { 'Heat Pipes': '4x 6mm', Fan: '120mm PWM (500-2000 RPM)', 'Noise Level': '≤28 dB(A)', TDP: '220W', Sockets: 'LGA1700, AM5, AM4, LGA1200', Display: 'Digital temperature/Fan speed' },
    warrantyMonths: 36, stockCount: 8,
    imagePool: PART_IMAGES,
    sku: 'DAK400-DIG',
  },
  // ═══════════════ POWER ═══════════════
  {
    name: 'CyberPower UPS 650VA',
    slug: 'cyberpower-ups-650va',
    brandSlug: 'hp',
    categorySlugs: ['power', 'ups'],
    basePrice: 9500,
    condition: 'NEW',
    shortDescription: '650VA/390W standby UPS, 6 outlets, AVR, USB monitoring',
    specifications: { Capacity: '650VA / 390W', Outlets: '6 (4 battery backup + 2 surge)', Runtime: '5-10 min (typical PC)', Features: 'AVR, USB monitoring', Battery: 'Maintenance-free lead-acid', Warranty: '2 years' },
    warrantyMonths: 24, stockCount: 6,
    imagePool: ACCESSORY_IMAGES,
    sku: 'CPU650VA',
  },
  // ═══════════════ SOFTWARE ═══════════════
  {
    name: 'Microsoft Office 2021 Home & Business',
    slug: 'ms-office-2021-hb',
    brandSlug: 'microsoft',
    categorySlugs: ['software', 'productivity'],
    basePrice: 28000,
    isFeatured: true,
    condition: 'NEW',
    shortDescription: 'Word, Excel, PowerPoint, Outlook - One-time purchase, 1 PC/Mac license',
    specifications: { Applications: 'Word, Excel, PowerPoint, Outlook', License: 'One-time purchase', Devices: '1 PC or Mac', 'Cloud Storage': '1TB OneDrive (1 year included)', Updates: 'Security updates only', Version: '2021' },
    warrantyMonths: 12, stockCount: 15,
    imagePool: ACCESSORY_IMAGES,
    sku: 'MSO21-HB',
  },
  // ═══════════════ PRINTERS ═══════════════
  {
    name: 'Brother HL-L2350DW',
    slug: 'brother-hl-l2350dw',
    brandSlug: 'brother',
    categorySlugs: ['printers', 'laser'],
    basePrice: 18500,
    isDeal: true,
    condition: 'NEW',
    shortDescription: 'Monochrome laser printer, 30ppm, WiFi, duplex printing, compact',
    specifications: { Type: 'Monochrome Laser', Speed: '30 pages/min', Resolution: '2400x600dpi', Connectivity: 'WiFi, USB, WiFi Direct', Duplex: 'Auto (2-sided)', 'Paper Tray': '250 sheets', 'Toner Yield': '~1,200 pages' },
    warrantyMonths: 24, stockCount: 5,
    imagePool: ACCESSORY_IMAGES,
    sku: 'BHL2350DW',
  },
  // ═══════════════ REFURBISHED ═══════════════
  {
    name: 'Dell Latitude 7490 - Refurbished',
    slug: 'dell-latitude-7490-refurbished',
    brandSlug: 'dell',
    categorySlugs: ['refurbished', 'laptops', 'dell'],
    basePrice: 32000,
    condition: 'REFURBISHED',
    conditionGrade: 'A_PLUS',
    isFeatured: true,
    shortDescription: '14" FHD, Intel Core i7-8650U, 16GB RAM, 256GB SSD - Bigman Inspected Grade A+',
    specifications: { Processor: 'Intel Core i7-8650U', RAM: '16GB DDR4', Storage: '256GB NVMe SSD', Display: '14" FHD 1920x1080 IPS', GPU: 'Intel UHD 620', OS: 'Windows 11 Pro', Battery: '60Wh (Excellent)', Weight: '1.42 kg' },
    warrantyMonths: 6, stockCount: 3,
    imagePool: LAPTOP_IMAGES,
    sku: 'DL7490R-AP',
  },
  {
    name: 'HP EliteBook 840 G6 - Refurbished',
    slug: 'hp-elitebook-840-g6-refurbished',
    brandSlug: 'hp',
    categorySlugs: ['refurbished', 'laptops', 'hp'],
    basePrice: 30000,
    condition: 'REFURBISHED',
    conditionGrade: 'A',
    shortDescription: '14" FHD, Intel Core i5-8265U, 8GB RAM, 256GB SSD - Bigman Inspected Grade A',
    specifications: { Processor: 'Intel Core i5-8265U', RAM: '8GB DDR4', Storage: '256GB NVMe SSD', Display: '14" FHD 1920x1080', GPU: 'Intel UHD 620', OS: 'Windows 11 Pro', Battery: '50Wh (Good)', Weight: '1.36 kg' },
    warrantyMonths: 6, stockCount: 5,
    imagePool: LAPTOP_IMAGES,
    sku: 'HE840G6R-A',
  },
]

async function main() {
  console.log('🌱 Seeding new products with images...')

  // Get all brands and categories by slug
  const brands = await db.brand.findMany({ where: { isActive: true } })
  const categories = await db.category.findMany({ where: { isActive: true } })

  const brandMap = new Map(brands.map(b => [b.slug, b]))
  const catMap = new Map(categories.map(c => [c.slug, c]))

  let created = 0
  let imagesCreated = 0

  for (const p of products) {
    const brand = brandMap.get(p.brandSlug)
    if (!brand) {
      console.warn(`  ⚠️  Brand not found: ${p.brandSlug}, skipping ${p.name}`)
      continue
    }

    const productCats = p.categorySlugs
      .map(s => catMap.get(s))
      .filter(Boolean)

    if (productCats.length === 0) {
      console.warn(`  ⚠️  No categories found for ${p.name}, skipping`)
      continue
    }

    // Check if product slug already exists
    const existing = await db.product.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`  ⏭️  Already exists: ${p.name}`)
      continue
    }

    const images = pickImages(p.imagePool, Math.min(p.imagePool.length, 4))

    const product = await db.product.create({
      data: {
        id: id(),
        name: p.name,
        slug: p.slug,
        sku: p.sku || null,
        brandId: brand.id,
        condition: p.condition,
        conditionGrade: p.conditionGrade || null,
        status: 'ACTIVE',
        basePrice: p.basePrice,
        salePrice: p.salePrice || null,
        compareAtPrice: p.compareAtPrice || null,
        shortDescription: p.shortDescription,
        description: p.description || null,
        specifications: JSON.stringify(p.specifications),
        warrantyMonths: p.warrantyMonths,
        stockCount: p.stockCount,
        trackInventory: true,
        isFeatured: p.isFeatured || false,
        isGaming: p.isGaming || false,
        isDeal: p.isDeal || false,
        sortOrder: 100 + created,
        productImages: {
          create: images.map(img => ({
            id: id(),
            url: img.url,
            altText: img.altText || `${p.name} ${img.imageType.toLowerCase()}`,
            imageType: img.imageType,
            isPrimary: img.isPrimary,
            status: img.status,
            sortOrder: img.sortOrder,
            source: img.source,
            licenseStatus: img.licenseStatus,
          })),
        },
        categories: {
          create: productCats.map(c => ({
            categoryId: c.id,
          })),
        },
      },
    })

    created++
    imagesCreated += images.length
    console.log(`  ✅ ${p.name} (${images.length} images)`)
  }

  // Also publish the DRAFT products that were created earlier
  const drafts = await db.product.findMany({ where: { status: 'DRAFT' } })
  let published = 0
  for (const draft of drafts) {
    // Add images for draft products too
    const existingImages = await db.productImage.count({ where: { productId: draft.id } })
    if (existingImages === 0) {
      const imgPool = draft.name.toLowerCase().includes('ssd') ? STORAGE_IMAGES
        : draft.name.toLowerCase().includes('ram') ? PART_IMAGES
        : draft.name.toLowerCase().includes('battery') ? PART_IMAGES
        : draft.name.toLowerCase().includes('charger') || draft.name.toLowerCase().includes('dvd') || draft.name.toLowerCase().includes('enclosure') ? ACCESSORY_IMAGES
        : draft.name.toLowerCase().includes('wifi') || draft.name.toLowerCase().includes('mifi') ? NETWORK_IMAGES
        : LAPTOP_IMAGES
      const images = pickImages(imgPool, 3)
      for (const img of images) {
        await db.productImage.create({
          data: {
            id: id(),
            productId: draft.id,
            url: img.url,
            altText: `${draft.name} ${img.imageType.toLowerCase()}`,
            imageType: img.imageType,
            isPrimary: img.isPrimary,
            status: img.status,
            sortOrder: img.sortOrder,
            source: img.source,
            licenseStatus: img.licenseStatus,
          },
        })
      }
      imagesCreated += images.length
    }

    await db.product.update({
      where: { id: draft.id },
      data: { status: 'ACTIVE', salePrice: Math.round(draft.basePrice * 0.92) },
    })
    published++
  }

  console.log(`\n🎉 Done! Created ${created} new products, published ${published} drafts, added ${imagesCreated} total images.`)
  console.log(`📊 Total ACTIVE products in DB: ${await db.product.count({ where: { status: 'ACTIVE' } })}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
