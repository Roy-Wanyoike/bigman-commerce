import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'About Us | Bigman Computers',
  description: 'Learn about Bigman Computers — Nairobi\'s trusted computer and electronics retailer.',
}

export default async function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">About Bigman Computers</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Your trusted partner for computers, electronics, and IT solutions in Nairobi.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <h2 className="text-lg font-semibold text-foreground">Who We Are</h2>
              <p>Bigman Computers is a leading computer and electronics retailer based in Nairobi, Kenya. Located at Rahimtulla Trust Building along Moi Avenue, we have built a reputation for offering quality products at competitive prices with exceptional customer service.</p>
              <h2 className="text-lg font-semibold text-foreground">What We Offer</h2>
              <p>We stock a wide range of products including laptops, desktops, monitors, printers, networking equipment, computer accessories, and components from leading brands. Whether you are a student, professional, gamer, or business, we have the right solution for you.</p>
              <h2 className="text-lg font-semibold text-foreground">Our Commitment</h2>
              <p>We are committed to providing genuine products with valid manufacturer warranties. Every item we sell is sourced from authorized distributors, ensuring authenticity and reliability. Our knowledgeable team is always ready to help you find the right product for your needs and budget.</p>
              <h2 className="text-lg font-semibold text-foreground">Why Choose Us</h2>
              <p>With years of experience in the Kenyan IT market, we understand the unique needs of our customers. We offer competitive pricing, expert advice, after-sales support, and convenient delivery options across Nairobi and beyond.</p>
              <h2 className="text-lg font-semibold text-foreground">Visit Us</h2>
              <p>Come see us at Rahimtulla Trust Building, Moi Avenue, Nairobi. You can also reach us at <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a>. We look forward to serving you.</p>
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
