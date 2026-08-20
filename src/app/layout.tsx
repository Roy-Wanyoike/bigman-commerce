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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Bigman Computers | Technology that works for you",
    description: "Your trusted technology partner in Nairobi. Laptops, gaming, parts, accessories and more.",
    siteName: "Bigman Computers",
    type: "website",
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
