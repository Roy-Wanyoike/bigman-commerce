import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  // ============================================================
  // ADD MISSING BRANDS
  // ============================================================
  const missingBrands = ['Lexar', 'Toshiba', 'Airtel', 'Targus', 'Adata', 'Gigabyte', 'Hikvision', 'D-Link', 'Ubiquiti', 'DeepCool', 'Be Quiet', 'StarTech', 'Kensington', 'Lexar (Memory)']
  for (const name of missingBrands) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    try {
      await db.brand.create({ data: { name, slug, description: `${name} products at Bigman Computers` } })
      console.log(`  + Brand: ${name}`)
    } catch { console.log(`  = Brand exists: ${name}`) }
  }

  // ============================================================
  // NEW MARKET PRICE OBSERVATIONS (from Jiji Kenya listings)
  // ============================================================
  const newObservations = [
    // Storage
    { product: 'Lexar NM620 256GB M.2 NVMe SSD', category: 'storage', price: 3499, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-hardware/lexar-nm620-m-2-2280-nvme-ssd-256gb', notes: 'Priscom Computers listing on Jiji — Rahimtulla Trust Building area' },
    { product: 'Lexar NM620 2TB M.2 NVMe SSD', category: 'storage', price: 16299, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-hardware/', notes: 'Priscom Computers listing on Jiji — Rahimtulla Trust Building area' },
    // Chargers
    { product: 'Lenovo 65W USB-C Laptop Charger', category: 'parts', price: 1998, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/', notes: 'Priscom Computers listing on Jiji' },
    // Batteries
    { product: 'Toshiba PA3457U-1BRS / PA3465U-1BRS / PABAS067 Battery', category: 'parts', price: 2197, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/', notes: 'Priscom Computers listing on Jiji' },
    { product: 'Dell Latitude E7440/E7420/E7450 Battery', category: 'parts', price: 2989, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/dell-latitude-14-7000-e7440', notes: 'Priscom Computers listing on Jiji' },
    // Hardware
    { product: 'External USB 3.0 CD/DVD Drive', category: 'hardware', price: 1797, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/', notes: 'Priscom Computers listing on Jiji' },
    // Storage Accessories
    { product: 'M.2 USB-C SSD Enclosure', category: 'storage', price: 1997, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/', notes: 'Priscom Computers listing on Jiji' },
    // Networking
    { product: 'Airtel 4G MiFi Pocket WiFi', category: 'networking', price: 3499, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/', notes: 'Priscom Computers listing on Jiji' },
    // Services
    { product: 'Laptop Keyboard Repair/Replacement', category: 'services', price: 999, source: 'Jiji Kenya', condition: 'SERVICE', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/', notes: 'Priscom Computers listing on Jiji' },
    // Screens
    { product: 'HP EliteBook Folio 9480M Screen Replacement', category: 'parts', price: 5997, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-15', url: 'https://jiji.co.ke/nairobi-central/computer-accessories/laptop-screen-replacement-for-hp-elitebook-folio-9480m', notes: 'Priscom Computers listing on Jiji — screen replacement part' },
    // Additional research observations based on mentioned product types
    { product: 'Wireless/Rechargeable Mouse', category: 'accessories', price: 1200, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference for wireless mouse pricing' },
    { product: 'Laptop Speaker Replacement', category: 'parts', price: 1500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference for laptop speaker' },
    { product: 'DisplayPort to HDMI Adapter', category: 'cables-adapters', price: 800, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'HDMI Cable 2m', category: 'cables-adapters', price: 500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Wi-Fi USB Dongle Adapter', category: 'networking', price: 1200, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Bluetooth USB Adapter', category: 'networking', price: 800, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'USB Gamepad/Controller', category: 'accessories', price: 1500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Foam Screen/Keyboard Cleaner', category: 'accessories', price: 350, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Laptop Bag 15.6 inch', category: 'bags-protection', price: 1500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'HDMI Splitter', category: 'cables-adapters', price: 2500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Crimping Tool for Ethernet', category: 'networking', price: 800, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Printer USB Cable', category: 'cables-adapters', price: 300, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'VGA to HDMI Converter', category: 'cables-adapters', price: 1200, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'Hard Disk 1TB External', category: 'storage', price: 5500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
    { product: 'RAM 8GB DDR4 Laptop', category: 'ram-memory', price: 3500, source: 'Jiji Kenya', condition: 'NEW', date: '2025-01-10', notes: 'General market reference' },
  ]

  for (const o of newObservations) {
    await db.marketPriceObservation.create({
      data: {
        source: o.source, productName: o.product, productCategory: o.category,
        observedPrice: o.price, currency: 'KES', observedDate: new Date(o.date),
        condition: o.condition, url: o.url || null, notes: o.notes,
      }
    })
  }
  console.log(`Created ${newObservations.length} new market price observations`)

  // ============================================================
  // NEW PRODUCTS BASED ON RESEARCH (status: DRAFT — need admin verification)
  // ============================================================
  const brandMap: Record<string, string> = {}
  const allBrands = await db.brand.findMany({ select: { id: true, name: true } })
  for (const b of allBrands) brandMap[b.name] = b.id

  const buMap: Record<string, string> = {}
  const allUnits = await db.businessUnit.findMany({ select: { id: true, name: true } })
  for (const u of allUnits) buMap[u.name] = u.id

  const catMap: Record<string, string> = {}
  const allCats = await db.category.findMany({ select: { id: true, slug: true, parentId: true } })
  for (const c of allCats) {
    // Create composite keys for disambiguation
    const parent = c.parentId ? allCats.find(p => p.id === c.parentId) : null
    const key = parent ? `${parent.slug}/${c.slug}` : c.slug
    catMap[key] = c.id
    catMap[c.slug] = c.id
  }

  const newProducts = [
    { name: 'Lexar NM620 256GB M.2 NVMe SSD', slug: 'lexar-nm620-256gb', brand: 'Lexar', condition: 'NEW', price: 3499, categories: ['storage/ssd', 'storage', 'hardware/ssds'], specs: { capacity: '256GB', interface: 'PCIe Gen3x4 NVMe', formFactor: 'M.2 2280', readSpeed: '3300 MB/s', writeSpeed: '2100 MB/s', tbw: '300 TBW', controller: 'DM760' }, warranty: 36, stock: 0, sku: 'LEX-NM620-256' },
    { name: 'Lexar NM620 2TB M.2 NVMe SSD', slug: 'lexar-nm620-2tb', brand: 'Lexar', condition: 'NEW', price: 16299, categories: ['storage/ssd', 'storage', 'hardware/ssds'], specs: { capacity: '2TB', interface: 'PCIe Gen3x4 NVMe', formFactor: 'M.2 2280', readSpeed: '3300 MB/s', writeSpeed: '3000 MB/s', tbw: '1200 TBW', controller: 'DM760' }, warranty: 36, stock: 0, sku: 'LEX-NM620-2TB' },
    { name: 'Lenovo 65W USB-C Laptop Charger', slug: 'lenovo-65w-usbc-charger', brand: 'Lenovo', condition: 'NEW', price: 1998, categories: ['parts/chargers', 'power/laptop-chargers', 'accessories/chargers'], specs: { wattage: '65W', voltage: '20V', connector: 'USB-C', compatibility: 'Lenovo ThinkPad, IdeaPad, and other USB-C laptops', type: 'GaN' }, warranty: 12, stock: 0, sku: 'LEN-65W-USBC' },
    { name: 'Toshiba PA3457U-1BRS Battery', slug: 'toshiba-pa3457u-battery', brand: 'Toshiba', condition: 'NEW', price: 2197, categories: ['parts/batteries'], specs: { partNumber: 'PA3457U-1BRS / PA3465U-1BRS / PABAS067', capacity: '4400mAh', voltage: '14.4V', type: 'Li-ion', compatibleModels: 'Toshiba Satellite C55, L55, S55 series' }, warranty: 6, stock: 0, sku: 'TOS-PA3457U' },
    { name: 'Dell Latitude E7440/E7420/E7450 Battery', slug: 'dell-e7440-battery', brand: 'Dell', condition: 'NEW', price: 2989, categories: ['parts/batteries'], specs: { partNumber: '3RNFD, 0WV7P6, 0D3GJ9', capacity: '4400mAh', voltage: '7.4V', type: 'Li-ion', compatibleModels: 'Dell Latitude E7440, E7420, E7450' }, warranty: 6, stock: 0, sku: 'DEL-E7440-BAT' },
    { name: 'External USB 3.0 CD/DVD Drive', slug: 'external-usb3-dvd-drive', brand: null, condition: 'NEW', price: 1797, categories: ['hardware', 'accessories'], specs: { interface: 'USB 3.0', type: 'CD/DVD RW', readSpeed: '8x DVD, 24x CD', writeSpeed: '8x DVD, 24x CD', compatible: 'Windows, macOS, Linux', portable: 'Yes', poweredBy: 'USB (no external power needed)' }, warranty: 6, stock: 0, sku: 'EXT-DVD-USB3' },
    { name: 'M.2 USB-C SSD Enclosure', slug: 'm2-usbc-ssd-enclosure', brand: null, condition: 'NEW', price: 1997, categories: ['storage', 'storage/external-ssd'], specs: { interface: 'USB 3.1 Gen2 Type-C', supportedDrives: 'M.2 NVMe 2280', speed: 'Up to 10Gbps', chipset: 'Realtek RTL9210', material: 'Aluminium', features: 'Tool-free installation, thermal pad' }, warranty: 12, stock: 0, sku: 'ENC-M2-USBC' },
    { name: 'Airtel 4G MiFi Pocket WiFi', slug: 'airtel-4g-mifi', brand: 'Airtel', condition: 'NEW', price: 3499, categories: ['networking/modems'], specs: { type: '4G LTE MiFi', simSupport: 'Micro SIM', wifi: 'Dual-band 802.11ac', battery: '3000mAh', maxUsers: 'Up to 16 devices', lte: 'Cat 4, 150Mbps download' }, warranty: 12, stock: 0, sku: 'AIR-MIFI-4G' },
  ]

  for (const p of newProducts) {
    const brandId = p.brand ? brandMap[p.brand] : null
    const catConnects = p.categories.map(slug => ({ categoryId: catMap[slug] })).filter(c => c.categoryId)
    if (catConnects.length === 0) continue

    await db.product.create({
      data: {
        name: p.name, slug: p.slug,
        shortDescription: Object.entries(p.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | '),
        description: `The ${p.name} is available at Bigman Computers, Nairobi. Visit our store at Rahimtulla Trust Building or contact us for pricing and availability.`,
        brandId, businessUnitId: buMap['Bigman Computers'],
        condition: p.condition, basePrice: p.price,
        warrantyMonths: p.warranty, specifications: JSON.stringify(p.specs),
        stockCount: p.stock, trackInventory: true,
        status: 'DRAFT', // NOT published — requires admin verification
        sku: p.sku,
        categories: { create: catConnects.map((c, i) => ({ ...c, sortOrder: i })) },
      }
    })
    console.log(`  + Product (DRAFT): ${p.name}`)
  }
  console.log(`Created ${newProducts.length} draft products from research data`)

  // ============================================================
  // CATEGORY ATTRIBUTE DEFINITIONS
  // ============================================================
  const attrDefs: { catKey: string; attrs: { name: string; key: string; type: string; unit?: string; options?: string[]; required?: boolean }[] }[] = [
    { catKey: 'laptops', attrs: [
      { name: 'Processor', key: 'processor', type: 'TEXT', required: true },
      { name: 'RAM', key: 'ram', type: 'TEXT', unit: 'GB' },
      { name: 'Storage', key: 'storage', type: 'TEXT' },
      { name: 'GPU', key: 'gpu', type: 'TEXT' },
      { name: 'Display', key: 'display', type: 'TEXT', unit: 'inches' },
      { name: 'Battery Life', key: 'battery', type: 'TEXT' },
      { name: 'Operating System', key: 'os', type: 'SELECT', options: ['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'macOS Sonoma', 'macOS Ventura', 'Chrome OS', 'Linux', 'No OS'] },
      { name: 'Weight', key: 'weight', type: 'TEXT', unit: 'kg' },
    ]},
    { catKey: 'storage/ssd', attrs: [
      { name: 'Capacity', key: 'capacity', type: 'TEXT', required: true },
      { name: 'Interface', key: 'interface', type: 'SELECT', options: ['SATA III', 'PCIe Gen3x4 NVMe', 'PCIe Gen4x4 NVMe', 'PCIe Gen5x4 NVMe', 'USB 3.0', 'USB 3.1', 'USB 3.2'] },
      { name: 'Form Factor', key: 'formFactor', type: 'SELECT', options: ['2.5"', 'M.2 2280', 'M.2 2242', 'M.2 2230', 'AIC'] },
      { name: 'Read Speed', key: 'readSpeed', type: 'TEXT', unit: 'MB/s' },
      { name: 'Write Speed', key: 'writeSpeed', type: 'TEXT', unit: 'MB/s' },
      { name: 'TBW', key: 'tbw', type: 'TEXT', unit: 'TBW' },
    ]},
    { catKey: 'ram-memory', attrs: [
      { name: 'Capacity', key: 'capacity', type: 'TEXT', required: true },
      { name: 'DDR Generation', key: 'type', type: 'SELECT', options: ['DDR3', 'DDR4', 'DDR5'] },
      { name: 'Speed', key: 'speed', type: 'TEXT', unit: 'MHz' },
      { name: 'Form Factor', key: 'formFactor', type: 'SELECT', options: ['DIMM', 'SO-DIMM'] },
      { name: 'ECC', key: 'ecc', type: 'SELECT', options: ['Yes', 'No'] },
      { name: 'Voltage', key: 'voltage', type: 'TEXT', unit: 'V' },
    ]},
    { catKey: 'monitors', attrs: [
      { name: 'Size', key: 'size', type: 'TEXT', unit: 'inches', required: true },
      { name: 'Resolution', key: 'resolution', type: 'TEXT' },
      { name: 'Refresh Rate', key: 'refreshRate', type: 'TEXT', unit: 'Hz' },
      { name: 'Panel Type', key: 'panel', type: 'SELECT', options: ['IPS', 'VA', 'TN', 'OLED', 'Mini-LED'] },
      { name: 'Response Time', key: 'responseTime', type: 'TEXT', unit: 'ms' },
      { name: 'Ports', key: 'ports', type: 'TEXT' },
    ]},
    { catKey: 'parts/batteries', attrs: [
      { name: 'Part Number', key: 'partNumber', type: 'TEXT', required: true },
      { name: 'Capacity', key: 'capacity', type: 'TEXT', unit: 'mAh' },
      { name: 'Voltage', key: 'voltage', type: 'TEXT', unit: 'V' },
      { name: 'Type', key: 'type', type: 'SELECT', options: ['Li-ion', 'Li-polymer'] },
      { name: 'Compatible Models', key: 'compatibleModels', type: 'TEXT' },
    ]},
    { catKey: 'parts/chargers', attrs: [
      { name: 'Wattage', key: 'wattage', type: 'TEXT', unit: 'W', required: true },
      { name: 'Voltage', key: 'voltage', type: 'TEXT', unit: 'V' },
      { name: 'Connector', key: 'connector', type: 'SELECT', options: ['USB-C', 'Barrel (7.4mm)', 'Barrel (5.5mm)', 'DC Jack', 'MagSafe', 'Proprietary'] },
      { name: 'Compatibility', key: 'compatibility', type: 'TEXT' },
    ]},
    { catKey: 'parts/keyboards', attrs: [
      { name: 'Compatibility', key: 'compatibility', type: 'TEXT', required: true },
      { name: 'Layout', key: 'layout', type: 'SELECT', options: ['US', 'UK', 'ISO'] },
      { name: 'Backlit', key: 'backlit', type: 'SELECT', options: ['Yes', 'No'] },
      { name: 'Color', key: 'color', type: 'TEXT' },
    ]},
    { catKey: 'parts/screens', attrs: [
      { name: 'Compatibility', key: 'compatibility', type: 'TEXT', required: true },
      { name: 'Size', key: 'size', type: 'TEXT', unit: 'inches' },
      { name: 'Resolution', key: 'resolution', type: 'TEXT' },
      { name: 'Panel', key: 'panel', type: 'SELECT', options: ['LED', 'IPS LED', 'OLED', 'TN'] },
      { name: 'Finish', key: 'finish', type: 'SELECT', options: ['Matte', 'Glossy'] },
    ]},
  ]

  let attrCount = 0
  for (const group of attrDefs) {
    const catId = catMap[group.catKey]
    if (!catId) continue
    for (const attr of group.attrs) {
      try {
        await db.categoryAttributeDefinition.create({
          data: {
            categoryId: catId, name: attr.name, key: attr.key,
            type: attr.type, unit: attr.unit || null,
            options: attr.options ? JSON.stringify(attr.options) : null,
            isRequired: attr.required || false,
          }
        })
        attrCount++
      } catch { /* unique key constraint */ }
    }
  }
  console.log(`Created ${attrCount} category attribute definitions`)

  // ============================================================
  // EXPAND SEARCH SYNONYMS
  // ============================================================
  const newSynGroups = [
    ['ssd', 'solid state drive', 'solid state', 'nvme'],
    ['charger', 'power adapter', 'ac adapter', 'adaptor'],
    ['battery', 'cell', 'battery pack'],
    ['enclosure', 'case', 'caddy', 'adapter case'],
    ['mifi', 'mobile wifi', 'portable wifi', 'pocket wifi', 'hotspot'],
    ['modem', 'router', 'gateway'],
    ['gamepad', 'controller', 'joystick', 'game controller'],
    ['headset', 'headphones', 'earphones', 'earbuds'],
    ['laptop bag', 'laptop case', 'laptop sleeve', 'laptop backpack'],
    ['hard drive', 'hard disk', 'hdd'],
    ['usb hub', 'usb splitter', 'port replicator'],
    ['docking station', 'dock', 'port replicator'],
    ['displayport', 'dp'],
    ['vga', 'vga cable', 'vga to hdmi'],
    ['keyboard repair', 'keyboard replacement'],
    ['screen replacement', 'lcd replacement', 'display replacement'],
    ['data recovery', 'data rescue', 'file recovery'],
    ['refurbished', 'renewed', 'reconditioned', 'second hand', 'used'],
    ['gaming laptop', 'gaming notebook', 'gaming pc laptop'],
    ['workstation', 'work station', 'mobile workstation'],
  ]
  let synCount = 0
  for (const group of newSynGroups) {
    for (const term of group) {
      for (const syn of group) {
        if (term !== syn) {
          try { await db.searchSynonym.create({ data: { term: term.toLowerCase(), synonym: syn.toLowerCase() } }); synCount++ }
          catch { /* unique */ }
        }
      }
    }
  }
  console.log(`Created ${synCount} additional search synonyms`)

  console.log('\n=== RESEARCH DATA SEED COMPLETE ===')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())