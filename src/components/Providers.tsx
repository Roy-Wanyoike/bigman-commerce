'use client'

import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [SessionProvider, setSessionProvider] = useState<React.ComponentType<{ children: React.ReactNode }>>()

  useEffect(() => {
    // Dynamic import to avoid React 19 prerendering issues with next-auth v4
    import('next-auth/react').then(mod => {
      setSessionProvider(() => mod.SessionProvider)
    })
  }, [])

  if (!SessionProvider) {
    return <>{children}</>
  }

  return <SessionProvider>{children}</SessionProvider>
}
