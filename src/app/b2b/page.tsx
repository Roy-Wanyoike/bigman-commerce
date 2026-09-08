import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import B2BFormClient from './B2BFormClient'
import { Building2, Shield, UserCheck, Banknote, Percent, FileText, ArrowRight, Phone, Mail } from 'lucide-react'
import { TEL_LINK, PHONE_DISPLAY } from '@/lib/constants'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Bulk & Corporate Orders | Bigman Computers',
  description: 'Request a bulk or corporate quote from Bigman Computers. Wholesale pricing, tax invoices, dedicated account management, and M-Pesa & bank transfer payment options.',
}

const benefits = [
  { icon: Percent, title: 'Corporate Pricing', desc: 'Exclusive wholesale rates on laptops, desktops, networking gear, and accessories for registered businesses.' },
  { icon: UserCheck, title: 'Dedicated Account Manager', desc: 'A single point of contact who understands your IT procurement needs and procurement cycles.' },
  { icon: Banknote, title: 'Flexible Payments', desc: 'M-Pesa, bank transfer (EFT/RTGS), and invoiced terms for qualifying organisations.' },
  { icon: Shield, title: 'Bulk Discounts', desc: 'Volume-tiered pricing — the more you order, the more you save on every unit.' },
  { icon: FileText, title: 'Tax Invoices', desc: 'KRA-compliant tax invoices with your PIN for seamless bookkeeping and expense claims.' },
  { icon: Building2, title: 'Government & NGO Ready', desc: 'We serve government agencies, NGOs, schools, and parastatals with LPO/LSO processes.' },
]

export default async function B2BPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="border-b border-border/60 bg-muted/30">
          <div className="container-main py-10 md:py-16">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-3">B2B Solutions</Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
                Bulk &amp; Corporate Orders
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                Get competitive pricing on volume orders for your organisation. Whether you need 5 laptops
                or a full office deployment, our B2B team delivers tailored quotes within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* ── Quote Form ── */}
        <section className="py-10 md:py-14">
          <div className="container-main max-w-4xl">
            <h2 className="text-lg font-bold mb-6">Request a Quote</h2>
            <B2BFormClient />
          </div>
        </section>

        {/* ── B2B Benefits ── */}
        <section className="py-10 md:py-14 border-t border-border/60 bg-muted/20">
          <div className="container-main">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Why Bigman for Business?</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Trusted by SMEs, corporates, and government agencies across Kenya for reliable IT procurement.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(b => (
                <Card key={b.title} className="border-border/60">
                  <CardContent className="p-5 space-y-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <b.icon className="h-[18px] w-[18px] text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section className="py-10 md:py-14 border-t border-border/60">
          <div className="container-main">
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold mb-1">Prefer to Talk Directly?</h2>
                  <p className="text-sm text-muted-foreground">
                    Our B2B team is available for consultations, custom configurations, and large-scale deployments.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <a href="mailto:business@bigmancomputers.co.ke" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" /> business@bigmancomputers.co.ke
                    </a>
                    <a href={TEL_LINK} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>
                <Link
                  href="/business"
                  className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Learn About Our Services <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}