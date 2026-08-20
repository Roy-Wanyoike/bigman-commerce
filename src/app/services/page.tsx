import { db } from '@/lib/db'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav, ServicesSection } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Services | Bigman Computers',
  description: 'Professional computer repair, upgrade, installation and recovery services at Bigman Computers, Nairobi.',
}

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.serviceProduct.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  function buildTree(parentId: string | null = null): any[] {
    return categories.filter(c => c.parentId === parentId).map(c => ({ ...c, children: buildTree(c.id) }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={buildTree()} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Professional Services</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Expert repair, upgrade, installation and recovery services. Walk in or book an appointment.
            </p>
          </div>
        </section>
        <ServicesSection services={JSON.parse(JSON.stringify(services))} />
      </main>
      <BigmanFooter categories={buildTree()} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}