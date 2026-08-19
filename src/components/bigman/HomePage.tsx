import Header from './Header'
import Hero from './Hero'
import TrustStrip from './TrustStrip'
import {
  FeaturedCategories,
  ProductSection,
  FullCatalog,
  UseCaseSection,
  BudgetSection,
  BrandSection,
  ServicesSection,
  BigmanFooter,
  CompareBar,
  MobileBottomNav,
} from './Sections'
import type { CategoryNode, Product, Brand, ServiceItem } from './types'

interface Props {
  categories: CategoryNode[]
  products: Product[]
  brands: Brand[]
  services: ServiceItem[]
}

export default function HomePage({ categories, products, brands, services }: Props) {
  const featured = products.filter(p => p.isFeatured)
  const deals = products.filter(p => p.isDeal)
  const gaming = products.filter(p => p.isGaming)
  const refurbished = products.filter(p => p.condition === 'REFURBISHED')
  const newLaptops = products.filter(p => p.condition === 'NEW' && p.categories.some(c => c.category.slug === 'laptops'))

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <FeaturedCategories categories={categories} />

        {featured.length > 0 && (
          <ProductSection
            title="Featured Products"
            subtitle="Hand-picked by the Bigman team"
            products={featured}
            viewAllHref="/shop?featured=true"
          />
        )}

        {deals.length > 0 && (
          <ProductSection
            title="Today's Deals"
            subtitle="Limited-time offers on top products"
            products={deals}
            viewAllHref="/deals"
            accentColor="bg-orange-500"
          />
        )}

        {gaming.length > 0 && (
          <ProductSection
            title="Gaming"
            subtitle="Laptops, peripherals and accessories"
            products={gaming}
            viewAllHref="/gaming"
            accentColor="bg-purple-500"
          />
        )}

        {refurbished.length > 0 && (
          <ProductSection
            title="Refurbished Store"
            subtitle="Inspected, graded, and warrantied devices"
            products={refurbished}
            viewAllHref="/refurbished"
            accentColor="bg-amber-500"
          />
        )}

        {newLaptops.length > 0 && (
          <ProductSection
            title="New Laptops"
            subtitle="Latest models from top brands"
            products={newLaptops}
            viewAllHref="/laptops"
          />
        )}

        <UseCaseSection />
        <BudgetSection products={products} />
        <BrandSection brands={brands} />
        <ServicesSection services={services} />
        <FullCatalog products={products} categories={categories} brands={brands} />
      </main>
      <CompareBar />
      <BigmanFooter categories={categories} />
      <MobileBottomNav />
      <div className="md:hidden h-14" />
    </div>
  )
}