'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductImage {
  url: string
  altText?: string
}

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const mainImageRef = useRef<HTMLDivElement>(null)
  const hasImages = images.length > 0

  // Mobile carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [mobileIndex, setMobileIndex] = useState(0)
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  // Sync desktop ↔ mobile
  const handleThumbClick = (index: number) => {
    setSelectedIndex(index)
    scrollTo(index)
  }

  // Keep embla select in sync
  useEffect(() => {
    if (!emblaApi) return
    const handler = () => {
      const idx = emblaApi.selectedScrollSnap()
      setMobileIndex(idx)
      setSelectedIndex(idx)
    }
    emblaApi.on('select', handler)
    return () => { emblaApi.off('select', handler) }
  }, [emblaApi])

  // Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return
    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const handleMouseLeave = () => setZoomPos(null)

  // Placeholder
  if (!hasImages) {
    return (
      <div className="relative aspect-square bg-secondary/30 rounded-xl flex items-center justify-center md:rounded-2xl">
        <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground/30">
            {productName?.[0]?.toUpperCase() || 'B'}
          </span>
        </div>
      </div>
    )
  }

  const currentImage = images[selectedIndex]

  return (
    <>
      {/* ===== MOBILE: Embla Carousel ===== */}
      <div className="md:hidden">
        <div className="relative" ref={emblaRef}>
          <div className="flex">
            {images.map((img, i) => (
              <div key={i} className="min-w-0 shrink-0 grow-0 basis-full pl-0">
                <div
                  className="aspect-square bg-secondary/30 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedIndex(i)
                    setIsFullscreen(true)
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.altText || `${productName} image ${i + 1}`}
                    className="w-full h-full object-contain p-2"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile nav arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card/90 border border-border shadow-sm flex items-center justify-center"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card/90 border border-border shadow-sm flex items-center justify-center"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === mobileIndex
                    ? 'w-6 bg-accent'
                    : 'w-2 bg-muted-foreground/30'
                )}
                onClick={() => scrollTo(i)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== DESKTOP: Main + Thumbnails ===== */}
      <div className="hidden md:flex flex-col gap-3">
        {/* Main image with zoom */}
        <div
          ref={mainImageRef}
          className="relative aspect-square bg-secondary/30 rounded-2xl overflow-hidden cursor-zoom-in group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsFullscreen(true)}
        >
          {/* Zoom overlay */}
          {zoomPos && (
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                backgroundImage: `url(${currentImage.url})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          <img
            src={currentImage.url}
            alt={currentImage.altText || `${productName} - Image ${selectedIndex + 1}`}
            className={cn(
              'w-full h-full object-contain p-6 transition-opacity duration-200',
              zoomPos && 'opacity-0'
            )}
            loading="eager"
          />

          {/* Expand icon */}
          <div className="absolute top-3 right-3 z-20 h-8 w-8 rounded-lg bg-card/80 border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full bg-card/80 border border-border/50 text-xs text-muted-foreground">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                className={cn(
                  'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                  i === selectedIndex
                    ? 'border-accent ring-1 ring-accent/30'
                    : 'border-border/50 hover:border-border'
                )}
                onClick={() => handleThumbClick(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.altText || `Thumbnail ${i + 1}`}
                  className="w-full h-full object-contain bg-secondary/30"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== FULLSCREEN MODAL ===== */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none sm:max-w-[95vw]">
          <DialogTitle className="sr-only">{productName} - Image Gallery</DialogTitle>
          <div className="relative flex items-center justify-center w-full h-[80vh]">
            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 z-30 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
                  onClick={() => {
                    const prev = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
                    setSelectedIndex(prev)
                    scrollTo(prev)
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-3 z-30 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
                  onClick={() => {
                    const next = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1
                    setSelectedIndex(next)
                    scrollTo(next)
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              className="absolute top-3 right-3 z-30 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Fullscreen image */}
            <img
              src={images[selectedIndex]?.url}
              alt={images[selectedIndex]?.altText || `${productName} - Image ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain p-4"
            />

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-white">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
