'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Cpu, CircuitBoard, MemoryStick, Monitor, HardDrive,
  Zap, Box, Fan, ShoppingCart, X, ChevronRight,
  Check, RotateCcw, Sparkles, Gamepad2, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/prices'
import { useStore } from '@/lib/store'

interface BuildProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number | null
  thumbnail: string | null
  images: string | null
  brand: { name: string } | null
  productImages: { url: string; altText: string | null }[]
}

interface BuildComponent {
  id: string
  componentType: string
  productId: string | null
  compatibleWith: string | null
  sortOrder: number
  product: BuildProduct | null
}

interface GroupedComponents {
  [key: string]: BuildComponent[]
}

interface SlotConfig {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const SLOT_CONFIG: SlotConfig[] = [
  { key: 'CPU', label: 'Processor (CPU)', icon: Cpu, color: 'text-red-400' },
  { key: 'MOTHERBOARD', label: 'Motherboard', icon: CircuitBoard, color: 'text-green-400' },
  { key: 'RAM', label: 'Memory (RAM)', icon: MemoryStick, color: 'text-blue-400' },
  { key: 'GPU', label: 'Graphics Card (GPU)', icon: Monitor, color: 'text-purple-400' },
  { key: 'SSD', label: 'SSD Storage', icon: HardDrive, color: 'text-amber-400' },
  { key: 'HDD', label: 'HDD Storage', icon: HardDrive, color: 'text-orange-400' },
  { key: 'PSU', label: 'Power Supply (PSU)', icon: Zap, color: 'text-yellow-400' },
  { key: 'CASE', label: 'Case', icon: Box, color: 'text-cyan-400' },
  { key: 'COOLING', label: 'Cooling', icon: Fan, color: 'text-teal-400' },
]

interface ApiProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number | null
  thumbnail: string | null
  images: string | null
  specifications: string | null
  brand: { name: string } | null
  productImages: { url: string; altText: string | null }[]
}

export function BuilderClient() {
  const [components, setComponents] = useState<GroupedComponents>({})
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [selected, setSelected] = useState<Record<string, BuildComponent>>({})
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { addToCart } = useStore()

  useEffect(() => {
    async function fetchData() {
      try {
        const [buildsRes, productsRes] = await Promise.all([
          fetch('/api/gaming/builds'),
          fetch('/api/products?status=PUBLISHED&limit=200'),
        ])
        const buildsJson = await buildsRes.json()
        const productsJson = await productsRes.json()
        if (buildsJson.success) setComponents(buildsJson.data)
        if (productsJson.products) setAllProducts(productsJson.products)
      } catch (err) {
        console.error('Failed to load builder data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getProductPrice = useCallback(
    (comp: BuildComponent) => {
      if (comp.product) {
        return comp.product.salePrice ?? comp.product.basePrice
      }
      return 0
    },
    [],
  )

  const totalPrice = useMemo(
    () => Object.values(selected).reduce((sum, comp) => sum + getProductPrice(comp), 0),
    [selected, getProductPrice],
  )

  const filledSlots = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected],
  )

  function handlePick(comp: BuildComponent) {
    if (!activeSlot) return
    setSelected((prev) => ({ ...prev, [activeSlot]: comp }))
    setActiveSlot(null)
  }

  function handlePickFromProducts(product: ApiProduct) {
    if (!activeSlot) return
    const synthetic: BuildComponent = {
      id: `custom-${product.id}`,
      componentType: activeSlot,
      productId: product.id,
      compatibleWith: null,
      sortOrder: 0,
      product,
    }
    setSelected((prev) => ({ ...prev, [activeSlot]: synthetic }))
    setActiveSlot(null)
  }

  function handleRemove(slotKey: string) {
    setSelected((prev) => {
      const next = { ...prev }
      delete next[slotKey]
      return next
    })
  }

  function handleReset() {
    setSelected({})
  }

  async function handleAddToCart() {
    const items = Object.values(selected).filter((s) => s?.product)
    if (items.length === 0) return

    setAddingToCart(true)
    try {
      for (const comp of items) {
        const p = comp.product!
        const img = p.thumbnail || (p.images ? JSON.parse(p.images)[0] : '') || (p.productImages?.[0]?.url ?? '')
        addToCart({
          productId: p.id,
          name: p.name,
          price: p.salePrice ?? p.basePrice,
          image: img,
          quantity: 1,
        })
      }
      setSuccessMsg(`${items.length} components added to cart!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error('Failed to add build to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  const slotItems = activeSlot ? components[activeSlot] ?? [] : []
  const slotProducts = activeSlot
    ? allProducts.filter((p) => {
        const specs = p.specifications ? JSON.parse(p.specifications) : {}
        const name = (p.name || '').toLowerCase()
        if (activeSlot === 'CPU') return name.includes('processor') || name.includes('cpu') || specs.cpu || specs.processor
        if (activeSlot === 'MOTHERBOARD') return name.includes('motherboard') || name.includes('mobo')
        if (activeSlot === 'RAM') return name.includes('ram') || name.includes('memory') || specs.ram
        if (activeSlot === 'GPU') return name.includes('graphics') || name.includes('gpu') || name.includes('rtx') || name.includes('rx ') || name.includes('geforce')
        if (activeSlot === 'SSD') return name.includes('ssd') || (name.includes('storage') && !name.includes('hdd'))
        if (activeSlot === 'HDD') return name.includes('hdd') || name.includes('hard drive')
        if (activeSlot === 'PSU') return name.includes('power supply') || name.includes('psu')
        if (activeSlot === 'CASE') return name.includes('case') || name.includes('chassis') || name.includes('tower')
        if (activeSlot === 'COOLING') return name.includes('cooler') || name.includes('cooling') || name.includes('fan') || name.includes('liquid')
        return false
      })
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading components...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-zinc-950 to-red-900/20" />
        <div className="relative px-4 py-10 sm:py-16 max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="w-8 h-8 text-purple-400" />
            <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/10 text-[10px] font-semibold tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> PC BUILDER
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Build Your{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Dream Gaming PC
            </span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Select from premium components to build a custom gaming rig tailored to your performance needs and budget.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Component Slots */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Components ({filledSlots}/{SLOT_CONFIG.length})</h2>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-zinc-500 hover:text-zinc-300">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>

          {SLOT_CONFIG.map((slot) => {
            const Icon = slot.icon
            const picked = selected[slot.key]
            const hasOptions = (components[slot.key]?.length ?? 0) > 0

            return (
              <Card
                key={slot.key}
                className={`border transition-all duration-200 cursor-pointer group ${picked ? 'border-purple-500/50 bg-purple-500/5 hover:border-purple-400' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}`}
                onClick={() => setActiveSlot(slot.key)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${slot.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{slot.label}</p>
                    {picked?.product ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-medium text-zinc-100 truncate">{picked.product.name}</p>
                        <Badge variant="secondary" className="text-[10px] bg-green-500/15 text-green-400 border-green-500/30 flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-0.5 text-zinc-500">
                        <Plus className="w-3.5 h-3.5" />
                        <p className="text-sm">Click to select</p>
                      </div>
                    )}
                  </div>
                  {picked?.product && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-sm font-semibold text-purple-400">{formatPrice(getProductPrice(picked))}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => { e.stopPropagation(); handleRemove(slot.key) }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {!picked && (
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/80 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 border-b border-zinc-800">
                <h3 className="font-semibold text-sm">Build Summary</h3>
                <p className="text-xs text-zinc-400">{filledSlots} of {SLOT_CONFIG.length} components selected</p>
              </div>
              <CardContent className="p-4 space-y-2">
                {filledSlots === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-6">Select components to start building</p>
                )}
                {SLOT_CONFIG.map((slot) => {
                  const comp = selected[slot.key]
                  if (!comp?.product) return null
                  return (
                    <div key={slot.key} className="flex items-center justify-between text-sm py-1">
                      <span className="text-zinc-400 truncate mr-2">{comp.product.name}</span>
                      <span className="text-zinc-200 flex-shrink-0">{formatPrice(getProductPrice(comp))}</span>
                    </div>
                  )
                })}
                {filledSlots > 0 && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-semibold text-zinc-300">Total</span>
                      <span className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold h-12 text-base"
              disabled={filledSlots === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              {filledSlots === 0 ? 'Select Components' : `Add Build to Cart (${formatPrice(totalPrice)})`}
            </Button>

            {successMsg && (
              <p className="text-center text-sm text-green-400 font-medium">{successMsg}</p>
            )}

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-xs text-zinc-500 leading-relaxed">
                <Sparkles className="w-3 h-3 inline text-purple-400 mr-1" />
                <span className="text-zinc-400">Tip:</span> All components are hand-picked for gaming performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Selection Dialog */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setActiveSlot(null)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {(() => {
                  const cfg = SLOT_CONFIG.find((s) => s.key === activeSlot)
                  const Icon = cfg?.icon ?? Box
                  return <Icon className={`w-5 h-5 ${cfg?.color ?? 'text-zinc-400'}`} />
                })()}
                Select {activeSlot}
              </h2>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => setActiveSlot(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {/* Recommended components from GamingBuildComponent */}
              {slotItems.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Recommended</p>
                  <div className="space-y-2">
                    {slotItems.map((comp) => {
                      const isPicked = selected[activeSlot!]?.id === comp.id
                      if (!comp.product) return null
                      const img = comp.product.thumbnail || comp.product.productImages?.[0]?.url
                      return (
                        <Card
                          key={comp.id}
                          className={`cursor-pointer transition-all ${isPicked ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}
                          onClick={() => handlePick(comp)}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            {img && (
                              <div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={comp.product.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-zinc-500">{comp.product.brand?.name}</p>
                              <p className="text-sm font-medium truncate">{comp.product.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-purple-400">{formatPrice(getProductPrice(comp))}</p>
                              {isPicked && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* All products as fallback */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">All Products</p>
                {slotProducts.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-8">No products found for this component type.</p>
                ) : (
                  <div className="space-y-2">
                    {slotProducts.slice(0, 20).map((p: ApiProduct) => {
                      const isPicked = selected[activeSlot!]?.productId === p.id
                      const img = p.thumbnail || (p.images ? JSON.parse(p.images)[0] : '') || p.productImages?.[0]?.url
                      const price = p.salePrice ?? p.basePrice
                      return (
                        <Card
                          key={p.id}
                          className={`cursor-pointer transition-all ${isPicked ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}
                          onClick={() => handlePickFromProducts(p)}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            {img && (
                              <div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-zinc-500">{p.brand?.name}</p>
                              <p className="text-sm font-medium truncate">{p.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-purple-400">{formatPrice(price)}</p>
                              {isPicked && <Check className="w-4 h-4 text-green-400 mx-auto mt-1" />}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}