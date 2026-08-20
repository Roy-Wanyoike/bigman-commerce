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
  caption?: string
}

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({})
  const mainImageRef = useRef<HTMLDivElement>(null)
  const hasImages = images.length > 0

  // Mobile carousel with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })
  const [mobileIndex, setMobileIndex] = useState(0)
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  // Sync desktop <-> mobile
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

  // Keyboard navigation
  useEffect(() => {
    if (!hasImages || images.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const prev = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
          setSelectedIndex(prev)
          scrollTo(prev)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          const next = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1
          setSelectedIndex(next)
          scrollTo(next)
        } else if (e.key === 'Escape') {
          setIsFullscreen(false)
        }
      } else {
        // Desktop gallery keyboard nav when not in fullscreen
        const focused = document.activeElement
        const isGallery = mainImageRef.current?.contains(focused)
        if (!isGallery) return

        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const prev = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
          setSelectedIndex(prev)
          scrollTo(prev)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          const next = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1
          setSelectedIndex(next)
          scrollTo(next)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasImages, images.length, isFullscreen, selectedIndex, scrollTo])

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
                  className="aspect-square bg-secondary/30 rounded-xl overflow-hidden cursor-pointer relative"
                  onClick={() => {
                    setSelectedIndex(i)
                    setIsFullscreen(true)
                  }}
                >
                  {/* Shimmer loading */}
                  {!imageLoaded[i] && (
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 animate-shimmer" />
                  )}
                  <img
                    src={img.url}
                    alt={img.altText || `${productName} image ${i + 1}`}
                    className="w-full h-full object-contain p-2 transition-opacity duration-300"
                    style={{ opacity: imageLoaded[i] ? 1 : 0 }}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onLoad={() => setImageLoaded(prev => ({ ...prev, [i]: true }))}
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
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-sm flex items-center justify-center transition-transform active:scale-90"
              onClick={(e) => { e.stopPropagation(); emblaApi?.scrollPrev() }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-sm flex items-center justify-center transition-transform active:scale-90"
              onClick={(e) => { e.stopPropagation(); emblaApi?.scrollNext() }}
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
                  'h-2 rounded-full transition-all duration-300',
                  i === mobileIndex
                    ? 'w-6 bg-accent'
                    : 'w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40'
                )}
                onClick={() => scrollTo(i)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image type label */}
        {currentImage?.caption && (
          <p className="text-center text-xs text-muted-foreground mt-1.5 capitalize">
            {currentImage.caption}
          </p>
        )}
      </div>

      {/* ===== DESKTOP: Main + Thumbnails ===== */}
      <div className="hidden md:flex flex-col gap-3">
        {/* Main image with zoom */}
        <div
          ref={mainImageRef}
          className="relative aspect-square bg-secondary/30 rounded-2xl overflow-hidden cursor-zoom-in group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          tabIndex={0}
          role="img"
          aria-label={`${productName} - Image ${selectedIndex + 1} of ${images.length}. Use arrow keys to navigate.`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsFullscreen(true)}
        >
          {/* Shimmer loading */}
          {!imageLoaded[selectedIndex] && (
            <div className="absolute inset-0 z-[5] bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 animate-shimmer" />
          )}

          {/* Zoom overlay */}
          {zoomPos && imageLoaded[selectedIndex] && (
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
              'w-full h-full object-contain p-6 transition-opacity duration-300',
              zoomPos && imageLoaded[selectedIndex] && 'opacity-0'
            )}
            style={{ opacity: (!imageLoaded[selectedIndex] || (zoomPos && imageLoaded[selectedIndex])) ? 0 : 1 }}
            loading="eager"
            onLoad={() => setImageLoaded(prev => ({ ...prev, [selectedIndex]: true }))}
          />

          {/* Image transition overlay for smooth cross-fade */}

          {/* Expand icon */}
          <div className="absolute top-3 right-3 z-20 h-9 w-9 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Image type badge */}
          {currentImage?.caption && (
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-card/80 backdrop-blur-sm border border-border/50 text-xs font-medium text-muted-foreground capitalize">
              {currentImage.caption}
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs text-muted-foreground font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          )}

          {/* Desktop arrow buttons (appear on hover) */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 hover:bg-card hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation()
                  const prev = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
                  setSelectedIndex(prev)
                  scrollTo(prev)
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 hover:bg-card hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation()
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
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {images.map((img, i) => (
              <button
                key={i}
                className={cn(
                  'shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105',
                  i === selectedIndex
                    ? 'border-accent ring-1 ring-accent/30 scale-105'
                    : 'border-border/40 hover:border-border/80'
                )}
                onClick={() => handleThumbClick(i)}
                aria-label={`View ${img.caption?.toLowerCase() || `image`} ${i + 1}`}
                aria-current={i === selectedIndex ? 'true' : undefined}
              >
                <img
                  src={img.url}
                  alt={img.altText || `Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover bg-secondary/30"
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
                  className="absolute left-3 z-30 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
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
                  className="absolute right-3 z-30 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
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
              className="absolute top-3 right-3 z-30 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Fullscreen image with crossfade */}
            <img
              key={selectedIndex}
              src={images[selectedIndex]?.url}
              alt={images[selectedIndex]?.altText || `${productName} - Image ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain p-4 animate-[fadeIn_0.2s_ease-out]"
            />

            {/* Image caption */}
            {images[selectedIndex]?.caption && (
              <div className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white/80 capitalize">
                {images[selectedIndex].caption}
              </div>
            )}

            {/* Counter + dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                {/* Dots */}
                <div className="flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        i === selectedIndex
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      )}
                      onClick={() => {
                        setSelectedIndex(i)
                        scrollTo(i)
                      }}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  {selectedIndex + 1}/{images.length}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
