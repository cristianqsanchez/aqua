'use client'

import { AccountForm } from './account-form'

interface CreateAccountProps {
  locale: string
  onBack: () => void
}

export function CreateAccount({ locale, onBack }: CreateAccountProps) {
  return <AccountForm locale={locale} mode="create" onBack={onBack} />
}
