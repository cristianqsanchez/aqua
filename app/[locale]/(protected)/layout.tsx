import { Header } from '@/components/layout/dashboard-header'
import { Sidebar } from '@/components/layout/dashboard-sidebar'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function ProtectedLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
