export { useSession, signIn, signOut } from 'next-auth/react'

import { useSession, signIn, signOut } from 'next-auth/react'

export function useAuth() {
  const session = useSession()

  return {
    ...session,
    user: session.data?.user,
    isLoggedIn: !!session.data?.user,
    isLoading: session.status === 'loading',
    isAdmin: session.data?.user?.role === 'ADMIN' || session.data?.user?.role === 'SUPER_ADMIN',
    isStaff: ['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.data?.user?.role || ''),
    role: session.data?.user?.role || 'CUSTOMER',
    signIn,
    signOut,
  }
}
