'use client';

import { useState } from 'react';
import { Plus, ArrowLeft, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { WorkOrdersList } from './components/work-orders-list';
import { WorkOrderDetail } from './components/work-order-detail';
import { CreateWorkOrder } from './components/create-work-order';
import { WorkOrdersKanban } from './components/work-orders-kanban';

type WorkOrdersView = 'list' | 'detail' | 'create' | 'kanban';

export default function WorkOrdersPage() {

  const tNav = useTranslations('nav');
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tWorkOrders = useTranslations('workOrders');

  const [currentView, setCurrentView] = useState<WorkOrdersView>('list');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  const handleViewWorkOrder = (id: string) => {
    setSelectedWorkOrderId(id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');

    setSelectedWorkOrderId(null);
  };

  const handleCreateWorkOrder = () => {
    setCurrentView('create');
  };

  return (
    <div className="p-6 bg-background text-foreground">
      {currentView === 'list' && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {tNav('workOrders')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tDashboard('workOrdersTitle')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentView('kanban')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                {tCommon('view')} Kanban
              </Button>

              <Button className="gap-2" onClick={handleCreateWorkOrder}>
                <Plus className="w-4 h-4" />
                {tCommon('create')}
              </Button>
            </div>
          </div>

          <WorkOrdersList

            onViewWorkOrder={handleViewWorkOrder}
            onCreateWorkOrder={handleCreateWorkOrder}
          />
        </>
      )}

      {currentView === 'detail' && selectedWorkOrderId && (
        <WorkOrderDetail
          workOrderId={selectedWorkOrderId}
          onBack={handleBackToList}
        />
      )}

      {currentView === 'create' && (
        <CreateWorkOrder onBack={handleBackToList} />
      )}

      {currentView === 'kanban' && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToList}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {tCommon('back')}
              </Button>

              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Kanban - {tNav('workOrders')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {tWorkOrders('kanbanDescription')}
                </p>
              </div>
            </div>

            <Button className="gap-2" onClick={handleCreateWorkOrder}>
              <Plus className="w-4 h-4" />
              {tCommon('create')}
            </Button>
          </div>

          <WorkOrdersKanban onViewWorkOrder={handleViewWorkOrder} />

        </>

      )}
    </div>
  );
}
