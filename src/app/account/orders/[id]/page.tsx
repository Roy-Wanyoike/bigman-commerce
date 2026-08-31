import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/prices'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, Package, Truck, CreditCard, MapPin, Phone } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    select: { orderNumber: true },
  })
  return {
    title: order ? `Order ${order.orderNumber} | Bigman Computers` : 'Order | Bigman Computers',
  }
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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getServerSession()

  const order = await db.order.findUnique({
    where: { id },
    include: { orderItems: true },
  })

  if (!order) {
    notFound()
  }

  // If user is logged in, verify the order belongs to them
  if (session?.user?.id && order.userId && order.userId !== session.user.id) {
    redirect(`/login?callbackUrl=/account/orders/${id}`)
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        {/* Page Header */}
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/account">Account</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/account">Orders</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{order.orderNumber}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Order {order.orderNumber}</h1>
              <Badge variant="outline" className={`border text-xs ${statusColors[order.status] || ''}`}>
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Placed on {formattedDate}</p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container-main max-w-4xl space-y-8">
            {/* Order Info Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order Number</p>
                    <p className="text-sm font-semibold mt-0.5">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-0.5">
                      <Badge variant="outline" className={`border text-[10px] ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="mt-0.5">
                      <Badge variant="outline" className={`border text-[10px] ${statusColors[order.paymentStatus] || ''}`}>
                        {order.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <p className="text-xs text-muted-foreground">Tracking Number</p>
                    <p className="text-sm font-medium mt-0.5">{order.trackingNumber}</p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Delivered On</p>
                    <p className="text-sm font-medium mt-0.5">
                      {new Date(order.deliveredAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Order Items ({order.orderItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.orderItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.productSlug ? (
                              <Link href={`/products/${item.productSlug}`} className="text-sm font-medium text-accent hover:underline">
                                {item.productName}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium">{item.productName}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.brandName || '—'}</TableCell>
                          <TableCell>
                            {item.condition && (
                              <Badge variant="secondary" className="text-[10px] capitalize">{item.condition.replace('_', ' ')}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right text-sm">{formatPrice(item.unitPrice)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatPrice(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-border/60">
                  {order.orderItems.map(item => (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          {item.productSlug ? (
                            <Link href={`/products/${item.productSlug}`} className="text-sm font-medium text-accent hover:underline">
                              {item.productName}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium">{item.productName}</span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {item.brandName && <span className="text-xs text-muted-foreground">{item.brandName}</span>}
                            {item.condition && (
                              <Badge variant="secondary" className="text-[10px] capitalize">{item.condition.replace('_', ' ')}</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-semibold ml-4">{formatPrice(item.totalPrice)}</p>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatPrice(item.unitPrice)} × {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary + Delivery + Payment side by side on desktop */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pricing Summary */}
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                    Pricing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
                  </div>
                  {order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-emerald-600">-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  {order.taxAmount && order.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery & Payment Info */}
              <div className="space-y-8">
                {/* Delivery Info */}
                <Card className="border-border/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Truck className="h-5 w-5 text-accent" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium capitalize flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Courier Delivery'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className={`border text-[10px] ${statusColors[order.deliveryStatus] || ''}`}>
                        {order.deliveryStatus}
                      </Badge>
                    </div>
                    {order.deliveryMethod === 'courier' && (
                      <>
                        {order.deliveryCounty && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">County</span>
                            <span className="font-medium">{order.deliveryCounty}</span>
                          </div>
                        )}
                        {order.deliveryAddress && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Address</span>
                            <span className="font-medium text-right max-w-[60%]">{order.deliveryAddress}</span>
                          </div>
                        )}
                        {order.courierPhone && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Courier Phone</span>
                            <span className="font-medium flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              {order.courierPhone}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <Card className="border-border/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-accent" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">M-Pesa</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">M-Pesa Phone</span>
                      <span className="font-medium">{order.mpesaPhone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Status</span>
                      <Badge variant="outline" className={`border text-[10px] ${statusColors[order.paymentStatus] || ''}`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {order.notes && (
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Back to Account */}
            <div className="flex justify-center">
              <Link href="/account">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
