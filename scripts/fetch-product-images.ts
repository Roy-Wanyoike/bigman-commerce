/**
 * Fetch real product images using z-ai-web-dev-sdk image search.
 * 
 * This script:
 * 1. Reads products from the DB
 * 2. Uses z-ai image-search CLI to find images
 * 3. Creates ProductImage records for each product
 * 
 * Usage: bun run scripts/fetch-product-images.ts
 */

import { db } from '../src/lib/db'
import { execSync } from 'child_process'

const PRODUCT_QUERIES = [
  'Samsung 500GB 870 EVO SSD solid state drive product photo',
  'HyperX Cloud Stinger gaming headset product photo',
  'Razer DeathAdder Essential gaming mouse product photo',
  'Logitech MK270 wireless keyboard mouse combo product photo',
  'AOC 24G2 gaming monitor 24 inch product photo',
  'LG 27UK850 4K monitor product photo',
  'Seagate BarraCuda 1TB HDD hard drive product photo',
  'HP LaserJet Pro M404dn printer product photo',
  'Crucial 16GB DDR4-3200 DIMM memory RAM product photo',
  'Kingston 8GB DDR5-4800 SO-DIMM laptop memory product photo',
  'Dell Precision 5560 laptop product photo',
]

async function main() {
  const products = await db.product.findMany({
    where: { status: { in: ['ACTIVE', 'PUBLISHED'] } },
    include: { brand: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  console.log(`Found ${products.length} products. Starting image search...\n`)

  let created = 0
  for (const product of products) {
    // Skip products that already have images
    const existingCount = await db.productImage.count({
      where: { productId: product.id },
    })
    if (existingCount > 0) {
      console.log(`⏭ SKIP (has ${existingCount} images): ${product.name}`)
      continue
    }

    const query = `${product.brand?.name || ''} ${product.name} product photo`.trim()
    console.log(`🔍 Searching: ${query}`)

    try {
      const result = execSync(
        `z-ai image-search -q "${query.replace(/"/g, '\\"')}" -c 1 --gl us --no-rank`,
        { timeout: 120000, encoding: 'utf-8' }
      )
      const data = JSON.parse(result)

      if (!data.success || !data.results?.length) {
        console.log(`❌ No results for: ${product.name}`)
        continue
      }

      const img = data.results[0]
      const width = parseInt(img.original_width) || null
      const height = parseInt(img.original_height) || null

      await db.productImage.create({
        data: {
          productId: product.id,
          url: img.original_url,
          sourceUrl: img.original_url,
          altText: product.name,
          imageType: 'FRONT',
          isPrimary: true,
          source: 'MANUFACTURER',
          licenseStatus: 'UNVERIFIED',
          status: 'APPROVED',
          width,
          height,
          mimeType: 'image/jpeg',
          sortOrder: 0,
        },
      })

      created++
      console.log(`✅ Created image for: ${product.name} (${width}x${height})`)
    } catch (err) {
      console.error(`❌ Error for ${product.name}:`, err)
    }
  }

  console.log(`\n✨ Done. Created ${created} product images.`)
}

main().catch(console.error)
