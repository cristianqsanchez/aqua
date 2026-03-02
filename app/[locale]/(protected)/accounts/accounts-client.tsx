'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { AccountsList } from './components/accounts-list'
import { CreateAccount } from './components/create-account'
import { EditAccount } from './components/edit-account'
import type { AccountDetails, AccountListItem } from './actions'

type AccountsView = 'list' | 'create' | 'edit'

type AccountsClientProps = {
  locale: string
  initialAccounts: AccountListItem[]
  initialView: AccountsView
  selectedAccount: AccountDetails | null
}

export function AccountsClient({
  locale,
  initialAccounts,
  initialView,
  selectedAccount,
}: AccountsClientProps) {
  const t = useTranslations('accounts')
  const pathname = usePathname()
  const router = useRouter()

  const goToList = () => {
    router.push(pathname)
  }

  const goToCreate = () => {
    router.push(`${pathname}?view=create`)
  }

  const goToEdit = (id: string) => {
    router.push(`${pathname}?view=edit&id=${id}`)
  }

  const renderView = () => {
    switch (initialView) {
      case 'create':
        return <CreateAccount locale={locale} onBack={goToList} />
      case 'edit':
        return selectedAccount ? (
          <EditAccount locale={locale} account={selectedAccount} onBack={goToList} />
        ) : (
          <AccountsList
            locale={locale}
            initialAccounts={initialAccounts}
            onCreateAccount={goToCreate}
            onEditAccount={goToEdit}
          />
        )
      case 'list':
      default:
        return (
          <AccountsList
            locale={locale}
            initialAccounts={initialAccounts}
            onCreateAccount={goToCreate}
            onEditAccount={goToEdit}
          />
        )
    }
  }

  return (
    <div className="p-6">
      {initialView === 'list' && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      )}

      {renderView()}
    </div>
  )
}
