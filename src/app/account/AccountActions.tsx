'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function AccountActions() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      Sign out
    </Button>
  )
}
