import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'My Account | Bigman Computers',
  description: 'Sign in to your Bigman Computers account to view orders, manage addresses, and track purchases.',
}

export default async function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1">
        <section className="py-10 md:py-14 border-b border-border/60">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">My Account</h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Sign in to your account to view orders, manage addresses, and track purchases.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container-main max-w-3xl">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <h2 className="text-lg font-semibold text-foreground">Sign in to your account</h2>
              <p>Account sign-in is coming soon. Once available, you will be able to view your order history, track shipments, save delivery addresses, and manage your profile — all from this page.</p>
              <p>In the meantime, if you need help with an existing order or have any questions, please contact us at <a href="mailto:info@bigmancomputers.co.ke" className="text-primary underline">info@bigmancomputers.co.ke</a> or visit our store at Rahimtulla Trust Building, Moi Avenue, Nairobi.</p>
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
