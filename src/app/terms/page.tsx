import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Terms of Service | Bigman Computers',
  description: 'Read the Bigman Computers terms of service.',
}

export default async function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              The terms and conditions governing your use of Bigman Computers.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing and using the Bigman Computers website and services, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our website or services.</p>
              <h2 className="text-lg font-semibold text-foreground">2. Products and Pricing</h2>
              <p>All product prices are listed in Kenyan Shillings (KES) and are subject to change without prior notice. We make every effort to ensure pricing accuracy, but in the event of an error, we reserve the right to correct it and cancel any orders placed at the incorrect price.</p>
              <h2 className="text-lg font-semibold text-foreground">3. Orders and Payment</h2>
              <p>Placing an order constitutes an offer to purchase. All orders are subject to acceptance and product availability. We accept M-Pesa, bank transfers, and other approved payment methods. Full payment must be received before an order is dispatched.</p>
              <h2 className="text-lg font-semibold text-foreground">4. Shipping and Delivery</h2>
              <p>Delivery timelines are estimates and not guaranteed. We are not liable for delays caused by factors beyond our control, including carrier disruptions, weather, or customs processing. Risk of loss transfers to the buyer upon handover to the delivery carrier.</p>
              <h2 className="text-lg font-semibold text-foreground">5. Returns and Warranty</h2>
              <p>Please refer to our <a href="/returns" className="text-primary underline">Returns &amp; Warranty</a> page for detailed information on our return policy and product warranty terms.</p>
              <h2 className="text-lg font-semibold text-foreground">6. Intellectual Property</h2>
              <p>All content on this website, including text, images, logos, and product descriptions, is the property of Bigman Computers or its suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.</p>
              <h2 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Bigman Computers shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services. Our total liability for any claim shall not exceed the amount paid by you for the relevant product or service.</p>
              <h2 className="text-lg font-semibold text-foreground">8. Governing Law</h2>
              <p>These terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.</p>
              <h2 className="text-lg font-semibold text-foreground">9. Changes to Terms</h2>
              <p>We reserve the right to update these terms at any time. Continued use of our website after changes are posted constitutes acceptance of the revised terms.</p>
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <p>For any questions about these terms, contact us at <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a> or visit our store at Rahimtulla Trust Building, Moi Avenue, Nairobi.</p>
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
