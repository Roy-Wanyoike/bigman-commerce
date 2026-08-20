import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import WhatsAppButton from "@/components/bigman/WhatsAppButton"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bigman Computers | Technology that works for you",
  description: "Shop laptops, desktops, gaming, accessories, parts and more at Bigman Computers, Nairobi. New and refurbished technology at competitive prices.",
  keywords: ["Bigman Computers", "laptops Kenya", "refurbished laptops Nairobi", "gaming PCs", "computer parts", "monitors", "printers"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Bigman Computers | Technology that works for you",
    description: "Your trusted technology partner in Nairobi. Laptops, gaming, parts, accessories and more.",
    siteName: "Bigman Computers",
    type: "website",
    images: ["/og-image.svg"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        {children}
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  )
}
