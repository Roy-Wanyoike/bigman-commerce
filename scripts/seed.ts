import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  // ============================================================
  // 1. BUSINESS UNITS
  // ============================================================
  const units: Record<string, string> = {}
  for (const [name, type] of [
    ['Bigman Computers', 'COMPUTERS'],
    ['Bigman Gaming', 'GAMING'],
    ['Bigman Business', 'BUSINESS'],
    ['Bigman Services', 'SERVICES'],
  ] as const) {
    const u = await db.businessUnit.create({ data: { name, type, slug: name.toLowerCase().replace(/ /g, '-') } })
    units[name] = u.id
  }

  // ============================================================
  // 2. BRANDS
  // ============================================================
  const brandData = [
    'HP', 'Dell', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Microsoft', 'Samsung',
    'Canon', 'Epson', 'Brother', 'Logitech', 'TP-Link', 'Kingston', 'Crucial', 'Seagate',
    'Western Digital', 'NVIDIA', 'AMD', 'Intel', 'Razer', 'HyperX', 'Corsair', 'Cooler Master',
    'AOC', 'LG', 'Belkin', 'Anker'
  ]
  const brands: Record<string, string> = {}
  for (const name of brandData) {
    const b = await db.brand.create({
      data: { name, slug: name.toLowerCase().replace(/ /g, '-'), description: `${name} products at Bigman Computers` }
    })
    brands[name] = b.id
  }

  // ============================================================
  // 3. FULL CATEGORY TREE (22 top-level categories)
  // ============================================================
  const catIds: Record<string, string> = {}

  interface CatDef {
    name: string; slug: string; desc?: string; icon?: string; children?: CatDef[]; navCols?: number; isFeatured?: boolean
  }

  const categories: CatDef[] = [
    {
      name: 'Laptops', slug: 'laptops', icon: 'Laptop', navCols: 4,
      children: [
        { name: 'HP', slug: 'hp' }, { name: 'Dell', slug: 'dell' }, { name: 'Lenovo', slug: 'lenovo' },
        { name: 'Apple', slug: 'apple' }, { name: 'ASUS', slug: 'asus' }, { name: 'Acer', slug: 'acer' },
        { name: 'MSI', slug: 'msi' }, { name: 'Microsoft', slug: 'microsoft' }, { name: 'Samsung', slug: 'samsung' },
        { name: 'New', slug: 'new' }, { name: 'Refurbished', slug: 'refurbished' }, { name: 'Student', slug: 'student' },
        { name: 'Business', slug: 'business' }, { name: 'Programming', slug: 'programming' },
        { name: 'Design', slug: 'design' }, { name: 'Gaming', slug: 'gaming' },
      ]
    },
    {
      name: 'Desktops', slug: 'desktops', icon: 'Monitor', navCols: 3,
      children: [
        { name: 'Office Desktops', slug: 'office' }, { name: 'Home Desktops', slug: 'home' },
        { name: 'All-in-One', slug: 'all-in-one' }, { name: 'Mini PCs', slug: 'mini-pcs' },
        { name: 'Tower PCs', slug: 'tower' }, { name: 'Custom PCs', slug: 'custom' },
        { name: 'Refurbished Desktops', slug: 'refurbished' }, { name: 'Business Desktops', slug: 'business' },
      ]
    },
    {
      name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', navCols: 4,
      children: [
        { name: 'Gaming Laptops', slug: 'laptops' }, { name: 'Gaming PCs', slug: 'pcs' },
        { name: 'Gaming Monitors', slug: 'monitors' }, { name: 'Gaming GPUs', slug: 'gpus' },
        { name: 'Gaming Keyboards', slug: 'keyboards' }, { name: 'Gaming Mice', slug: 'mice' },
        { name: 'Gaming Headsets', slug: 'headsets' }, { name: 'Gaming Controllers', slug: 'controllers' },
        { name: 'Gaming Chairs', slug: 'chairs' }, { name: 'Gaming Desks', slug: 'desks' },
        { name: 'Gaming Accessories', slug: 'accessories' }, { name: 'Gaming Bundles', slug: 'bundles' },
      ]
    },
    {
      name: 'Mac & Apple', slug: 'mac-apple', icon: 'Apple', navCols: 3,
      children: [
        { name: 'MacBook Air', slug: 'macbook-air' }, { name: 'MacBook Pro', slug: 'macbook-pro' },
        { name: 'Mac Mini', slug: 'mac-mini' }, { name: 'iMac', slug: 'imac' },
        { name: 'Apple Accessories', slug: 'accessories' }, { name: 'Refurbished MacBooks', slug: 'refurbished' },
      ]
    },
    {
      name: 'Workstations', slug: 'workstations', icon: 'Server', navCols: 3,
      children: [
        { name: 'HP ZBook', slug: 'hp-zbook' }, { name: 'Dell Precision', slug: 'dell-precision' },
        { name: 'Lenovo ThinkPad P', slug: 'lenovo-thinkpad-p' }, { name: 'Desktop Workstations', slug: 'desktop' },
        { name: 'Mobile Workstations', slug: 'mobile' }, { name: 'Refurbished Workstations', slug: 'refurbished' },
      ]
    },
    {
      name: 'Monitors', slug: 'monitors', icon: 'Monitor', navCols: 3,
      children: [
        { name: 'Office Monitors', slug: 'office' }, { name: 'Gaming Monitors', slug: 'gaming' },
        { name: 'Professional Monitors', slug: 'professional' }, { name: '4K Monitors', slug: '4k' },
        { name: 'Ultrawide', slug: 'ultrawide' }, { name: 'Portable Monitors', slug: 'portable' },
      ]
    },
    {
      name: 'Printers', slug: 'printers', icon: 'Printer', navCols: 3,
      children: [
        { name: 'HP', slug: 'hp' }, { name: 'Canon', slug: 'canon' }, { name: 'Epson', slug: 'epson' },
        { name: 'Brother', slug: 'brother' }, { name: 'Inkjet', slug: 'inkjet' },
        { name: 'Laser', slug: 'laser' }, { name: 'All-in-One', slug: 'all-in-one' },
        { name: 'Printer Ink', slug: 'ink' }, { name: 'Toner', slug: 'toner' },
      ]
    },
    {
      name: 'Accessories', slug: 'accessories', icon: 'Mouse', navCols: 4,
      children: [
        { name: 'Keyboards', slug: 'keyboards' }, { name: 'Mice', slug: 'mice' },
        { name: 'Laptop Bags', slug: 'bags' }, { name: 'Chargers', slug: 'chargers' },
        { name: 'Cables', slug: 'cables' }, { name: 'USB Hubs', slug: 'usb-hubs' },
        { name: 'Docking Stations', slug: 'docking-stations' }, { name: 'Adapters', slug: 'adapters' },
        { name: 'Headsets', slug: 'headsets' }, { name: 'Speakers', slug: 'speakers' },
        { name: 'Webcams', slug: 'webcams' }, { name: 'Cleaning', slug: 'cleaning' },
      ]
    },
    {
      name: 'Parts', slug: 'parts', icon: 'Wrench', navCols: 3,
      children: [
        { name: 'Laptop Screens', slug: 'screens' }, { name: 'Laptop Keyboards', slug: 'keyboards' },
        { name: 'Laptop Batteries', slug: 'batteries' }, { name: 'Laptop Chargers', slug: 'chargers' },
        { name: 'Laptop Fans', slug: 'fans' }, { name: 'Laptop Speakers', slug: 'speakers' },
        { name: 'Laptop Hinges', slug: 'hinges' }, { name: 'Laptop Cases', slug: 'cases' },
      ]
    },
    {
      name: 'Hardware', slug: 'hardware', icon: 'Cpu', navCols: 3,
      children: [
        { name: 'RAM', slug: 'ram' }, { name: 'SSDs', slug: 'ssds' }, { name: 'HDDs', slug: 'hdds' },
        { name: 'Graphics Cards', slug: 'gpus' }, { name: 'Processors', slug: 'cpus' },
        { name: 'Motherboards', slug: 'motherboards' }, { name: 'Power Supplies', slug: 'psus' },
        { name: 'Computer Cases', slug: 'cases' }, { name: 'Cooling', slug: 'cooling' },
      ]
    },
    {
      name: 'Storage', slug: 'storage', icon: 'HardDrive', navCols: 3,
      children: [
        { name: 'SSD', slug: 'ssd' }, { name: 'HDD', slug: 'hdd' },
        { name: 'External HDD', slug: 'external-hdd' }, { name: 'External SSD', slug: 'external-ssd' },
        { name: 'USB Flash Drives', slug: 'flash-drives' }, { name: 'Memory Cards', slug: 'memory-cards' },
        { name: 'NAS Storage', slug: 'nas' },
      ]
    },
    {
      name: 'RAM & Memory', slug: 'ram-memory', icon: 'MemoryStick', navCols: 3,
      children: [
        { name: 'Laptop RAM', slug: 'laptop' }, { name: 'Desktop RAM', slug: 'desktop' },
        { name: 'DDR3', slug: 'ddr3' }, { name: 'DDR4', slug: 'ddr4' }, { name: 'DDR5', slug: 'ddr5' },
      ]
    },
    {
      name: 'Networking', slug: 'networking', icon: 'Wifi', navCols: 3,
      children: [
        { name: 'Routers', slug: 'routers' }, { name: 'Wi-Fi Adapters', slug: 'wifi-adapters' },
        { name: 'Bluetooth Adapters', slug: 'bluetooth' }, { name: 'Network Switches', slug: 'switches' },
        { name: 'Ethernet Cables', slug: 'ethernet-cables' }, { name: 'Modems', slug: 'modems' },
        { name: 'Access Points', slug: 'access-points' },
      ]
    },
    {
      name: 'Power', slug: 'power', icon: 'Zap', navCols: 3,
      children: [
        { name: 'UPS', slug: 'ups' }, { name: 'Laptop Chargers', slug: 'laptop-chargers' },
        { name: 'Power Adapters', slug: 'adapters' }, { name: 'Surge Protectors', slug: 'surge-protectors' },
        { name: 'Extension Cables', slug: 'extensions' },
      ]
    },
    {
      name: 'Software', slug: 'software', icon: 'Code', navCols: 3,
      children: [
        { name: 'Operating Systems', slug: 'operating-systems' },
        { name: 'Productivity', slug: 'productivity' },
        { name: 'Security', slug: 'security' },
      ]
    },
    {
      name: 'Bags & Protection', slug: 'bags-protection', icon: 'Briefcase', navCols: 3,
      children: [
        { name: 'Laptop Bags', slug: 'laptop-bags' }, { name: 'Laptop Backpacks', slug: 'backpacks' },
        { name: 'Laptop Sleeves', slug: 'sleeves' }, { name: 'Hard Cases', slug: 'hard-cases' },
        { name: 'Screen Protectors', slug: 'screen-protectors' },
      ]
    },
    {
      name: 'Office Technology', slug: 'office-technology', icon: 'Building2', navCols: 3,
      children: [
        { name: 'Projectors', slug: 'projectors' }, { name: 'Scanners', slug: 'scanners' },
        { name: 'Conference Cameras', slug: 'conference-cameras' },
        { name: 'Office Accessories', slug: 'office-accessories' },
      ]
    },
    {
      name: 'Refurbished', slug: 'refurbished', icon: 'RotateCcw', navCols: 3, isFeatured: true,
      children: [
        { name: 'Refurbished Laptops', slug: 'laptops' }, { name: 'Refurbished Desktops', slug: 'desktops' },
        { name: 'Refurbished Workstations', slug: 'workstations' }, { name: 'Refurbished MacBooks', slug: 'macbooks' },
        { name: 'Refurbished Monitors', slug: 'monitors' }, { name: 'Refurbished Accessories', slug: 'accessories' },
      ]
    },
    {
      name: 'Deals', slug: 'deals', icon: 'Percent', navCols: 3, isFeatured: true,
      children: [
        { name: "Today's Deals", slug: 'today' }, { name: 'Clearance', slug: 'clearance' },
        { name: 'Laptop Deals', slug: 'laptops' }, { name: 'Gaming Deals', slug: 'gaming' },
        { name: 'Accessory Deals', slug: 'accessories' }, { name: 'Bundle Deals', slug: 'bundles' },
      ]
    },
    {
      name: 'Services', slug: 'services', icon: 'Settings', navCols: 3,
      children: [
        { name: 'Repairs', slug: 'repairs' }, { name: 'Upgrades', slug: 'upgrades' },
        { name: 'Installation', slug: 'installation' }, { name: 'Data Recovery', slug: 'data-recovery' },
        { name: 'Support', slug: 'support' },
      ]
    },
    {
      name: 'Business', slug: 'business', icon: 'Building', navCols: 3, isFeatured: true,
      children: [
        { name: 'Bulk Orders', slug: 'bulk-orders' }, { name: 'Corporate Laptops', slug: 'corporate-laptops' },
        { name: 'Office Setup', slug: 'office-setup' }, { name: 'Networking Solutions', slug: 'networking' },
        { name: 'Request a Quote', slug: 'request-quote' },
      ]
    },
    {
      name: 'Cables & Adapters', slug: 'cables-adapters', icon: 'Cable', navCols: 2,
      children: [
        { name: 'HDMI Cables', slug: 'hdmi' }, { name: 'DisplayPort Cables', slug: 'displayport' },
        { name: 'USB Cables', slug: 'usb' }, { name: 'Ethernet Cables', slug: 'ethernet' },
        { name: 'Adapters', slug: 'adapters' },
      ]
    },
  ]

  async function insertCategories(cats: CatDef[], parentId: string | null, level: number) {
    for (let i = 0; i < cats.length; i++) {
      const c = cats[i]
      const cat = await db.category.create({
        data: {
          name: c.name, slug: c.slug,
          description: c.desc || `${c.name} at Bigman Computers - Quality technology at competitive prices.`,
          parentId, sortOrder: i, level, isActive: true,
          isFeatured: c.isFeatured || false,
          navIcon: c.icon || null, navColumns: c.navCols || 3,
          showInNav: true,
          seoTitle: `${c.name} in Kenya | Bigman Computers`,
          seoDescription: `Shop ${c.name.toLowerCase()} at Bigman Computers, Nairobi. ${c.desc || `Quality ${c.name.toLowerCase()} at competitive prices.`}`,
        }
      })
      catIds[c.slug] = cat.id
      if (c.children?.length) {
        await insertCategories(c.children, cat.id, level + 1)
      }
    }
  }

  await insertCategories(categories, null, 0)
  console.log(`Created ${Object.keys(catIds).length} categories`)

  // ============================================================
  // 4. SAMPLE PRODUCTS
  // ============================================================
  const products = [
    { name: 'HP EliteBook 840 G8', slug: 'hp-elitebook-840-g8', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 89500, compareAtPrice: 95000, warrantyMonths: 12, specs: { processor: 'Intel Core i5-1135G7', ram: '8GB DDR4', storage: '256GB SSD', display: '14" FHD IPS', os: 'Windows 11 Pro' }, categories: ['laptops', 'hp', 'business'], isFeatured: true, stock: 8 },
    { name: 'HP ProBook 450 G9', slug: 'hp-probook-450-g9', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 72500, warrantyMonths: 12, specs: { processor: 'Intel Core i5-1235U', ram: '8GB DDR4', storage: '512GB SSD', display: '15.6" FHD IPS', os: 'Windows 11 Pro' }, categories: ['laptops', 'hp', 'business'], stock: 12 },
    { name: 'Dell Latitude 5540', slug: 'dell-latitude-5540', brandId: brands['Dell'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 98000, compareAtPrice: 105000, warrantyMonths: 12, specs: { processor: 'Intel Core i7-1355U', ram: '16GB DDR5', storage: '512GB SSD', display: '15.6" FHD IPS', os: 'Windows 11 Pro' }, categories: ['laptops', 'dell', 'business'], isFeatured: true, stock: 5 },
    { name: 'Lenovo ThinkPad E14 Gen 5', slug: 'lenovo-thinkpad-e14-gen5', brandId: brands['Lenovo'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 65000, warrantyMonths: 12, specs: { processor: 'Intel Core i5-1335U', ram: '8GB DDR4', storage: '256GB SSD', display: '14" FHD IPS', os: 'Windows 11 Pro' }, categories: ['laptops', 'lenovo', 'business'], stock: 15 },
    { name: 'Lenovo IdeaPad 3', slug: 'lenovo-ideapad-3', brandId: brands['Lenovo'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 42000, warrantyMonths: 12, specs: { processor: 'AMD Ryzen 5 5500U', ram: '8GB DDR4', storage: '512GB SSD', display: '15.6" FHD', os: 'Windows 11 Home' }, categories: ['laptops', 'lenovo', 'student'], stock: 20 },
    { name: 'HP EliteBook 850 G5 - Refurbished', slug: 'hp-elitebook-850-g5-refurbished', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'REFURBISHED', conditionGrade: 'A', basePrice: 34500, compareAtPrice: 42000, warrantyMonths: 6, specs: { processor: 'Intel Core i5-8350U', ram: '8GB DDR4', storage: '256GB SSD', display: '15.6" FHD IPS', os: 'Windows 11 Pro' }, categories: ['laptops', 'refurbished', 'business', 'hp'], isFeatured: true, stock: 4 },
    { name: 'Dell Latitude E7440 - Refurbished', slug: 'dell-latitude-e7440-refurbished', brandId: brands['Dell'], buId: units['Bigman Computers'], condition: 'REFURBISHED', conditionGrade: 'B', basePrice: 18500, compareAtPrice: 24000, warrantyMonths: 3, specs: { processor: 'Intel Core i5-4300U', ram: '8GB DDR3', storage: '500GB HDD', display: '14" HD', os: 'Windows 10 Pro' }, categories: ['laptops', 'refurbished', 'dell', 'student'], stock: 6 },
    { name: 'HP ProBook 450 G3 - Refurbished', slug: 'hp-probook-450-g3-refurbished', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'REFURBISHED', conditionGrade: 'B_PLUS', basePrice: 22000, compareAtPrice: 28000, warrantyMonths: 3, specs: { processor: 'Intel Core i5-6200U', ram: '8GB DDR4', storage: '256GB SSD', display: '15.6" FHD', os: 'Windows 10 Pro' }, categories: ['laptops', 'refurbished', 'hp'], stock: 7 },
    { name: 'Acer Aspire 3', slug: 'acer-aspire-3', brandId: brands['Acer'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 38500, warrantyMonths: 12, specs: { processor: 'Intel Core i3-N305', ram: '4GB DDR5', storage: '256GB SSD', display: '15.6" FHD', os: 'Windows 11 Home' }, categories: ['laptops', 'acer', 'student'], stock: 25 },
    { name: 'MSI GF63 Thin', slug: 'msi-gf63-thin', brandId: brands['MSI'], buId: units['Bigman Gaming'], condition: 'NEW', basePrice: 89000, compareAtPrice: 95000, warrantyMonths: 12, specs: { processor: 'Intel Core i5-11400H', ram: '8GB DDR4', storage: '512GB SSD', gpu: 'NVIDIA GTX 1650', display: '15.6" FHD 144Hz', os: 'Windows 11 Home' }, categories: ['gaming', 'laptops', 'msi'], isGaming: true, isFeatured: true, stock: 6 },
    { name: 'ASUS TUF Gaming A15', slug: 'asus-tuf-a15', brandId: brands['ASUS'], buId: units['Bigman Gaming'], condition: 'NEW', basePrice: 125000, compareAtPrice: 135000, warrantyMonths: 12, specs: { processor: 'AMD Ryzen 7 7735HS', ram: '16GB DDR5', storage: '512GB SSD', gpu: 'NVIDIA RTX 4050', display: '15.6" FHD 144Hz', os: 'Windows 11 Home' }, categories: ['gaming', 'laptops', 'asus'], isGaming: true, stock: 4 },
    { name: 'Lenovo Legion 5', slug: 'lenovo-legion-5', brandId: brands['Lenovo'], buId: units['Bigman Gaming'], condition: 'NEW', basePrice: 165000, compareAtPrice: 180000, warrantyMonths: 12, specs: { processor: 'Intel Core i7-13700HX', ram: '16GB DDR5', storage: '1TB SSD', gpu: 'NVIDIA RTX 4060', display: '15.6" FHD 165Hz', os: 'Windows 11 Home' }, categories: ['gaming', 'laptops', 'lenovo'], isGaming: true, isFeatured: true, stock: 3 },
    { name: 'MacBook Air M2', slug: 'macbook-air-m2', brandId: brands['Apple'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 145000, compareAtPrice: 155000, warrantyMonths: 12, specs: { processor: 'Apple M2', ram: '8GB Unified', storage: '256GB SSD', display: '13.6" Liquid Retina', os: 'macOS Sonoma' }, categories: ['mac-apple', 'macbook-air', 'laptops', 'apple'], isFeatured: true, stock: 5 },
    { name: 'MacBook Pro M3', slug: 'macbook-pro-m3', brandId: brands['Apple'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 215000, compareAtPrice: 230000, warrantyMonths: 12, specs: { processor: 'Apple M3 Pro', ram: '18GB Unified', storage: '512GB SSD', display: '14" Liquid Retina XDR', os: 'macOS Sonoma' }, categories: ['mac-apple', 'macbook-pro', 'laptops', 'apple'], isFeatured: true, stock: 3 },
    { name: 'HP ZBook 15 G8 - Refurbished', slug: 'hp-zbook-15-g8-refurbished', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'REFURBISHED', conditionGrade: 'A', basePrice: 85000, compareAtPrice: 110000, warrantyMonths: 6, specs: { processor: 'Intel Core i7-11800H', ram: '32GB DDR4', storage: '512GB SSD', gpu: 'NVIDIA T600', display: '15.6" FHD', os: 'Windows 11 Pro' }, categories: ['workstations', 'hp-zbook', 'refurbished'], isFeatured: true, stock: 2 },
    { name: 'Dell Precision 5560 - Refurbished', slug: 'dell-precision-5560-refurbished', brandId: brands['Dell'], buId: units['Bigman Computers'], condition: 'REFURBISHED', conditionGrade: 'A_PLUS', basePrice: 120000, compareAtPrice: 155000, warrantyMonths: 6, specs: { processor: 'Intel Core i9-11950H', ram: '32GB DDR4', storage: '1TB SSD', gpu: 'NVIDIA RTX A2000', display: '15.6" 4K OLED', os: 'Windows 11 Pro' }, categories: ['workstations', 'dell-precision', 'refurbished'], stock: 1 },
    { name: 'HP ProDesk 400 G7 Desktop', slug: 'hp-prodesk-400-g7', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 55000, warrantyMonths: 12, specs: { processor: 'Intel Core i5-10500', ram: '8GB DDR4', storage: '256GB SSD', os: 'Windows 11 Pro' }, categories: ['desktops', 'office', 'hp'], stock: 10 },
    { name: 'HP 24fh FHD Monitor', slug: 'hp-24fh-monitor', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 18500, warrantyMonths: 12, specs: { size: '24"', resolution: '1920x1080', panel: 'IPS', refreshRate: '75Hz' }, categories: ['monitors', 'office', 'hp'], stock: 18 },
    { name: 'AOC 24G2 Gaming Monitor', slug: 'aoc-24g2-gaming-monitor', brandId: brands['AOC'], buId: units['Bigman Gaming'], condition: 'NEW', basePrice: 32000, compareAtPrice: 36000, warrantyMonths: 12, specs: { size: '24"', resolution: '1920x1080', panel: 'IPS', refreshRate: '144Hz', responseTime: '1ms' }, categories: ['monitors', 'gaming', 'gaming'], isGaming: true, isDeal: true, stock: 8 },
    { name: 'LG 27UK850 4K Monitor', slug: 'lg-27uk850-4k', brandId: brands['LG'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 58000, warrantyMonths: 12, specs: { size: '27"', resolution: '3840x2160', panel: 'IPS', refreshRate: '60Hz', hdr: 'HDR10' }, categories: ['monitors', 'professional', '4k'], isFeatured: true, stock: 4 },
    { name: 'HP LaserJet Pro M404dn', slug: 'hp-laserjet-m404dn', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 45000, warrantyMonths: 12, specs: { type: 'Mono Laser', speed: '38ppm', resolution: '1200x1200 dpi', connectivity: 'USB, Ethernet, Wi-Fi' }, categories: ['printers', 'hp', 'laser'], stock: 6 },
    { name: 'Epson EcoTank L3250', slug: 'epson-ecotank-l3250', brandId: brands['Epson'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 28000, compareAtPrice: 32000, warrantyMonths: 12, specs: { type: 'Color Inkjet', speed: '10ppm (color)', resolution: '5760x1440 dpi', connectivity: 'Wi-Fi, USB' }, categories: ['printers', 'epson', 'inkjet', 'all-in-one'], isDeal: true, stock: 10 },
    { name: 'Logitech MK270 Wireless Combo', slug: 'logitech-mk270', brandId: brands['Logitech'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 4500, warrantyMonths: 12, specs: { type: 'Wireless Combo', connectivity: '2.4GHz', battery: 'Keyboard: 24mo, Mouse: 12mo' }, categories: ['accessories', 'keyboards', 'mice'], stock: 30 },
    { name: 'Razer DeathAdder Essential', slug: 'razer-deathadder-essential', brandId: brands['Razer'], buId: units['Bigman Gaming'], condition: 'NEW', basePrice: 6500, compareAtPrice: 7500, warrantyMonths: 24, specs: { sensor: '6400 DPI Optical', buttons: '5', lighting: 'RGB', weight: '96g' }, categories: ['gaming', 'mice', 'accessories'], isGaming: true, isDeal: true, stock: 15 },
    { name: 'HyperX Cloud Stinger', slug: 'hyperx-cloud-stinger', brandId: brands['HyperX'], buId: units['Bigman Gaming'], condition: 'NEW', basePrice: 8500, compareAtPrice: 10000, warrantyMonths: 24, specs: { driver: '50mm', type: 'Over-ear', mic: 'Swivel-to-mute', weight: '275g' }, categories: ['gaming', 'headsets', 'accessories'], isGaming: true, isDeal: true, stock: 12 },
    { name: 'Kingston 8GB DDR5-4800 SO-DIMM', slug: 'kingston-8gb-ddr5-sodimm', brandId: brands['Kingston'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 4799, compareAtPrice: 5500, warrantyMonths: 36, specs: { capacity: '8GB', type: 'DDR5', speed: '4800MHz', formFactor: 'SO-DIMM', voltage: '1.1V' }, categories: ['ram-memory', 'laptop', 'ddr5', 'hardware', 'ram'], isDeal: true, stock: 40 },
    { name: 'Crucial 16GB DDR4-3200 DIMM', slug: 'crucial-16gb-ddr4-dimm', brandId: brands['Crucial'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 7200, warrantyMonths: 36, specs: { capacity: '16GB', type: 'DDR4', speed: '3200MHz', formFactor: 'DIMM', voltage: '1.2V' }, categories: ['ram-memory', 'desktop', 'ddr4', 'hardware', 'ram'], stock: 20 },
    { name: 'Samsung 500GB 870 EVO SSD', slug: 'samsung-870-evo-500gb', brandId: brands['Samsung'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 6800, warrantyMonths: 60, specs: { capacity: '500GB', interface: 'SATA III', formFactor: '2.5"', readSpeed: '560MB/s', writeSpeed: '530MB/s' }, categories: ['storage', 'ssd', 'hardware', 'ssds'], stock: 25 },
    { name: 'Seagate 1TB BarraCuda HDD', slug: 'seagate-1tb-barracuda', brandId: brands['Seagate'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 5500, warrantyMonths: 24, specs: { capacity: '1TB', interface: 'SATA III', formFactor: '3.5"', speed: '7200RPM', cache: '256MB' }, categories: ['storage', 'hdd', 'hardware', 'hdds'], stock: 30 },
    { name: 'HP EliteBook 850 G5 Keyboard', slug: 'hp-elitebook-850-g5-keyboard', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 1699, warrantyMonths: 6, specs: { compatibility: 'HP EliteBook 850 G5', type: 'US Layout', backlit: 'No', color: 'Silver' }, categories: ['parts', 'keyboards'], compatibleModels: 'hp-elitebook-850-g5,hp-elitebook-840-g5', stock: 8 },
    { name: 'Dell E7440 Replacement Screen', slug: 'dell-e7440-screen', brandId: brands['Dell'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 5999, compareAtPrice: 7000, warrantyMonths: 6, specs: { compatibility: 'Dell Latitude E7440', size: '14"', resolution: '1366x768 HD', panel: 'LED', finish: 'Matte' }, categories: ['parts', 'screens'], compatibleModels: 'dell-latitude-e7440-refurbished', isDeal: true, stock: 5 },
    { name: 'HP ProBook 450 G3 Battery', slug: 'hp-probook-450-g3-battery', brandId: brands['HP'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 3500, warrantyMonths: 12, specs: { compatibility: 'HP ProBook 450 G3', capacity: '2200mAh', voltage: '14.4V', type: 'Li-ion' }, categories: ['parts', 'batteries'], compatibleModels: 'hp-probook-450-g3-refurbished', stock: 10 },
    { name: 'TP-Link TL-R470T Router', slug: 'tp-link-tl-r470t', brandId: brands['TP-Link'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 12000, warrantyMonths: 24, specs: { ports: '5x Gigabit', wan: '2x WAN', throughput: 'Gigabit', type: 'Wired Router' }, categories: ['networking', 'routers'], stock: 8 },
    { name: 'Targus 15.6" Laptop Bag', slug: 'targus-classic-15-6', brandId: brands['Targus'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 3500, warrantyMonths: 12, specs: { fit: 'Up to 15.6" laptops', material: 'Polyester', pockets: 'Multiple', color: 'Black' }, categories: ['bags-protection', 'laptop-bags', 'accessories', 'bags'], stock: 20 },
    { name: 'Windows 11 Pro License', slug: 'windows-11-pro-license', brandId: brands['Microsoft'], buId: units['Bigman Computers'], condition: 'NEW', basePrice: 15000, warrantyMonths: 0, specs: { licenseType: 'OEM', devices: '1 PC', duration: 'Perpetual', activation: 'Digital', delivery: 'Email' }, categories: ['software', 'operating-systems'], productType: 'DIGITAL', stock: 999 },
  ]

  for (const p of products) {
    const catSlugs = [...new Set((p as any).categories as string[])]
    const catConnects = catSlugs.map(slug => ({ categoryId: catIds[slug] })).filter(c => c.categoryId)
    await db.product.create({
      data: {
        name: p.name, slug: p.slug,
        shortDescription: `${(p as any).specs?.processor || (p as any).specs?.type || (p as any).specs?.capacity || ''} ${(p as any).specs?.ram || (p as any).specs?.speed || (p as any).specs?.size || ''}`.trim(),
        description: `The ${p.name} is available at Bigman Computers, Nairobi. Contact us for the latest pricing and availability.`,
        brandId: p.brandId, businessUnitId: p.buId,
        condition: p.condition, conditionGrade: (p as any).conditionGrade || null,
        basePrice: p.basePrice, compareAtPrice: p.compareAtPrice || null,
        salePrice: p.salePrice || null, warrantyMonths: p.warrantyMonths,
        specifications: JSON.stringify((p as any).specs || {}),
        productType: (p as any).productType || 'PHYSICAL',
        stockCount: p.stock, trackInventory: true,
        isFeatured: (p as any).isFeatured || false, isDeal: (p as any).isDeal || false,
        isGaming: (p as any).isGaming || false, status: 'ACTIVE', publishedAt: new Date(),
        compatibleModels: (p as any).compatibleModels || null,
        categories: { create: catConnects.map((c, i) => ({ ...c, sortOrder: i })) },
      }
    })
  }
  console.log(`Created ${products.length} products`)

  // ============================================================
  // 5. MARKET PRICE OBSERVATIONS
  // ============================================================
  const observations = [
    { product: 'Core i5 Laptop', category: 'laptops', price: 24000, source: 'WhatsApp Listing', condition: 'REFURBISHED', date: '2024-06-15', notes: 'Historical Bigman Core i5 messaging' },
    { product: 'Core i7 Laptop', category: 'laptops', price: 30000, source: 'Social Media', condition: 'REFURBISHED', date: '2024-06-15', notes: 'Historical Bigman Core i7 messaging' },
    { product: 'Entry Laptop', category: 'laptops', price: 17000, source: 'Jiji', condition: 'REFURBISHED', date: '2024-07-01', notes: 'Lowest observed laptop pricing' },
    { product: '8GB DDR5 RAM', category: 'ram', price: 4799, source: 'Social Media', condition: 'NEW', date: '2024-08-01', notes: 'Bigman-associated listing' },
    { product: '500GB HDD', category: 'storage', price: 1997, source: 'Jiji', condition: 'NEW', date: '2024-07-15', notes: 'Market reference' },
    { product: 'Laptop Screen 14"', category: 'parts', price: 5497, source: 'WhatsApp Listing', condition: 'NEW', date: '2024-08-10', notes: 'Bigman-associated listing' },
    { product: 'Laptop Screen 15.6"', category: 'parts', price: 5999, source: 'Social Media', condition: 'NEW', date: '2024-08-10', notes: 'Bigman-associated listing' },
    { product: 'Laptop Keyboard', category: 'parts', price: 1599, source: 'WhatsApp Listing', condition: 'NEW', date: '2024-08-05', notes: 'Bigman-associated listing' },
    { product: 'Keyboard Stickers', category: 'accessories', price: 249, source: 'Social Media', condition: 'NEW', date: '2024-08-01', notes: 'Bigman-associated listing' },
    { product: 'Windows License', category: 'software', price: 5000, source: 'WhatsApp Listing', condition: 'NEW', date: '2024-07-20', notes: 'Approximate range from Bigman listings' },
  ]
  for (const o of observations) {
    await db.marketPriceObservation.create({
      data: { source: o.source, productName: o.product, productCategory: o.category, observedPrice: o.price, currency: 'KES', observedDate: new Date(o.date), condition: o.condition, notes: o.notes }
    })
  }
  console.log(`Created ${observations.length} market price observations`)

  // ============================================================
  // 6. SEARCH SYNONYMS
  // ============================================================
  const synonymGroups = [
    ['laptop', 'computer', 'notebook'],
    ['hard disk', 'HDD', 'drive', 'hard drive'],
    ['memory', 'RAM'],
    ['charger', 'power adapter'],
    ['screen', 'display', 'LCD', 'panel'],
    ['mouse', 'wireless mouse'],
    ['keyboard', 'key board'],
    ['gaming PC', 'gaming computer'],
    ['SSD', 'solid state'],
    ['monitor', 'screen display'],
  ]
  let synCount = 0
  for (const group of synonymGroups) {
    for (const term of group) {
      for (const syn of group) {
        if (term !== syn) {
          try { await db.searchSynonym.create({ data: { term: term.toLowerCase(), synonym: syn.toLowerCase() } }); synCount++ }
          catch { /* unique */ }
        }
      }
    }
  }
  console.log(`Created ${synCount} search synonyms`)

  // ============================================================
  // 7. SERVICES
  // ============================================================
  const services = [
    { name: 'Laptop Repair', slug: 'laptop-repair', type: 'REPAIR', price: 1500, duration: '1-3 hours' },
    { name: 'Desktop Repair', slug: 'desktop-repair', type: 'REPAIR', price: 1500, duration: '1-3 hours' },
    { name: 'Screen Replacement', slug: 'screen-replacement', type: 'REPAIR', price: 3500, duration: '2-4 hours' },
    { name: 'Keyboard Replacement', slug: 'keyboard-replacement', type: 'REPAIR', price: 2500, duration: '1-2 hours' },
    { name: 'Battery Replacement', slug: 'battery-replacement', type: 'REPAIR', price: 2000, duration: '30 min - 1 hour' },
    { name: 'OS Installation', slug: 'os-installation', type: 'INSTALLATION', price: 1000, duration: '1-2 hours' },
    { name: 'Software Installation', slug: 'software-installation', type: 'INSTALLATION', price: 500, duration: '30 min' },
    { name: 'RAM Upgrade', slug: 'ram-upgrade', type: 'UPGRADE', price: 500, duration: '30 min' },
    { name: 'SSD Upgrade', slug: 'ssd-upgrade', type: 'UPGRADE', price: 1000, duration: '1 hour' },
    { name: 'Virus/Malware Cleanup', slug: 'virus-cleanup', type: 'REPAIR', price: 1500, duration: '2-4 hours' },
    { name: 'Data Recovery', slug: 'data-recovery', type: 'RECOVERY', price: 5000, duration: '24-72 hours' },
    { name: 'Computer Setup', slug: 'computer-setup', type: 'INSTALLATION', price: 1000, duration: '1 hour' },
    { name: 'Printer Setup', slug: 'printer-setup', type: 'INSTALLATION', price: 500, duration: '30 min' },
    { name: 'Network Setup', slug: 'network-setup', type: 'INSTALLATION', price: 2000, duration: '1-3 hours' },
    { name: 'Hardware Diagnostics', slug: 'hardware-diagnostics', type: 'SUPPORT', price: 500, duration: '1 hour' },
  ]
  for (const s of services) {
    await db.serviceProduct.create({
      data: { name: s.name, slug: s.slug, serviceType: s.type, basePrice: s.price, duration: s.duration, isActive: true, shortDescription: `Professional ${s.name.toLowerCase()} service at Bigman Computers, Nairobi.`, description: `Our experienced technicians provide reliable ${s.name.toLowerCase()} services. Walk in or contact us to book.` }
    })
  }
  console.log(`Created ${services.length} services`)

  // ============================================================
  // 8. PROMOTIONS
  // ============================================================
  await db.promotion.create({ data: { name: 'Back to School Deals', slug: 'back-to-school-2024', promoType: 'DEAL', description: 'Special pricing on laptops and accessories for students.', startDate: new Date('2024-08-01'), endDate: new Date('2024-09-30'), isActive: true } })
  await db.promotion.create({ data: { name: 'Gaming Week', slug: 'gaming-week-2024', promoType: 'DEAL', description: 'Discounts on gaming laptops, peripherals, and accessories.', startDate: new Date('2024-09-01'), endDate: new Date('2024-09-07'), isActive: true } })
  console.log('Created promotions')

  console.log('\n=== SEED COMPLETE ===')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
