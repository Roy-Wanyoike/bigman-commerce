import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import Link from 'next/link'
import { ArrowRight, Percent, FileText, Building2, Banknote, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Business Solutions | Bigman Computers',
  description: 'Corporate IT procurement, bulk orders, workstation setup, and networking solutions from Bigman Computers Nairobi.',
}

export default async function BusinessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Business Solutions</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Reliable IT procurement and infrastructure services for businesses across Nairobi and Kenya.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <h2 className="text-lg font-semibold text-foreground">Corporate IT Procurement</h2>
              <p>Bigman Computers partners with businesses of all sizes to source quality hardware and software at competitive prices. Whether you need laptops for a growing team, servers for your data centre, or peripherals for a new office, our procurement team handles everything from vendor selection to delivery.</p>
              <h2 className="text-lg font-semibold text-foreground">Bulk Orders</h2>
              <p>Placing large-volume orders is simple. We offer tiered pricing based on quantity, dedicated account management, and flexible payment terms for qualifying organisations. Contact our business team to request a custom quote for any product in our catalogue.</p>
              <h2 className="text-lg font-semibold text-foreground">Workstation Setup &amp; Deployment</h2>
              <p>Our technicians configure and deploy workstations tailored to your workflow. This includes operating system installation, software provisioning, domain joining, and asset tagging — so your team can be productive from day one.</p>
              <h2 className="text-lg font-semibold text-foreground">Networking Solutions</h2>
              <p>From structured cabling and Wi-Fi coverage to router and firewall configuration, we design and implement network infrastructure that keeps your office connected and secure. We work with leading brands to deliver reliable, scalable solutions.</p>
              <h2 className="text-lg font-semibold text-foreground">Corporate Pricing</h2>
              <p>We extend special pricing to registered businesses, NGOs, government agencies, and educational institutions. Open a corporate account to unlock volume discounts, priority support, and quarterly business reviews with your dedicated account manager.</p>
              <h2 className="text-lg font-semibold text-foreground">Get in Touch</h2>
              <p>Ready to discuss your business IT needs? Reach us at <a href="mailto:business@bigmancomputers.co.ke" className="text-primary underline">business@bigmancomputers.co.ke</a> or visit our store at Rahimtulla Trust Building, Moi Avenue, Nairobi. Our business team typically responds within one business day.</p>
            </div>
          </div>
        </section>

        {/* ── B2B Quick-Quote CTA ── */}
        <section className="py-10 md:py-14 border-t border-border/60">
          <div className="container-main max-w-3xl">
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Need a Bulk or Corporate Quote?</h2>
                    <p className="text-sm text-muted-foreground">
                      Submit your requirements online and receive a tailored quote within 24 hours. No payment required to request.
                    </p>
                  </div>
                  <Link
                    href="/b2b"
                    className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Request a Quote <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── B2B Benefits Overview ── */}
        <section className="py-10 md:py-14 border-t border-border/60 bg-muted/20">
          <div className="container-main max-w-3xl">
            <h2 className="text-lg font-bold mb-5">B2B Benefits at a Glance</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Percent, title: 'Corporate Pricing', desc: 'Exclusive wholesale rates on laptops, desktops, and networking gear.' },
                { icon: UserCheck, title: 'Dedicated Account Manager', desc: 'A single point of contact for all your IT procurement needs.' },
                { icon: Banknote, title: 'Flexible Payments', desc: 'M-Pesa, bank transfer (EFT/RTGS), and invoiced terms.' },
                { icon: FileText, title: 'Tax Invoices &amp; Bulk Orders', desc: 'KRA-compliant invoices with volume-tiered discounts.' },
              ].map(b => (
                <div key={b.title} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <b.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
