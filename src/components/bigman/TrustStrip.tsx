'use client'

import { Shield, Truck, RotateCcw, Headphones } from 'lucide-react'

const items = [
  { icon: Shield, title: 'Bigman Inspected', desc: 'Every refurbished device tested' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Nairobi same-day & countrywide' },
  { icon: RotateCcw, title: 'Warranty', desc: 'Up to 12 months coverage' },
  { icon: Headphones, title: 'Support', desc: 'In-store repair & assistance' },
]

export default function TrustStrip() {
  return (
    <section className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4.5 w-4.5 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}