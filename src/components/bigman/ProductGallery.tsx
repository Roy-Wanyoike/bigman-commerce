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

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
interface ProductImage {
  url: string
  altText?: string
  caption?: string
}

interface Props {
  images: ProductImage[]
  productName: string
}

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */
const ZOOM_FACTOR = 250 // 2.5× magnification via background-size
const CROSSFADE_MS = 200
const THUMB_SIZE = 64

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */
function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */
export default function ProductGallery({ images, productName }: Props) {
  /* ---- State ---- */
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({})
  const [fadeKey, setFadeKey] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)

  /* ---- Refs ---- */
  const mainImageRef = useRef<HTMLDivElement>(null)
  const thumbStripRef = useRef<HTMLDivElement>(null)

  const hasImages = images.length > 0
  const currentImage = hasImages ? images[selectedIndex] : null
  const imageBadge = currentImage?.caption ? currentImage.caption.toUpperCase() : null

  /* ================================================================
     Embla — Mobile carousel
     ================================================================ */
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })

  /* ================================================================
     Embla — Fullscreen carousel (swipe support)
     ================================================================ */
  const [fsEmblaRef, fsEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })

  /* ================================================================
     Navigation — defined early so effects can reference it
     ================================================================ */
  const jumpTo = useCallback((index: number, syncEmbla = true) => {
    setSelectedIndex(index)
    setFadeKey((k) => k + 1)
    if (syncEmbla) {
      mobileEmblaApi?.scrollTo(index)
      fsEmblaApi?.scrollTo(index)
    }
  }, [mobileEmblaApi, fsEmblaApi])

  const goNext = useCallback(() => {
    const next = wrapIndex(selectedIndex + 1, images.length)
    jumpTo(next)
  }, [selectedIndex, images.length, jumpTo])

  const goPrev = useCallback(() => {
    const prev = wrapIndex(selectedIndex - 1, images.length)
    jumpTo(prev)
  }, [selectedIndex, images.length, jumpTo])

  /* ---- Sync mobile Embla → state ---- */
  useEffect(() => {
    if (!mobileEmblaApi) return
    const onSelect = () => {
      const idx = mobileEmblaApi.selectedScrollSnap()
      setMobileIndex(idx)
      setSelectedIndex(idx)
      setFadeKey((k) => k + 1)
    }
    mobileEmblaApi.on('select', onSelect)
    return () => { mobileEmblaApi.off('select', onSelect) }
  }, [mobileEmblaApi])

  /* ---- Sync fullscreen Embla → state ---- */
  useEffect(() => {
    if (!fsEmblaApi) return
    const onSelect = () => {
      const idx = fsEmblaApi.selectedScrollSnap()
      setSelectedIndex(idx)
      setFadeKey((k) => k + 1)
    }
    fsEmblaApi.on('select', onSelect)
    return () => { fsEmblaApi.off('select', onSelect) }
  }, [fsEmblaApi])

  /* ---- Scroll active thumbnail into view ---- */
  useEffect(() => {
    if (!thumbStripRef.current || !hasImages) return
    const thumb = thumbStripRef.current.children[selectedIndex] as HTMLElement | undefined
    if (!thumb) return
    const container = thumbStripRef.current
    const scrollLeft =
      thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }, [selectedIndex, hasImages])

  /* ================================================================
     Keyboard navigation
     ================================================================ */
  useEffect(() => {
    if (!hasImages || images.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
        else if (e.key === 'Escape') { setIsFullscreen(false) }
        return
      }
      const focused = document.activeElement
      if (!mainImageRef.current?.contains(focused)) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasImages, images.length, isFullscreen, goPrev, goNext])

  /* ================================================================
     Zoom — background-image technique (cursor-following, 2.5×)
     ================================================================ */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !currentImage) return
    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [currentImage])

  const handleMouseLeave = useCallback(() => setZoomPos(null), [])

  /* ================================================================
     Fullscreen open / sync
     ================================================================ */
  const openFullscreen = useCallback((index?: number) => {
    if (index !== undefined && index !== selectedIndex) {
      jumpTo(index)
    }
    setIsFullscreen(true)
  }, [jumpTo, selectedIndex])

  // When fullscreen opens, make sure Embla is at the right slide
  useEffect(() => {
    if (isFullscreen && fsEmblaApi) {
      const t = requestAnimationFrame(() => fsEmblaApi.scrollTo(selectedIndex))
      return () => cancelAnimationFrame(t)
    }
  }, [isFullscreen, fsEmblaApi, selectedIndex])

  /* ================================================================
     Empty state — placeholder with product initial
     ================================================================ */
  if (!hasImages) {
    return (
      <div className="min-w-0 relative aspect-[4/3] md:aspect-square bg-secondary/30 rounded-xl md:rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground/25">
              {productName?.[0]?.toUpperCase() || 'B'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/50">No images available</p>
        </div>
      </div>
    )
  }

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <>
      {/* ============================================================
          ROOT WRAPPER — min-w-0 prevents grid-cell overflow
          ============================================================ */}
      <div className="min-w-0 flex flex-col w-full">

        {/* ==========================================================
            MOBILE: Embla Carousel
            ========================================================== */}
        <div className="md:hidden">
          <div className="relative" ref={mobileEmblaRef}>
            <div className="flex">
              {images.map((img, i) => (
                <div key={i} className="min-w-0 shrink-0 grow-0 basis-full">
                  <div
                    className="relative aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => openFullscreen(i)}
                  >
                    {/* Shimmer skeleton */}
                    {!imageLoaded[i] && (
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 skeleton-shimmer" />
                    )}

                    <img
                      src={img.url}
                      alt={img.altText || `${productName} image ${i + 1}`}
                      className="w-full h-full object-contain p-3 transition-opacity duration-200"
                      style={{ opacity: imageLoaded[i] ? 1 : 0 }}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      onLoad={() => setImageLoaded((p) => ({ ...p, [i]: true }))}
                    />

                    {/* Image type badge — only on first image */}
                    {i === 0 && imageBadge && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-primary/80 text-primary-foreground backdrop-blur-sm">
                        {imageBadge}
                      </span>
                    )}

                    {/* Expand button */}
                    <div className="absolute top-2 right-2 z-10 h-8 w-8 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center">
                      <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>

                    {/* Image counter */}
                    {images.length > 1 && (
                      <span className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-[10px] font-medium text-muted-foreground tabular-nums">
                        {i + 1}/{images.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile nav arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-sm flex items-center justify-center transition-transform active:scale-90"
                style={{ top: 'calc(37.5% - 18px)' }}
                onClick={(e) => { e.stopPropagation(); mobileEmblaApi?.scrollPrev() }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-2 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-sm flex items-center justify-center transition-transform active:scale-90"
                style={{ top: 'calc(37.5% - 18px)' }}
                onClick={(e) => { e.stopPropagation(); mobileEmblaApi?.scrollNext() }}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3" role="tablist">
              {images.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === mobileIndex}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === mobileIndex
                      ? 'w-6 bg-accent'
                      : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                  )}
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Caption */}
          {currentImage?.caption && (
            <p className="text-center text-xs text-muted-foreground/70 mt-1.5 capitalize">
              {currentImage.caption}
            </p>
          )}
        </div>

        {/* ==========================================================
            DESKTOP: Main image + thumbnail strip
            ========================================================== */}
        <div className="hidden md:flex flex-col gap-3 w-full">
          {/* ---- Main image area ---- */}
          <div
            ref={mainImageRef}
            className="relative w-full aspect-square bg-secondary/30 rounded-2xl overflow-hidden cursor-zoom-in group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            tabIndex={0}
            role="img"
            aria-label={`${productName} — Image ${selectedIndex + 1} of ${images.length}. Use arrow keys to navigate.`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => openFullscreen()}
          >
            {/* Shimmer skeleton */}
            {!imageLoaded[selectedIndex] && (
              <div className="absolute inset-0 z-[5] bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 skeleton-shimmer" />
            )}

            {/* Main image with crossfade — key forces remount → opacity 0→1 */}
            <img
              key={fadeKey}
              src={currentImage!.url}
              alt={currentImage!.altText || `${productName} — Image ${selectedIndex + 1}`}
              className="w-full h-full object-contain p-6"
              style={{
                opacity: imageLoaded[selectedIndex] && !zoomPos ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms ease`,
              }}
              loading="eager"
              onLoad={() => setImageLoaded((p) => ({ ...p, [selectedIndex]: true }))}
            />

            {/* Zoom overlay — background-image technique for 2.5× magnification */}
            {zoomPos && imageLoaded[selectedIndex] && (
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  backgroundImage: `url(${currentImage!.url})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: `${ZOOM_FACTOR}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}

            {/* ---- Overlay UI ---- */}

            {/* Image type badge (top-left) */}
            {imageBadge && (
              <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-card/80 backdrop-blur-sm border border-border/50 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {imageBadge}
              </span>
            )}

            {/* Expand button (top-right) */}
            <div className="absolute top-3 right-3 z-20 h-9 w-9 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Image counter (bottom-center) */}
            {images.length > 1 && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs text-muted-foreground font-medium tabular-nums">
                {selectedIndex + 1} / {images.length}
              </span>
            )}

            {/* Navigation arrows (hover-visible) */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 hover:bg-card hover:scale-105 active:scale-95"
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 hover:bg-card hover:scale-105 active:scale-95"
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* ---- Thumbnail strip (64×64, hidden scrollbar, overflow-safe) ---- */}
          {images.length > 1 && (
            <div className="min-w-0 overflow-hidden">
              <div
                ref={thumbStripRef}
                className="flex gap-2 overflow-x-auto pb-1 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={cn(
                      'shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-[1.08] active:scale-95',
                      i === selectedIndex
                        ? 'border-accent ring-2 ring-accent/25 scale-[1.08]'
                        : 'border-transparent hover:border-border/60'
                    )}
                    style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                    onClick={() => jumpTo(i)}
                    aria-label={`View ${img.caption?.toLowerCase() || 'image'} ${i + 1}`}
                    aria-current={i === selectedIndex ? 'true' : undefined}
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
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          FULLSCREEN MODAL — Embla carousel with swipe + keyboard
          ================================================================ */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none sm:max-w-[95vw] overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{productName} — Image Gallery</DialogTitle>

          <div className="relative flex items-center justify-center w-full h-[85vh]">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 z-30 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image type badge */}
            {imageBadge && (
              <span className="absolute top-3 left-3 z-30 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-[11px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm">
                {imageBadge}
              </span>
            )}

            {/* Embla carousel for swipe support in fullscreen */}
            <div className="w-full h-full" ref={fsEmblaRef}>
              <div className="flex h-full">
                {images.map((img, i) => (
                  <div key={i} className="min-w-0 shrink-0 grow-0 basis-full flex items-center justify-center h-full">
                    <img
                      src={img.url}
                      alt={img.altText || `${productName} — Image ${i + 1}`}
                      className="max-w-full max-h-full object-contain p-4 sm:p-8 select-none"
                      style={{
                        opacity: i === selectedIndex ? 1 : 0,
                        transition: `opacity ${CROSSFADE_MS}ms ease`,
                      }}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={goNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Bottom bar: dots + counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                <div className="flex items-center gap-1.5" role="tablist">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === selectedIndex}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        i === selectedIndex
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      )}
                      onClick={() => jumpTo(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/60 tabular-nums">
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
