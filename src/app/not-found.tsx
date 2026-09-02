import Link from 'next/link'
import { PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container-main flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
      <PackageOpen className="h-20 w-20 text-muted-foreground mb-6" />
      <h1 className="text-6xl font-bold tracking-tight mb-2">404</h1>
      <p className="text-xl font-medium text-muted-foreground mb-4">Page Not Found</p>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    </div>
  )
}