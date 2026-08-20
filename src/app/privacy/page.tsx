import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Privacy Policy | Bigman Computers',
  description: 'Read the Bigman Computers privacy policy.',
}

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              How we collect, use, and protect your personal information.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
              <p>When you visit Bigman Computers or make a purchase, we may collect your name, email address, phone number, delivery address, and payment information. We also collect browsing data such as pages visited and products viewed.</p>
              <h2 className="text-lg font-semibold text-foreground">How We Use Your Information</h2>
              <p>We use your information to process orders, provide customer support, send order updates via SMS or email, and improve our website and services. We do not sell your personal data to third parties.</p>
              <h2 className="text-lg font-semibold text-foreground">Data Protection</h2>
              <p>We implement appropriate security measures to protect your personal information. Payment transactions are processed through secure third-party payment providers.</p>
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <p>For any privacy-related questions, contact us at <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a> or visit our store at Rahimtulla Trust Building, Moi Avenue, Nairobi.</p>
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
