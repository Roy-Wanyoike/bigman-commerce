'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Package,
  Eye,
  FolderTree,
  Menu,
  ChevronLeft,
  Upload,
  ClipboardList,
  MessageSquare,
  Tag,
  Users,
  Wrench,
  Search,
  Bell,
  Mail,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/products/import', label: 'Import CSV', icon: Upload },
  { href: '/admin/observations', label: 'Observations', icon: Eye },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/alerts', label: 'Alerts', icon: Bell },
  { href: '/admin/contact', label: 'Contact', icon: Mail },
  { href: '/admin/quotes', label: 'B2B Quotes', icon: FileText },
  { href: '/admin/synonyms', label: 'Synonyms', icon: Search },
]

function SidebarNav({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : item.href === '/admin/products'
              ? pathname === '/admin/products' || pathname.startsWith('/admin/products/')
              : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top header - mobile */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-[#0f172a] px-4 text-white lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[#0f172a] border-slate-700">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-14 items-center gap-2 border-b border-slate-700 px-4">
              <Package className="size-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">Bigman Admin</span>
            </div>
            <SidebarNav onClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Package className="size-5 text-emerald-400" />
          <span className="text-sm font-bold">Bigman Admin</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0f172a]">
          <div className="flex h-14 items-center gap-2 border-b border-slate-700 px-4">
            <Package className="size-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">Bigman Admin</span>
          </div>
          <SidebarNav />
          <div className="mt-auto p-4 border-t border-slate-700">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="size-3" />
              Back to Store
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="container-main p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
