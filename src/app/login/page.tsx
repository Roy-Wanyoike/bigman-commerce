import { Suspense } from 'react'
import { LoginForm } from './LoginForm'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Sign In | Bigman Computers',
  description: 'Sign in to your Bigman Computers account.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1 flex items-center justify-center py-10 md:py-14">
        <div className="container-main w-full flex justify-center">
          <Suspense fallback={
            <Card className="w-full max-w-md border-border/60 shadow-lg">
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            </Card>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}