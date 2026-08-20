import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Returns & Warranty | Bigman Computers',
  description: 'Learn about Bigman Computers return policy and warranty terms.',
}

export default async function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Returns & Warranty</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Our return policy and product warranty information.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h2 className="text-lg font-semibold text-foreground">Return Policy</h2>
              <p>We want you to be completely satisfied with your purchase. If you receive a defective or incorrect product, you may request a return within <strong className="text-foreground">7 days</strong> of delivery. The product must be in its original packaging with all accessories and documentation included.</p>
              <h2 className="text-lg font-semibold text-foreground">Non-Returnable Items</h2>
              <p>The following items cannot be returned: opened software licenses, consumables such as ink and toner cartridges that have been installed, and products that have been damaged due to misuse or unauthorized modification.</p>
              <h2 className="text-lg font-semibold text-foreground">How to Initiate a Return</h2>
              <p>To start a return, contact our support team at <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a> or visit our store at Rahimtulla Trust Building, Moi Avenue, Nairobi. Please include your order number and a description of the issue. We will provide return instructions and, once the item is received and inspected, process your refund or replacement within 5 business days.</p>
              <h2 className="text-lg font-semibold text-foreground">Warranty Coverage</h2>
              <p>Most products sold by Bigman Computers are covered by the manufacturer&rsquo;s warranty. Warranty periods vary by product and manufacturer, typically ranging from 1 to 3 years. Warranty covers manufacturing defects and hardware failures under normal use. It does not cover damage from accidents, misuse, liquid spills, power surges, or unauthorized repairs.</p>
              <h2 className="text-lg font-semibold text-foreground">Warranty Claims</h2>
              <p>For warranty service, bring the product along with your original receipt or proof of purchase to our store. Our technical team will assess the issue and coordinate with the manufacturer or authorized service center on your behalf. Turnaround times depend on the manufacturer and the nature of the repair.</p>
              <h2 className="text-lg font-semibold text-foreground">Refurbished Products</h2>
              <p>Refurbished products are covered by a <strong className="text-foreground">90-day Bigman Computers warranty</strong> unless otherwise stated. This covers hardware defects and malfunctions but excludes cosmetic wear and battery degradation.</p>
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <p>For return or warranty questions, contact us at <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a> or call us at our store. Our team is available during business hours to assist you.</p>
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
