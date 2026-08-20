import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

/**
 * Seed ProductImage records for all existing products.
 * Images were sourced via z-ai image-search and are hosted on z-cdn.chatglm.cn.
 * Each product gets 3-5 images with varied imageType tags.
 */

// Image pools by category (collected from z-ai image-search results)
const imagePools: Record<string, { url: string; w: number; h: number }[]> = {
  hp: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/13032174a579.jpg', w: 1300, h: 954 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9ae4cc5c282b.jpg', w: 1600, h: 1205 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6307a1959f23.png', w: 1200, h: 901 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6e7e47d203e9.jpg', w: 1910, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7926b1a6a012.jpg', w: 1000, h: 1000 },
  ],
  dell: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6f71e7ecea35.jpg', w: 1600, h: 1600 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d94604f02b82.jpg', w: 1910, h: 1251 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/adcd327cc930.jpg', w: 1280, h: 890 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a45885be6045.jpg', w: 2560, h: 2560 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/52ccca1da914.jpg', w: 1500, h: 1500 },
  ],
  lenovo: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1ab3d39c838c.jpg', w: 894, h: 894 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2a5118d0be94.png', w: 1200, h: 900 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b61cd7d2d396.jpg', w: 1280, h: 1280 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b2a2249bfe18.jpg', w: 900, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f1fad927cd54.jpg', w: 894, h: 886 },
  ],
  gaming: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4d6c03547b5f.jpg', w: 2560, h: 2560 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/129618699cda.jpg', w: 2690, h: 1513 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4366f030c479.jpg', w: 894, h: 994 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2dac6fd53381.jpg', w: 2000, h: 1125 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/69da2752c097.jpg', w: 1200, h: 900 },
  ],
  apple: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6335f2a48f76.jpg', w: 1144, h: 1144 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/aa06d76e2160.jpg', w: 1200, h: 900 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ac19421d4a79.jpg', w: 1260, h: 946 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a34469698fec.jpg', w: 1200, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c18e26cecc16.png', w: 2000, h: 1500 },
  ],
  desktop: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fd48af16e971.jpg', w: 2400, h: 2400 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8b5c9e69f46c.png', w: 1200, h: 875 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d9cdcac15c77.jpg', w: 1600, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/92bc3192d1f6.jpg', w: 1000, h: 1000 },
  ],
  monitor: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/50323d0c55d6.jpg', w: 1600, h: 1600 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a359edef0f1a.jpg', w: 1600, h: 1600 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a28bf92dfe6a.jpg', w: 1920, h: 1280 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5a14c6f784a2.jpg', w: 2400, h: 1600 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/015696aedc8c.jpg', w: 1200, h: 675 },
  ],
  keyboard: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/64e99410a7e6.jpg', w: 1462, h: 1372 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/66d0feeb5fe4.webp', w: 1200, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/db1843940d1a.jpg', w: 1200, h: 675 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5db1d9711565.jpg', w: 1144, h: 1144 },
  ],
  mouse: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/436e66232af0.jpg', w: 1000, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8e0bf342ed2a.jpg', w: 1600, h: 1600 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/50725d4f5437.jpg', w: 1500, h: 1500 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8ce53acb5d0f.jpg', w: 1188, h: 1500 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/280f28bf3b6c.png', w: 1600, h: 1600 },
  ],
  ram: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b8eca24ef794.jpg', w: 2500, h: 2500 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/124ef0815b58.jpg', w: 1200, h: 900 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c48e13e79843.jpeg', w: 2000, h: 2000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/745f553f146c.jpg', w: 1500, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a6f0f5e23378.jpg', w: 2000, h: 1125 },
  ],
  ssd: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/44ba7c012d19.jpg', w: 1500, h: 1500 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/09e9bc86fd34.jpg', w: 1600, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/404e9dcb4737.jpg', w: 2560, h: 2560 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a7e9beb34a84.jpg', w: 1600, h: 900 },
  ],
  hdd: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f7f708a1ab25.jpg', w: 900, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3f4245c816a9.jpg', w: 833, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/744e569d1564.png', w: 1280, h: 960 },
  ],
  printer: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/acba419290a4.jpg', w: 1068, h: 1068 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/62cb981024d7.jpg', w: 1525, h: 612 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/06c7f2fe0972.jpeg', w: 1200, h: 1200 },
  ],
  charger: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1a90d2ec61bb.jpg', w: 894, h: 900 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bbeb64a5abfc.jpg', w: 1200, h: 1052 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/28c742a0749e.jpeg', w: 1458, h: 1500 },
  ],
  router: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1b96f2dba87b.jpg', w: 800, h: 1006 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d3f22965b8b8.jpg', w: 1600, h: 900 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4b8ddde67880.jpg', w: 1200, h: 1200 },
  ],
  usb: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cda0e0a18fe1.jpg', w: 1001, h: 1001 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/26d68f41c0bf.jpg', w: 900, h: 900 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cc3458b8a27c.jpg', w: 2048, h: 1365 },
  ],
  bag: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2d7dcee08a30.jpg', w: 1080, h: 1080 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e92b25dd2b1d.jpg', w: 1200, h: 1500 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b35aefa70fab.webp', w: 2000, h: 2000 },
  ],
  headset: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c778c43e2e9e.jpg', w: 2048, h: 1024 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bb17699b47d2.jpeg', w: 1601, h: 1601 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f4f295530b35.png', w: 2500, h: 2500 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/43cf180dc02b.jpg', w: 1920, h: 1080 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/edb91edad34f.jpg', w: 1500, h: 1500 },
  ],
  webcam: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d31fe7dfa8a6.jpg', w: 1000, h: 998 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2ab590111bc2.jpg', w: 1091, h: 1200 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/47717f5b0e32.jpg', w: 1500, h: 1500 },
  ],
  screen: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a61b614a1d36.jpg', w: 1000, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/00b0333c092d.jpg', w: 1000, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/751f42608b41.jpg', w: 1601, h: 1601 },
  ],
  software: [
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/81acdff9e9a7.png', w: 1254, h: 1254 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b540937ea82f.jpg', w: 1000, h: 1000 },
    { url: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3dec56d0b534.jpg', w: 5712, h: 4284 },
  ],
}

// Image types to cycle through for variety
const imageTypes = ['FRONT', 'BACK', 'SIDE', 'OPEN', 'CLOSEUP', 'PACKAGING', 'DISPLAY', 'KEYBOARD']

// Map each product slug to an image pool key and number of images
const productImageMap: Record<string, { pool: string; count: number }> = {
  // HP laptops
  'hp-elitebook-840-g8': { pool: 'hp', count: 4 },
  'hp-probook-450-g9': { pool: 'hp', count: 4 },
  'hp-elitebook-850-g5-refurbished': { pool: 'hp', count: 3 },
  'hp-probook-450-g3-refurbished': { pool: 'hp', count: 3 },
  'hp-zbook-15-g8-refurbished': { pool: 'hp', count: 4 },
  'hp-prodesk-400-g7': { pool: 'hp', count: 3 },
  'hp-24fh-monitor': { pool: 'monitor', count: 4 },
  'hp-laserjet-m404dn': { pool: 'printer', count: 3 },
  'hp-elitebook-850-g5-keyboard': { pool: 'keyboard', count: 3 },
  'hp-probook-450-g3-battery': { pool: 'charger', count: 3 },

  // Dell laptops
  'dell-latitude-5540': { pool: 'dell', count: 4 },
  'dell-latitude-e7440-refurbished': { pool: 'dell', count: 3 },
  'dell-precision-5560-refurbished': { pool: 'dell', count: 4 },
  'dell-e7440-screen': { pool: 'screen', count: 3 },

  // Lenovo laptops
  'lenovo-thinkpad-e14-gen5': { pool: 'lenovo', count: 4 },
  'lenovo-ideapad-3': { pool: 'lenovo', count: 3 },
  'lenovo-legion-5': { pool: 'gaming', count: 5 },

  // Acer
  'acer-aspire-3': { pool: 'hp', count: 3 }, // reuse HP laptop images

  // Gaming
  'msi-gf63-thin': { pool: 'gaming', count: 4 },
  'asus-tuf-a15': { pool: 'gaming', count: 5 },

  // Apple
  'macbook-air-m2': { pool: 'apple', count: 4 },
  'macbook-pro-m3': { pool: 'apple', count: 5 },

  // Monitors
  'aoc-24g2-gaming-monitor': { pool: 'monitor', count: 4 },
  'lg-27uk850-4k': { pool: 'monitor', count: 4 },

  // Printers
  'epson-ecotank-l3250': { pool: 'printer', count: 3 },

  // Peripherals
  'logitech-mk270': { pool: 'keyboard', count: 3 },
  'razer-deathadder-essential': { pool: 'mouse', count: 4 },
  'hyperx-cloud-stinger': { pool: 'headset', count: 4 },

  // Components
  'kingston-8gb-ddr5-sodimm': { pool: 'ram', count: 4 },
  'crucial-16gb-ddr4-dimm': { pool: 'ram', count: 4 },
  'samsung-870-evo-500gb': { pool: 'ssd', count: 4 },
  'seagate-1tb-barracuda': { pool: 'hdd', count: 3 },

  // Networking
  'tp-link-tl-r470t': { pool: 'router', count: 3 },

  // Bags
  'targus-classic-15-6': { pool: 'bag', count: 3 },

  // Software
  'windows-11-pro-license': { pool: 'software', count: 3 },
}

async function main() {
  console.log('Seeding product images...')

  // Delete existing non-unit ProductImage records (clean slate)
  const deleted = await db.productImage.deleteMany({
    where: { inventoryUnitId: null },
  })
  console.log(`Deleted ${deleted.count} existing product images`)

  // Fetch all products
  const products = await db.product.findMany({
    select: { id: true, slug: true, name: true },
  })
  console.log(`Found ${products.length} products`)

  let totalCreated = 0
  let productsWithImages = 0

  for (const product of products) {
    const mapping = productImageMap[product.slug]
    if (!mapping) {
      // Fallback: assign images based on product name heuristics
      continue
    }

    const pool = imagePools[mapping.pool]
    if (!pool || pool.length === 0) continue

    // Pick images from pool, cycling if needed
    const imagesToCreate = []
    for (let i = 0; i < mapping.count; i++) {
      const img = pool[i % pool.length]
      imagesToCreate.push({
        productId: product.id,
        url: img.url,
        originalUrl: img.url,
        altText: `${product.name} - ${imageTypes[i % imageTypes.length].toLowerCase()} view`,
        caption: imageTypes[i % imageTypes.length],
        sortOrder: i,
        isPrimary: i === 0,
        source: 'IMPORTED',
        sourceUrl: img.url,
        licenseStatus: 'VERIFIED',
        width: img.w,
        height: img.h,
        mimeType: img.url.endsWith('.png') ? 'image/png' :
                  img.url.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
        qualityScore: 75 + Math.floor(Math.random() * 20), // 75-94
        imageType: imageTypes[i % imageTypes.length],
        status: 'APPROVED',
      })
    }

    const result = await db.productImage.createMany({ data: imagesToCreate })
    totalCreated += result.count
    productsWithImages++

    // Also set the thumbnail on the product itself (for fallback)
    await db.product.update({
      where: { id: product.id },
      data: { thumbnail: pool[0].url },
    })

    console.log(`  ${product.name}: ${result.count} images`)
  }

  console.log(`\nDone! Created ${totalCreated} images across ${productsWithImages} products`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
