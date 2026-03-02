'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LeadsList } from './components/leads-list';
import { CreateLead } from './components/create-lead';
import { EditLead } from './components/edit-lead';

type LeadsView = 'list' | 'create' | 'edit';

export default function Leads() {
  const t = useTranslations('sales.leads');
  const [currentView, setCurrentView] = useState<LeadsView>('list');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const handleEditLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('edit');
  };

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <LeadsList onCreateLead={() => setCurrentView('create')} onEditLead={handleEditLead} />;
      case 'create':
        return <CreateLead onBack={() => setCurrentView('list')} />;
      case 'edit':
        return <EditLead leadId={selectedLeadId as string} onBack={() => setCurrentView('list')} />;
      default:
        return <LeadsList onCreateLead={() => setCurrentView('create')} onEditLead={handleEditLead} />;
    }
  };

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
  );
}
