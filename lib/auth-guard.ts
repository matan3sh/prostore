import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await auth()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== 'admin') {
    redirect('/unauthorized')
  }

  return session
}
