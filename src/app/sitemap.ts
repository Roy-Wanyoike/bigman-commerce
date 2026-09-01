import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL = 'https://bigmancomputers.co.ke'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    db.product.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true, parentId: true } }),
    db.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/gaming`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/refurbished`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/b2b`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/business`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/returns`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${BASE_URL}/shop/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const brandPages: MetadataRoute.Sitemap = brands.map(b => ({
    url: `${BASE_URL}/brand/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages]
}
