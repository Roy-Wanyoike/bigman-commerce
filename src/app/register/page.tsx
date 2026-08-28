import { RegisterForm } from './RegisterForm'
import Header from '@/components/bigman/Header'
import { BigmanFooter, MobileBottomNav } from '@/components/bigman/Sections'

export const metadata = {
  title: 'Create Account | Bigman Computers',
  description: 'Create a new Bigman Computers account.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={[]} />
      <main className="flex-1 flex items-center justify-center py-10 md:py-14">
        <div className="container-main w-full flex justify-center">
          <RegisterForm />
        </div>
      </main>
      <BigmanFooter categories={[]} />
      <MobileBottomNav />
      <div className="lg:hidden h-14" />
    </div>
  )
}
