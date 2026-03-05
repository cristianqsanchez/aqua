import { Header } from '@/components/layout/dashboard-header'
import { Sidebar } from '@/components/layout/dashboard-sidebar'
import { UserProvider } from '@/components/providers/user-provider'
import { getUser } from '@/components/providers/user.actions'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default async function ProtectedLayout({ children }: Props) {
  const user = await getUser()

  return (
    <UserProvider initialUser={user}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  )
}
