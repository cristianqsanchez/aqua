'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,

  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AlertTriangle, Calendar, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { getWorkOrders, setWorkOrderStatus } from '../actions';

interface WorkOrdersKanbanProps {
  onViewWorkOrder: (id: string) => void;
}

type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'blocked' | 'done';

type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

type WorkOrderKanbanItem = {
  id: string;
  codigo: string;
  title: string;
  project_name: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assigned_to: string | null;
  planned_date: string | null;
};

const COLUMNS: Array<{ id: WorkOrderStatus; labelKey: string }> = [
  { id: 'open', labelKey: 'kanban.columns.open' },
  { id: 'assigned', labelKey: 'kanban.columns.assigned' },
  { id: 'in_progress', labelKey: 'kanban.columns.inProgress' },
  { id: 'blocked', labelKey: 'kanban.columns.blocked' },
  { id: 'done', labelKey: 'kanban.columns.done' },
];

function formatShortDate(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function priorityCardClass(priority: WorkOrderPriority) {
  switch (priority) {
    case 'urgent':
      return 'border-l-4 border-l-destructive bg-destructive/10';
    case 'high':
      return 'border-l-4 border-l-warning bg-warning/10';
    case 'normal':
      return 'border-l-4 border-l-primary bg-primary/10';
    case 'low':

    default:
      return 'border-l-4 border-l-border bg-muted';
  }
}

function priorityBadgeClass(priority: WorkOrderPriority) {
  switch (priority) {
    case 'urgent':
      return 'border-destructive text-destructive';
    case 'high':
      return 'border-warning text-warning';
    case 'normal':
      return 'border-primary text-primary';

    case 'low':
    default:
      return 'border-border text-muted-foreground';
  }

}

interface WorkOrderCardProps {
  workOrder: WorkOrderKanbanItem;

  onClick: () => void;
  isDragging?: boolean;
}


function WorkOrderCard({ workOrder, onClick, isDragging = false }: WorkOrderCardProps) {
  const t = useTranslations('workOrders');

  return (

    <Card
      className={[
        'cursor-pointer transition-all hover:shadow-lg',
        priorityCardClass(workOrder.priority),
        isDragging ? 'opacity-50' : '',
      ].join(' ')}
      onClick={onClick}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-xs text-muted-foreground">{workOrder.codigo}</span>
          <Badge variant="outline" className={['text-xs', priorityBadgeClass(workOrder.priority)].join(' ')}>
            {t(`priority.${workOrder.priority}`)}
          </Badge>
        </div>

        <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{workOrder.title}</h4>

        <p className="line-clamp-1 text-xs text-muted-foreground">

          📂 {workOrder.project_name ?? '-'}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-2">

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {workOrder.assigned_to ? (
              <>
                <User className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{workOrder.assigned_to}</span>
              </>
            ) : (
              <span className="text-muted-foreground/70">{t('common.unassigned')}</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatShortDate(workOrder.planned_date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkOrdersKanban({ onViewWorkOrder }: WorkOrdersKanbanProps) {
  const t = useTranslations('workOrders');

  const [workOrders, setWorkOrders] = useState<WorkOrderKanbanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [savingMove, setSavingMove] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },

    })
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const res = await getWorkOrders({ limit: 1000 });
      if (cancelled) return;

      if (!res.ok) {
        setWorkOrders([]);
        setLoading(false);
        toast.error(res.error);
        return;
      }

      // Kanban only uses a subset of statuses
      const normalized = res.data
        .filter((x) => ['open', 'assigned', 'in_progress', 'blocked', 'done'].includes(x.status))
        .map((x) => ({
          id: x.id,
          codigo: x.codigo,
          title: x.title,
          project_name: x.project_name ?? null,
          status: x.status as WorkOrderStatus,

          priority: x.priority as WorkOrderPriority,
          assigned_to: x.assigned_to ?? null,

          planned_date: x.planned_date ?? null,
        }));

      setWorkOrders(normalized);
      setLoading(false);
    };

    run();


    return () => {
      cancelled = true;
    };
  }, []);

  const byStatus = useMemo(() => {
    const map: Record<WorkOrderStatus, WorkOrderKanbanItem[]> = {
      open: [],
      assigned: [],
      in_progress: [],
      blocked: [],
      done: [],

    };
    for (const wo of workOrders) map[wo.status].push(wo);
    return map;
  }, [workOrders]);

  const activeWorkOrder = useMemo(() => workOrders.find((wo) => wo.id === activeId) ?? null, [workOrders, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);

      return;
    }

    const workOrderId = active.id as string;
    const newStatus = over.id as WorkOrderStatus;


    const current = workOrders.find((x) => x.id === workOrderId);
    if (!current) {
      setActiveId(null);
      return;
    }

    if (current.status === newStatus) {
      setActiveId(null);
      return;
    }

    // optimistic
    setWorkOrders((prev) => prev.map((wo) => (wo.id === workOrderId ? { ...wo, status: newStatus } : wo)));

    setSavingMove(true);
    const res = await setWorkOrderStatus({ work_order_id: workOrderId, status: newStatus });
    setSavingMove(false);

    if (!res.ok) {
      // revert
      setWorkOrders((prev) => prev.map((wo) => (wo.id === workOrderId ? { ...wo, status: current.status } : wo)));
      toast.error(res.error);
      setActiveId(null);
      return;
    }

    toast.success(t('kanban.moved', { code: current.codigo, to: t(COLUMNS.find((c) => c.id === newStatus)!.labelKey) }));
    setActiveId(null);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>

    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {COLUMNS.map((col) => {
          const count = byStatus[col.id]?.length ?? 0;
          return (
            <Card key={col.id} className="bg-card">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <div className="text-sm text-muted-foreground">{t(col.labelKey)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              status={column.id}
              label={t(column.labelKey)}
              workOrders={byStatus[column.id] ?? []}
              onViewWorkOrder={onViewWorkOrder}
              disabled={savingMove}
            />
          ))}
        </div>

        <DragOverlay>
          {activeWorkOrder ? <WorkOrderCard workOrder={activeWorkOrder} onClick={() => {}} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface KanbanColumnProps {
  status: WorkOrderStatus;
  label: string;
  workOrders: WorkOrderKanbanItem[];
  onViewWorkOrder: (id: string) => void;
  disabled?: boolean;

}


function KanbanColumn({ status, label, workOrders, onViewWorkOrder, disabled }: KanbanColumnProps) {
  const t = useTranslations('workOrders');

  const { setNodeRef: setDroppableRef } = useDroppable({ id: status });

  const icon = (() => {
    switch (status) {
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'done':
        return <Clock className="h-4 w-4 text-success" />;

      case 'in_progress':
        return <Clock className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  })();

  return (
    <div className="shrink-0 w-80">
      <div className="rounded-t-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">

            {icon}
            <h3 className="font-semibold text-foreground">{label}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {workOrders.length}
          </Badge>
        </div>
      </div>

      <div
        ref={setDroppableRef}

        className="min-h-[500px] rounded-b-lg border border-border bg-muted p-3 space-y-3"
        aria-disabled={disabled}
      >
        {workOrders.map((workOrder) => (
          <DraggableWorkOrder key={workOrder.id} workOrder={workOrder} onViewWorkOrder={onViewWorkOrder} />
        ))}

        {workOrders.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t('kanban.empty')}
          </div>

        )}
      </div>
    </div>
  );
}

interface DraggableWorkOrderProps {
  workOrder: WorkOrderKanbanItem;
  onViewWorkOrder: (id: string) => void;
}

function DraggableWorkOrder({ workOrder, onViewWorkOrder }: DraggableWorkOrderProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: workOrder.id });

  return (

    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <WorkOrderCard workOrder={workOrder} onClick={() => onViewWorkOrder(workOrder.id)} isDragging={isDragging} />
    </div>
  );
}
