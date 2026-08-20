import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

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
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
