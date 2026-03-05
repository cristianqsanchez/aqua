'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, FileText, History, Image, Package, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

import { getWorkOrderDetail, setWorkOrderChecklistItem } from '../detail-actions';

interface WorkOrderDetailProps {
  workOrderId: string;
  onBack: () => void;
}

type WorkOrderStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'canceled';

type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

type ChecklistItem = {
  id: string;
  item: string;
  completed: boolean;
  required?: boolean;
  done_at?: string | null;
};

type WorkOrderFile = {
  id: string;
  file_type: string;
  note?: string | null;
  uploaded_at: string;
  url?: string | null;
};

type MaterialRequest = {
  id: string;
  material_name: string;
  qty_requested: number;
  qty_fulfilled: number;
  status: string;
};

type MaterialConsumption = {
  id: string;
  material_name: string;
  qty: number;
  consumed_at: string;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  created_at: string;
  created_by: string | null;
  payload: any;
};

type WorkOrderDetailModel = {
  id: string;
  codigo: string;
  title: string;
  project_id: string;
  project_name: string | null;
  type_name: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;

  assigned_to: string | null;

  planned_start_at: string | null;
  planned_end_at: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;

  description: string | null;
  technical_notes: string | null;


  location_snapshot: { address?: string | null; notes?: string | null } | null;
  blocked_note: string | null;

  checklist: ChecklistItem[];
  checklist_total: number;
  checklist_completed: number;

  files: WorkOrderFile[];
  material_requests: MaterialRequest[];
  material_consumptions: MaterialConsumption[];
  timeline: TimelineEvent[];
};

export function WorkOrderDetail({ workOrderId, onBack }: WorkOrderDetailProps) {
  const t = useTranslations('workOrders');

  const [workOrder, setWorkOrder] = useState<WorkOrderDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingChecklist, setSavingChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const res = await getWorkOrderDetail(workOrderId);

      if (cancelled) return;

      if (!res.ok) {
        setWorkOrder(null);
        setLoading(false);
        toast.error(res.error);
        onBack();
        return;
      }

      setWorkOrder(res.data);
      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [workOrderId, onBack]);

  const getStatusVariant = (
    status: WorkOrderStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'blocked':
      case 'canceled':
        return 'destructive';
      case 'done':
        return 'outline';
      case 'open':
      case 'assigned':
      case 'in_progress':
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: WorkOrderStatus) => {
    switch (status) {
      case 'draft':
        return t('status.draft');
      case 'open':
        return t('status.open');
      case 'assigned':
        return t('status.assigned');
      case 'in_progress':
        return t('status.inProgress');
      case 'blocked':
        return t('status.blocked');
      case 'done':
        return t('status.done');
      case 'canceled':
        return t('status.canceled');
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'urgent':

        return t('priority.urgent');
      case 'high':
        return t('priority.high');
      case 'normal':
        return t('priority.normal');
      case 'low':
        return t('priority.low');
      default:
        return t('priority.normal');
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  const checklistStats = useMemo(() => {
    if (!workOrder) return { total: 0, completed: 0 };
    return {
      total: workOrder.checklist_total ?? workOrder.checklist.length ?? 0,
      completed: workOrder.checklist_completed ?? workOrder.checklist.filter((x) => x.completed).length,
    };
  }, [workOrder]);

  const handleChecklistToggle = async (itemId: string, checked: boolean) => {
    if (!workOrder) return;

    // optimistic
    setWorkOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checklist: prev.checklist.map((it) =>
          it.id === itemId ? { ...it, completed: checked, done_at: checked ? new Date().toISOString() : null } : it
        ),
      };
    });

    setSavingChecklist((prev) => ({ ...prev, [itemId]: true }));

    const res = await setWorkOrderChecklistItem({
      work_order_id: workOrder.id,
      item_id: itemId,
      completed: checked,
    });

    setSavingChecklist((prev) => ({ ...prev, [itemId]: false }));

    if (!res.ok) {
      // revert
      setWorkOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checklist: prev.checklist.map((it) =>
            it.id === itemId ? { ...it, completed: !checked, done_at: !checked ? new Date().toISOString() : null } : it
          ),
        };
      });
      toast.error(res.error);
      return;
    }

    toast.success(checked ? t('toasts.checklistCompleted') : t('toasts.checklistPending'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-muted-foreground">{t('common.noData')}</p>
        <Button onClick={onBack}>{t('common.back')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={onBack} aria-label={t('common.back')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{workOrder.title}</h1>
              <Badge variant={getStatusVariant(workOrder.status)}>{getStatusLabel(workOrder.status)}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{workOrder.codigo}</span>
              <span aria-hidden="true">•</span>
              <span>
                {t('fields.project')}: {workOrder.project_name ?? '-'}
              </span>
              <span aria-hidden="true">•</span>
              <span>
                {t('fields.type')}: {workOrder.type_name}
              </span>
            </div>
          </div>
        </div>

        {/* Actions placeholder (status transitions require schema support; handled via timeline/RPC later) */}
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled title={t('common.comingSoon')}>
            {t('common.actions')}
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('fields.type')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{workOrder.type_name}</Badge>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('fields.priority')}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium text-foreground">{getPriorityLabel(workOrder.priority)}</span>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('fields.assignedTo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{workOrder.assigned_to || t('common.unassigned')}</span>
            </div>
          </CardContent>
        </Card>


        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('sections.checklist')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-foreground">

                {checklistStats.completed} / {checklistStats.total}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">{t('sections.dates')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="mb-1 text-sm text-muted-foreground">{t('fields.plannedStart')}</div>
              <div className="font-medium text-foreground">{formatShortDate(workOrder.planned_start_at)}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-muted-foreground">{t('fields.plannedEnd')}</div>
              <div className="font-medium text-foreground">{formatShortDate(workOrder.planned_end_at)}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-muted-foreground">{t('fields.actualStart')}</div>
              <div className="font-medium text-foreground">{formatShortDate(workOrder.actual_start_at)}</div>
            </div>

            <div>
              <div className="mb-1 text-sm text-muted-foreground">{t('fields.actualEnd')}</div>
              <div className="font-medium text-foreground">{formatShortDate(workOrder.actual_end_at)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="checklist">{t('tabs.checklist')}</TabsTrigger>
          <TabsTrigger value="files">{t('tabs.files')}</TabsTrigger>
          <TabsTrigger value="materials">{t('tabs.materials')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('tabs.timeline')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>

              <CardTitle className="text-base text-card-foreground">{t('fields.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground">
                {workOrder.description || t('common.noDescription')}
              </p>
            </CardContent>
          </Card>

          {workOrder.location_snapshot && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground">{t('sections.location')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{workOrder.location_snapshot.address || '-'}</p>

                {workOrder.location_snapshot.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{workOrder.location_snapshot.notes}</p>
                )}

              </CardContent>
            </Card>
          )}


          {workOrder.status === 'blocked' && workOrder.blocked_note && (
            <Card className="border-destructive/30 bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {t('status.blocked')}
                </CardTitle>

              </CardHeader>
              <CardContent>
                <p className="text-destructive">{workOrder.blocked_note}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">{t('sections.checklist')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workOrder.checklist.length > 0 ? (
                  workOrder.checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg bg-muted p-3">
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={(checked) => handleChecklistToggle(item.id, checked as boolean)}
                        disabled={!!savingChecklist[item.id]}
                      />
                      <label
                        htmlFor={item.id}
                        className={[
                          'flex-1 cursor-pointer',
                          item.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                        ].join(' ')}
                      >
                        {item.item}
                        {item.required && (

                          <span className="ml-1 text-destructive" aria-hidden="true">
                            *
                          </span>
                        )}
                      </label>


                      {item.completed && item.done_at && (
                        <span className="text-xs text-muted-foreground">{formatDateTime(item.done_at)}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-muted-foreground">{t('common.noData')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base text-card-foreground">
                <span>{t('tabs.files')}</span>
                <Button size="sm" disabled title={t('common.comingSoon')}>
                  <Image className="mr-2 h-4 w-4" />
                  {t('common.upload')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">

                {workOrder.files.length > 0 ? (
                  workOrder.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 rounded-lg bg-muted p-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{file.file_type}</div>
                        {file.note && <div className="text-xs text-muted-foreground">{file.note}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(file.uploaded_at)}</div>
                      <Button
                        size="sm"

                        variant="ghost"
                        disabled={!file.url}
                        onClick={() => {
                          if (file.url) window.open(file.url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        {t('common.view')}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-muted-foreground">{t('common.noFiles')}</p>
                )}

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">{t('tabs.materials')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workOrder.material_requests.length > 0 ? (
                  workOrder.material_requests.map((req) => (

                    <div key={req.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{req.material_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {t('materials.requested')}: {req.qty_requested} | {t('materials.delivered')}:{' '}
                            {req.qty_fulfilled}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{req.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-muted-foreground">{t('common.noData')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">{t('materials.actualConsumptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workOrder.material_consumptions.length > 0 ? (
                  workOrder.material_consumptions.map((cons) => (
                    <div key={cons.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-warning" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{cons.material_name}</div>

                          <div className="text-xs text-muted-foreground">
                            {t('materials.quantity')}: {cons.qty} | {formatDateTime(cons.consumed_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-muted-foreground">{t('materials.noConsumptions')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
                <History className="h-4 w-4" />
                {t('tabs.timeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrder.timeline.length > 0 ? (
                  workOrder.timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < workOrder.timeline.length - 1 && (
                          <div className="my-1 h-full w-px bg-border" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{event.event_type}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</span>
                        </div>

                        {event.payload != null && (
                          <div className="text-sm text-muted-foreground">{JSON.stringify(event.payload)}</div>
                        )}

                        <div className="mt-1 text-xs text-muted-foreground">
                          {t('timeline.by')}: {event.created_by ?? '-'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-muted-foreground">{t('timeline.noEvents')}</p>
                )}

              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
