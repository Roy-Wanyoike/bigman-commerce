import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { formatPrice, getDiscount, conditionLabels, conditionGrades, stockStatus } from '@/lib/prices'
import ProductGallery from '@/components/bigman/ProductGallery'
import ProductCard from '@/components/bigman/ProductCard'
import ProductActions from '@/components/bigman/ProductActions'
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { ShieldCheck, Truck, RotateCcw, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ============================================================
// HELPERS
// ============================================================

/** Build category breadcrumb chain from a leaf category up to root */
async function buildCategoryChain(categoryId: string): Promise<{ id: string; name: string; slug: string }[]> {
  const chain: { id: string; name: string; slug: string }[] = []
  let currentId = categoryId

  while (currentId) {
    const cat = await db.category.findUnique({ where: { id: currentId }, select: { id: true, name: true, slug: true, parentId: true } })
    if (!cat) break
    chain.unshift({ id: cat.id, name: cat.name, slug: cat.slug })
    currentId = cat.parentId || ''
  }
  return chain
}

/** Convert camelCase to Title Case */
function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Gather product images: approved ProductImage table rows first, then fallback to JSON images field */
function gatherImages(product: any): { url: string; altText?: string }[] {
  const images: { url: string; altText?: string }[] = []

  // 1. Approved product images from ProductImage table (non-unit-specific)
  if (product.productImages?.length) {
    const approved = product.productImages
      .filter((pi: any) => pi.status === 'APPROVED' && !pi.inventoryUnitId)
      .sort((a: any, b: any) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.sortOrder - b.sortOrder))
    for (const pi of approved) {
      images.push({ url: pi.url, altText: pi.altText || undefined })
    }
  }

  // 2. Fallback: JSON images field
  if (images.length === 0 && product.images) {
    try {
      const parsed = JSON.parse(product.images)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string') {
            images.push({ url: item })
          } else if (item?.url) {
            images.push({ url: item.url, altText: item.altText })
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // 3. Fallback: thumbnail field
  if (images.length === 0 && product.thumbnail) {
    images.push({ url: product.thumbnail })
  }

  return images
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: { select: { name: true } },
      productImages: { where: { status: 'APPROVED', inventoryUnitId: null }, select: { url: true }, take: 1, orderBy: { isPrimary: 'desc' } },
    },
  })

  if (!product) return { title: 'Product Not Found | Bigman Computers Nairobi' }

  const effectivePrice = product.salePrice || product.basePrice
  const description = product.shortDescription?.slice(0, 160) || product.description?.slice(0, 160) || ''
  const imageUrl = product.productImages[0]?.url || product.thumbnail || ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || '',
    image: imageUrl,
    sku: product.sku || product.partNumber || '',
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'KES',
      availability: product.trackInventory && product.stockCount <= 0
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Bigman Computers' },
    },
  }

  return {
    title: `${product.name} | Bigman Computers Nairobi`,
    description,
    openGraph: {
      title: `${product.name} | Bigman Computers Nairobi`,
      description,
      images: imageUrl ? [imageUrl] : [],
      type: 'website',
    },
    other: {
      'script:ld+json': JSON.stringify(jsonLd),
    },
  }
}

// ============================================================
// PAGE
// ============================================================

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      categories: { include: { category: true } },
      productImages: {
        where: { status: 'APPROVED', inventoryUnitId: null },
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  })

  if (!product || !['ACTIVE', 'PUBLISHED'].includes(product.status)) {
    notFound()
  }

  // Gather images
  const images = gatherImages(product)

  // Breadcrumb chain from first category
  let categoryChain: { id: string; name: string; slug: string }[] = []
  if (product.categories.length > 0) {
    categoryChain = await buildCategoryChain(product.categories[0].categoryId)
  }

  // Cross-sell: products in same categories, excluding current product
  const crossSellCatIds = product.categories.map(c => c.categoryId)
  const crossSellProducts = crossSellCatIds.length > 0
    ? await db.product.findMany({
        where: {
          id: { not: product.id },
          status: { in: ['ACTIVE', 'PUBLISHED'] },
          categories: { some: { categoryId: { in: crossSellCatIds } } },
        },
        include: { brand: true, categories: { include: { category: true } } },
        take: 8,
        orderBy: { sortOrder: 'asc' },
      })
    : []

  // Computed values
  const effectivePrice = product.salePrice || product.basePrice
  const discount = getDiscount(effectivePrice, product.compareAtPrice)
  const stock = stockStatus(product.stockCount, product.trackInventory)
  const outOfStock = product.trackInventory && product.stockCount <= 0
  const specs: Record<string, string> = product.specifications ? JSON.parse(product.specifications) : {}

  // Compatible models
  let compatibleModelsList: string[] = []
  if (product.compatibleModels) {
    try {
      const parsed = JSON.parse(product.compatibleModels)
      if (Array.isArray(parsed)) compatibleModelsList = parsed
      else compatibleModelsList = product.compatibleModels.split(',').map((s: string) => s.trim()).filter(Boolean)
    } catch {
      compatibleModelsList = product.compatibleModels.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  }

  // JSON-LD structured data
  const imageUrl = images[0]?.url || ''
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || '',
    image: imageUrl,
    sku: product.sku || product.partNumber || '',
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      price: effectivePrice,
      priceCurrency: 'KES',
      availability: outOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Bigman Computers' },
    },
  }

  return (
    <main className="min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* ===== BREADCRUMBS ===== */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            {categoryChain.map((cat) => (
              <span key={cat.id} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/shop/${cat.slug}`}>{cat.name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
              </span>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-normal text-muted-foreground max-w-[200px] sm:max-w-none truncate">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ===== PRODUCT HERO: 2-col on desktop ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-14">
          {/* LEFT: Image Gallery */}
          <ProductGallery images={images} productName={product.name} />

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-4">
            {/* Brand */}
            {product.brand && (
              <Link
                href={`/brand/${product.brand.slug}`}
                className="text-sm font-medium text-accent hover:underline w-fit"
              >
                {product.brand.name}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>

            {/* Condition + Grade badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={product.condition === 'REFURBISHED' ? 'default' : 'secondary'} className={
                product.condition === 'REFURBISHED' ? 'bg-amber-600 text-white hover:bg-amber-700' : ''
              }>
                {conditionLabels[product.condition] || product.condition}
              </Badge>
              {product.condition === 'REFURBISHED' && product.conditionGrade && (
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  GRADE {conditionGrades[product.conditionGrade] || product.conditionGrade}
                </Badge>
              )}
              {product.isGaming && (
                <Badge className="bg-purple-600 text-white hover:bg-purple-700">GAMING</Badge>
              )}
              <Badge variant={stock.variant} className={stock.variant === 'default' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : ''}>
                {stock.label}
              </Badge>
            </div>

            {/* Price Block */}
            <div className="bg-secondary/40 rounded-xl p-4 space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold">
                  {product.salePrice ? (
                    <span className="text-destructive">{formatPrice(product.salePrice)}</span>
                  ) : (
                    formatPrice(product.basePrice)
                  )}
                </span>
                {discount && product.compareAtPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                {discount && (
                  <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
                )}
              </div>
              {discount && product.compareAtPrice && (
                <p className="text-sm text-emerald-600 font-medium">
                  You save {formatPrice(product.compareAtPrice - effectivePrice)}
                </p>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* SKU / Part Number / Warranty */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {product.sku && (
                <div><span className="font-medium text-foreground/70">SKU:</span> {product.sku}</div>
              )}
              {product.partNumber && (
                <div><span className="font-medium text-foreground/70">Part #:</span> {product.partNumber}</div>
              )}
              {product.warrantyMonths && (
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{product.warrantyMonths}-month warranty</span>
                </div>
              )}
            </div>

            <Separator className="my-1" />

            {/* Action Buttons (Add to Cart, Wishlist, Compare) */}
            <ProductActions
              productId={product.id}
              name={product.name}
              price={effectivePrice}
              condition={product.condition}
              conditionGrade={product.conditionGrade || undefined}
              brand={product.brand?.name}
              specs={specs}
              outOfStock={outOfStock}
            />

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="flex flex-col items-center text-center gap-1 p-3 bg-secondary/30 rounded-lg">
                <Truck className="h-5 w-5 text-accent" />
                <span className="text-[11px] text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-3 bg-secondary/30 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span className="text-[11px] text-muted-foreground">Genuine Products</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 p-3 bg-secondary/30 rounded-lg">
                <RotateCcw className="h-5 w-5 text-accent" />
                <span className="text-[11px] text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTIONS: Specs, Description, Compatibility ===== */}
        <div className="mt-10 md:mt-14 space-y-10">

          {/* Specifications Table */}
          {Object.keys(specs).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Specifications</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableBody>
                    {Object.entries(specs).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium text-muted-foreground w-1/3 max-w-[200px]">
                          {toTitleCase(key)}
                        </TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Description (Markdown) */}
          {product.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="prose prose-sm max-w-none text-foreground/90
                  prose-headings:font-semibold prose-headings:text-foreground
                  prose-p:leading-relaxed prose-p:text-foreground/80
                  prose-li:text-foreground/80 prose-strong:text-foreground
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-table:text-sm
                  prose-th:bg-secondary/50 prose-th:p-2 prose-th:font-medium
                  prose-td:p-2 prose-td:border-border
                  prose-img:rounded-lg prose-img:my-4
                ">
                  <ReactMarkdown>{product.description}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compatible Models */}
          {compatibleModelsList.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Compatible Models</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  This product is compatible with the following models:
                </p>
                <div className="flex flex-wrap gap-2">
                  {compatibleModelsList.map((model) => (
                    <Badge key={model} variant="secondary" className="text-xs font-normal py-1 px-2.5">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== CROSS-SELL ===== */}
        {crossSellProducts.length > 0 && (
          <section className="mt-10 md:mt-14 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">You May Also Like</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Related products from the same category</p>
              </div>
              <Link href={`/shop/${categoryChain[0]?.slug || ''}`} className="text-sm text-accent hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {crossSellProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
