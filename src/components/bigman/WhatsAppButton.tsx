'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Phone, Mail, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const WHATSAPP_NUMBER = '254722450610'
const WHATSAPP_MESSAGE = 'Hi Bigman Computers! I need help with...'

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show button after a small delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div
        className={cn(
          'fixed bottom-20 right-4 z-50 transition-all duration-500',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {/* Popup card */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 sm:w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-[fadeInUp_0.25s_ease-out]">
            {/* Header */}
            <div className="bg-[#25D366] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  B
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Bigman Computers</h3>
                  <p className="text-xs text-white/80">Typically replies within minutes</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat preview */}
            <div className="p-4 space-y-3">
              <div className="bg-secondary/50 rounded-xl rounded-tl-none p-3 max-w-[85%]">
                <p className="text-sm text-foreground/90">
                  Karibu! 👋 Welcome to Bigman Computers. How can we help you today?
                </p>
                <span className="text-[10px] text-muted-foreground mt-1 block">Just now</span>
              </div>

              {/* Quick actions */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Quick Help</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-sm group"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  <span className="text-foreground/80 group-hover:text-foreground">Chat on WhatsApp</span>
                </a>
                <a
                  href="tel:+254722450610"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-sm group"
                >
                  <Phone className="h-4 w-4 text-accent" />
                  <span className="text-foreground/80 group-hover:text-foreground">Call Us</span>
                </a>
                <a
                  href="mailto:info@bigmancomputers.co.ke"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-sm group"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground/80 group-hover:text-foreground">Email Us</span>
                </a>
              </div>

              {/* Info */}
              <div className="border-t border-border/50 pt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Mon-Sat: 8am - 6pm | Sun: 10am - 4pm</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>
            </div>

            {/* Start chat button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-3 text-sm font-semibold transition-colors"
            >
              Start Chat on WhatsApp
            </a>
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95',
            isOpen
              ? 'bg-foreground text-background'
              : 'bg-[#25D366] hover:bg-[#20bd5a] text-white'
          )}
          aria-label={isOpen ? 'Close support menu' : 'Open WhatsApp support'}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
          )}
          {isOpen ? (
            <X className="h-6 w-6 relative z-10" />
          ) : (
            <MessageCircle className="h-6 w-6 relative z-10" />
          )}
        </button>
      </div>
    </>
  )
}
