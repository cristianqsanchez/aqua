'use client'

import { AccountForm } from './account-form'
import type { AccountDetails } from '../actions'

interface EditAccountProps {
  locale: string
  account: AccountDetails
  onBack: () => void
}

export function EditAccount({ locale, account, onBack }: EditAccountProps) {
  return <AccountForm locale={locale} mode="edit" account={account} onBack={onBack} />
}
