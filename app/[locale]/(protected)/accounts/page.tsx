import { setRequestLocale } from 'next-intl/server'
import { AccountsClient } from './accounts-client'
import { getAccount, getAccounts } from './actions'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ view?: string; id?: string }>
}

export default async function AccountsPage({ params, searchParams }: Props) {
  const [{ locale }, { view, id }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)

  const accountId = typeof id === 'string' ? id : null
  const currentView = view === 'create' || view === 'edit' ? view : 'list'

  const [accounts, selectedAccount] = await Promise.all([
    getAccounts(),
    currentView === 'edit' && accountId ? getAccount(accountId) : Promise.resolve(null),
  ])

  const safeView = currentView === 'edit' && !selectedAccount ? 'list' : currentView

  return (
    <AccountsClient
      locale={locale}
      initialAccounts={accounts}
      initialView={safeView}
      selectedAccount={safeView === 'edit' ? selectedAccount : null}
    />
  )
}
