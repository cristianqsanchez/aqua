'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { OpportunitiesList } from './components/opportunities-list';
import { CreateOpportunity } from './components/create-opportunity';
import { EditOpportunity } from './components/edit-opportunity';

type OpportunitiesView = 'list' | 'create' | 'edit';

export default function Opportunities() {
  const t = useTranslations();
  const [currentView, setCurrentView] = useState<OpportunitiesView>('list');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const handleEditOpportunity = (id: string) => {
    setSelectedOpportunityId(id);
    setCurrentView('edit');
  };

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <OpportunitiesList
            onViewOpportunity={() => {}}
            onEditOpportunity={handleEditOpportunity}
            onCreateOpportunity={() => setCurrentView('create')}
            onViewPipeline={() => {}}
          />
        );
      case 'create':
        return <CreateOpportunity onBack={() => setCurrentView('list')} />;
      case 'edit':
        return <EditOpportunity opportunityId={selectedOpportunityId!} onBack={() => setCurrentView('list')} />;
      default:
        return (
          <OpportunitiesList
            onViewOpportunity={() => {}}
            onEditOpportunity={handleEditOpportunity}
            onCreateOpportunity={() => setCurrentView('create')}
            onViewPipeline={() => {}}
          />
        );
    }
  };

  const title =
    (t.raw('sales.opportunities') as string | undefined) ||
    (t.raw('sales.opportunitiesTitle') as string | undefined) ||
    'Oportunidades';

  const subtitle =
    (t.raw('sales.subtitle') as string | undefined) ||
    (t.raw('sales.opportunitiesSubtitle') as string | undefined) ||
    'Gestión del pipeline de ventas';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {renderView()}
    </div>
  );
}
