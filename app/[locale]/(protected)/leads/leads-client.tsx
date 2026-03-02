'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { LeadsList } from './components/leads-list'
import { CreateLead } from './components/create-lead'
import { EditLead } from './components/edit-lead'
import type { Lead } from './actions'

type LeadsView = 'list' | 'create' | 'edit'

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const t = useTranslations('leads')
  const [currentView, setCurrentView] = useState<LeadsView>('list')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  const handleEditLead = (id: string) => {
    setSelectedLeadId(id)
    setCurrentView('edit')
  }

  const handleLeadCreated = () => {
    setCurrentView('list')
  }

  const handleLeadUpdated = () => {
    setCurrentView('list')
  }

  const handleLeadDeleted = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <LeadsList
            leads={leads}
            onCreateLead={() => setCurrentView('create')}
            onEditLead={handleEditLead}
            onLeadDeleted={handleLeadDeleted}
          />
        )
      case 'create':
        return <CreateLead onBack={() => setCurrentView('list')} onSuccess={handleLeadCreated} />
      case 'edit':
        return (
          <EditLead
            leadId={selectedLeadId as string}
            onBack={() => setCurrentView('list')}
            onSuccess={handleLeadUpdated}
          />
        )
      default:
        return (
          <LeadsList
            leads={leads}
            onCreateLead={() => setCurrentView('create')}
            onEditLead={handleEditLead}
            onLeadDeleted={handleLeadDeleted}
          />
        )
    }
  }

  return (
    <div className="p-6">
      {currentView === 'list' && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
      )}

      {renderView()}
    </div>
  )
}
