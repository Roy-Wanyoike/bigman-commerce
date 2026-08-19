'use client'

import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur rounded-full px-3 py-1 text-xs font-medium mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nairobi's Trusted Technology Retailer
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            Technology that<br />works for you.
          </h1>
          <p className="text-base md:text-lg text-primary-foreground/70 mb-6 max-w-lg leading-relaxed">
            Laptops, desktops, gaming, parts, accessories and professional services.
            New and refurbished. Competitive prices, genuine products, reliable support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium">
              <Search className="h-4 w-4 mr-2" /> Find Your Laptop
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Browse Gaming →
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-primary-foreground/50">
            <span>✓ 7+ Years Experience</span>
            <span>✓ Quality Refurbished</span>
            <span>✓ M-Pesa Accepted</span>
            <span>✓ Nairobi Delivery</span>
            <span>✓ Warranty Included</span>
          </div>
        </div>
      </div>
    </section>
  )
}
