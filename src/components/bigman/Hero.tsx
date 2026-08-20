'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Search } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Subtle geometric background pattern */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent translate-y-1/3 -translate-x-1/4" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative container-main py-14 md:py-20 lg:py-24">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nairobi&apos;s Trusted Technology Retailer
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 text-balance">
            Computing Without
            <span className="text-accent"> the Guesswork.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-[17px] text-primary-foreground/65 mb-8 max-w-lg leading-relaxed">
            Laptops, desktops, gaming gear and accessories — selected for the way you work, play and create.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/shop/laptops">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/85 font-semibold h-11 px-6 rounded-lg shadow-lg shadow-accent/20">
                Shop Laptops <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/gaming">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-medium h-11 px-6 rounded-lg">
                Explore Gaming
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-primary-foreground/45 font-medium">
            <span>✓ 7+ Years Experience</span>
            <span>✓ Inspected Refurbished</span>
            <span>✓ M-Pesa Accepted</span>
            <span>✓ Warranty Included</span>
            <span>✓ Showroom Available</span>
          </div>
        </div>

        {/* Right side — visual element for desktop */}
        <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2">
          <div className="relative w-80 h-80">
            {/* Stylized tech card composition */}
            <div className="absolute top-4 right-0 w-64 h-48 bg-primary-foreground/10 rounded-2xl border border-primary-foreground/10 backdrop-blur-sm" />
            <div className="absolute bottom-8 left-4 w-56 h-40 bg-primary-foreground/5 rounded-2xl border border-primary-foreground/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-3xl border border-accent/30 flex items-center justify-center">
              <span className="text-6xl font-extrabold text-accent/60">B</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
