import { Sidebar } from '@/components/layout/dashboard-sidebar'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function ProtectedLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
