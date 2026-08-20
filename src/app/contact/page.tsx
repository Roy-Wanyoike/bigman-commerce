import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Contact Us | Bigman Computers',
  description: 'Get in touch with Bigman Computers — visit our store, call, or email us.',
}

export default async function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Contact Us</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              We&rsquo;d love to hear from you. Reach out through any of the channels below.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <h2 className="text-lg font-semibold text-foreground">Visit Our Store</h2>
              <p>
                <strong className="text-foreground">Bigman Computers</strong><br />
                Rahimtulla Trust Building<br />
                Moi Avenue<br />
                Nairobi, Kenya
              </p>
              <h2 className="text-lg font-semibold text-foreground">Email</h2>
              <p>For general inquiries, product availability, and order support: <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a></p>
              <h2 className="text-lg font-semibold text-foreground">Phone</h2>
              <p>Call us during business hours for immediate assistance. You can also reach us via WhatsApp for quick questions and order updates.</p>
              <h2 className="text-lg font-semibold text-foreground">Business Hours</h2>
              <p>
                <strong className="text-foreground">Monday – Friday:</strong> 8:00 AM – 6:00 PM<br />
                <strong className="text-foreground">Saturday:</strong> 9:00 AM – 5:00 PM<br />
                <strong className="text-foreground">Sunday:</strong> Closed<br />
                <span className="text-xs">Public holidays may affect these hours.</span>
              </p>
              <h2 className="text-lg font-semibold text-foreground">After-Sales Support</h2>
              <p>If you need help with a product you purchased from us, including warranty claims and technical support, please email us with your order number and a description of the issue. Our team will respond promptly during business hours.</p>
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
