'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  MoreVertical,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FiltersPopover } from '@/components/ui/filters-popover';

interface Lead {
  id: string;
  lead_number: string;
  tenant_id: string;
  customer_type: 'individual' | 'company';
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  source?: string | null;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;

  mobile?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  interest?: string | null;
  estimated_value?: number | null;
  estimated_close_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  notes?: string | null;
  tags?: string[] | null;
  assigned_to?: string | null;
  created_by?: string | null;

  created_at: string;
  updated_at?: string | null;
}

interface LeadsListProps {
  onCreateLead: () => void;
  onEditLead: (id: string) => void;

}


const TENANT_ID = '10d50f3f-b1b6-4230-b229-37bec3e39ada';


export function LeadsList({ onCreateLead, onEditLead }: LeadsListProps) {
  const t = useTranslations('leads.list');
  const tc = useTranslations('common');


  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'all',
    priority: 'all',
    customer_type: 'all',
  });

  const filterOptions = useMemo(
    () => [
      {
        id: 'status',

        label: tc('status'),
        options: [

          { value: 'new', label: t('status.new') },
          { value: 'contacted', label: t('status.contacted') },
          { value: 'qualified', label: t('status.qualified') },
          { value: 'unqualified', label: t('status.unqualified') },

        ],
      },
      {
        id: 'priority',
        label: t('filters.priority'),
        options: [

          { value: 'high', label: t('priority.high') },

          { value: 'medium', label: t('priority.medium') },
          { value: 'low', label: t('priority.low') },
        ],
      },
      {
        id: 'customer_type',
        label: t('filters.customerType'),
        options: [
          { value: 'individual', label: t('customerType.individual') },
          { value: 'company', label: t('customerType.company') },
        ],
      },
    ],
    [t, tc]
  );

  useEffect(() => {

    let active = true;

    const load = async () => {
      const supabase = createClient();


      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('leads')
          .select(
            [
              'id',
              'lead_number',
              'tenant_id',
              'customer_type',
              'status',
              'source',
              'company_name',
              'first_name',
              'last_name',
              'contact_name',

              'email',
              'phone',
              'mobile',
              'interest',

              'estimated_value',
              'estimated_close_date',
              'priority',
              'created_at',
              'updated_at',
            ].join(',')
          )
          .eq('tenant_id', TENANT_ID)
          .order('created_at', { ascending: false });


        if (error) throw error;

        if (!active) return;
        setLeads((data as Lead[]) || []);
      } catch (error) {
        console.error('Error loading leads:', error);
        toast.error(t('toasts.loadError'));
      } finally {

        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [t]);

  const handleDelete = async () => {
    if (!leadToDelete) return;

    const supabase = createClient();


    try {
      setDeleting(true);

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete)

        .eq('tenant_id', TENANT_ID);

      if (error) throw error;


      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete));
      toast.success(t('toasts.deleted'));

      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error(t('toasts.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterId]: value }));
  };


  const handleClearFilters = () => {
    setFilters({ status: 'all', priority: 'all', customer_type: 'all' });
  };

  const filteredLeads = useMemo(() => {
    let result = [...leads];


    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.company_name?.toLowerCase().includes(query) ||
          lead.first_name?.toLowerCase().includes(query) ||
          lead.last_name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query) ||
          lead.lead_number?.toLowerCase().includes(query)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter((lead) => lead.status === filters.status);
    }
    if (filters.priority !== 'all') {
      result = result.filter((lead) => lead.priority === filters.priority);
    }
    if (filters.customer_type !== 'all') {
      result = result.filter((lead) => lead.customer_type === filters.customer_type);

    }

    return result;
  }, [leads, searchQuery, filters]);

  const getStatusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' => {

    switch (status) {
      case 'new':

        return 'default';
      case 'contacted':
        return 'secondary';
      case 'qualified':

        return 'success';
      case 'unqualified':
        return 'destructive';
      default:
        return 'default';
    }

  };


  const getPriorityBadgeVariant = (priority: string): 'default' | 'warning' | 'destructive' => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';

      case 'low':
        return 'default';
      default:
        return 'default';
    }

  };


  const formatCurrency = (value?: number | null) => {
    if (!value) return t('values.empty');
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t('values.empty');
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getLeadName = (lead: Lead) => {
    if (lead.customer_type === 'company' && lead.company_name) return lead.company_name;
    if (lead.first_name || lead.last_name) return `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    return lead.contact_name || t('values.noName');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isFiltering = searchQuery.trim() || Object.values(filters).some((f) => f !== 'all');

  const totalEstimatedValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.placeholder')}
            className="pl-9 bg-input-background border-border focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <FiltersPopover
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          <Button onClick={onCreateLead} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />

            {t('actions.newLead')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card text-card-foreground rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">

              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.total')}</p>
              <p className="text-2xl font-semibold text-foreground">{leads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <User className="h-5 w-5 text-foreground" />

            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.qualified')}</p>

              <p className="text-2xl font-semibold text-foreground">{leads.filter((l) => l.status === 'qualified').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Calendar className="h-5 w-5 text-foreground" />
            </div>
            <div>

              <p className="text-sm text-muted-foreground">{t('stats.highPriority')}</p>
              <p className="text-2xl font-semibold text-foreground">{leads.filter((l) => l.priority === 'high').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">

              <DollarSign className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.estimatedValue')}</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalEstimatedValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg border border-border">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {isFiltering ? t('empty.filteredTitle') : t('empty.title')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isFiltering ? t('empty.filteredSubtitle') : t('empty.subtitle')}
            </p>
            {!isFiltering && (
              <Button onClick={onCreateLead} className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.createFirst')}
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.number')}</TableHead>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.priority')}</TableHead>

                <TableHead>{t('table.contact')}</TableHead>
                <TableHead>{t('table.estimatedValue')}</TableHead>
                <TableHead>{t('table.closeDate')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-accent/60">
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">{lead.lead_number}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.customer_type === 'company' ? (

                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{getLeadName(lead)}</p>
                        {lead.interest && <p className="text-xs text-muted-foreground">{lead.interest}</p>}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {lead.customer_type === 'company' ? t('customerType.company') : t('customerType.individual')}

                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(lead.status)}>
                      {t(`status.${lead.status}` as any)}
                    </Badge>

                  </TableCell>


                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(lead.priority)}>
                      {t(`priority.${lead.priority}` as any)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {lead.email && (

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium text-foreground">{formatCurrency(lead.estimated_value)}</span>
                  </TableCell>

                  <TableCell>

                    <span className="text-sm text-muted-foreground">{formatDate(lead.estimated_close_date)}</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditLead(lead.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(lead.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>

          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting ? t('actions.deleting') : t('actions.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
