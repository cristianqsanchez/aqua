'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,

  TableRow,

} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getWorkOrders } from '../actions';

type WorkOrderStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'canceled';

type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

type WorkOrderListItem = {
  id: string;
  codigo: string;
  title: string;
  project_id: string;
  project_name: string | null;
  type_name: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assigned_to: string | null;
  planned_date: string | null;
  execution_date: string | null;
  created_at: string;
};

interface WorkOrdersListProps {
  onViewWorkOrder: (id: string) => void;
  onCreateWorkOrder?: () => void;
}


export function WorkOrdersList({ onViewWorkOrder, onCreateWorkOrder }: WorkOrdersListProps) {
  const t = useTranslations('workOrders');

  const [workOrders, setWorkOrders] = useState<WorkOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkOrderStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | WorkOrderPriority>('all');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const res = await getWorkOrders({
        status: statusFilter === 'all' ? null : statusFilter,
        priority: priorityFilter === 'all' ? null : priorityFilter,
        limit: 500,
      });

      if (cancelled) return;

      if (!res.ok) {
        setWorkOrders([]);
        setLoading(false);
        toast.error(res.error);
        return;
      }

      setWorkOrders(res.data);
      setLoading(false);
    };

    run();


    return () => {
      cancelled = true;
    };

  }, [statusFilter, priorityFilter]);

  const filteredWorkOrders = useMemo(() => {
    let result = [...workOrders];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((wo) => {
        const haystack = [
          wo.title ?? '',
          wo.codigo ?? '',
          wo.project_name ?? '',

          wo.assigned_to ?? '',
          wo.type_name ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return result;
  }, [workOrders, searchQuery]);

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

  const getPriorityClassName = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'urgent':
        return 'border-destructive/20 bg-destructive/10 text-destructive';
      case 'high':
        return 'border-warning/20 bg-warning/10 text-warning';
      case 'normal':
        return 'border-primary/20 bg-primary/10 text-primary';
      case 'low':
      default:
        return 'border-border bg-muted text-muted-foreground';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',

      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );

  }

  return (

    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="open">{t('status.open')}</SelectItem>
            <SelectItem value="assigned">{t('status.assigned')}</SelectItem>
            <SelectItem value="in_progress">{t('status.inProgress')}</SelectItem>
            <SelectItem value="blocked">{t('status.blocked')}</SelectItem>
            <SelectItem value="done">{t('status.done')}</SelectItem>
            <SelectItem value="canceled">{t('status.canceled')}</SelectItem>

          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t('common.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
            <SelectItem value="high">{t('priority.high')}</SelectItem>
            <SelectItem value="normal">{t('priority.normal')}</SelectItem>
            <SelectItem value="low">{t('priority.low')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
        <div className="text-sm text-muted-foreground">
          {filteredWorkOrders.length} / {workOrders.length}
        </div>
      )}

      {filteredWorkOrders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="mb-4 text-muted-foreground">{t('common.noResults')}</p>
          <Button onClick={onCreateWorkOrder}>{t('common.create')}</Button>
        </div>

      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.code')}</TableHead>

                <TableHead>{t('fields.title')}</TableHead>
                <TableHead>{t('fields.project')}</TableHead>
                <TableHead>{t('fields.type')}</TableHead>
                <TableHead>{t('fields.status')}</TableHead>
                <TableHead>{t('fields.priority')}</TableHead>
                <TableHead>{t('fields.assignedTo')}</TableHead>
                <TableHead>{t('fields.plannedDate')}</TableHead>
                <TableHead>{t('fields.actualDate')}</TableHead>

                <TableHead className="text-right">{t('fields.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((wo) => (
                <TableRow
                  key={wo.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onViewWorkOrder(wo.id)}
                >
                  <TableCell className="font-mono text-sm">{wo.codigo}</TableCell>
                  <TableCell className="font-medium">{wo.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wo.project_name ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {wo.type_name}
                    </Badge>
                  </TableCell>
                  <TableCell>

                    <Badge variant={getStatusVariant(wo.status)}>{getStatusLabel(wo.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityClassName(wo.priority)}`}
                    >
                      {getPriorityLabel(wo.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{wo.assigned_to || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(wo.planned_date)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(wo.execution_date)}
                  </TableCell>
                  <TableCell className="text-right">

                    <Button

                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();

                        onViewWorkOrder(wo.id);
                      }}
                    >
                      {t('common.view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
