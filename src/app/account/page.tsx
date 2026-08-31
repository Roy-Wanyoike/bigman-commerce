import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Shield, Package } from 'lucide-react'
import { AccountActions } from './AccountActions'
import ProfileEditor from './ProfileEditor'

export const metadata = {
  title: 'My Account | Bigman Computers',
  description: 'Manage your Bigman Computers account, view orders, and track purchases.',
}

export default async function AccountPage() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      county: true,
      address: true,
      createdAt: true,
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          orderItems: { select: { productName: true, quantity: true } },
        },
      },
    },
  })

  if (!user) {
    redirect('/login?callbackUrl=/account')
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        {/* Account Header */}
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">My Account</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Manage your profile, view order history, and track your purchases.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container-main max-w-4xl space-y-8">
            {/* Profile Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-accent" />
                    Profile Information
                  </CardTitle>
                  <Badge variant="outline" className="text-xs capitalize">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ProfileEditor user={{ name: user.name, email: user.email, phone: user.phone, county: user.county, address: user.address }} />

                <div className="mt-6 pt-6 border-t border-border/60">
                  <AccountActions />
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.orders.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
                    <Link href="/shop">
                      <Button variant="outline" size="sm">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-secondary/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/account/orders/${order.id}`} className="text-sm font-semibold text-accent hover:underline">{order.orderNumber}</Link>
                            <Badge variant="outline" className={`text-[10px] border ${statusColors[order.status] || ''}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.orderItems.map(i => i.productName).join(', ') || 'No items'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.createdAt.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-bold">
                            {order.currency === 'KES' ? 'KSh ' : order.currency + ' '}
                            {order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
