import { getLeads, type Lead } from './actions'
import { LeadsClient } from './leads-client'
import { setRequestLocale } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LeadsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const leads = await getLeads()

  return <LeadsClient initialLeads={leads} />
}
