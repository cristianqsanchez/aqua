'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, Eye, TrendingUp, DollarSign, Target, Percent, Kanban } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FiltersPopover } from '@/components/ui/filters-popover';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { getOpportunities, deleteOpportunity, type Opportunity } from '../actions';

interface OpportunitiesListProps {
  onViewOpportunity: (id: string) => void;
  onEditOpportunity: (id: string) => void;
  onCreateOpportunity: () => void;
  onViewPipeline: () => void;
}

export function OpportunitiesList({
  onViewOpportunity,
  onEditOpportunity,
  onCreateOpportunity,
  onViewPipeline
}: OpportunitiesListProps) {
  const t = useTranslations();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    stage: 'all',
    probability: 'all',
  });

  const filterOptions = [
    {
      id: 'stage',
      label: 'Etapa',
      options: [
        { value: 'prospecting', label: 'Prospección' },
        { value: 'qualification', label: 'Cualificación' },
        { value: 'proposal', label: 'Propuesta' },
        { value: 'negotiation', label: 'Negociación' },
        { value: 'closed_won', label: 'Ganado' },
        { value: 'closed_lost', label: 'Perdido' },
      ],
    },
    {
      id: 'probability',
      label: 'Probabilidad',
      options: [
        { value: 'low', label: 'Baja (<30%)' },
        { value: 'medium', label: 'Media (30-70%)' },
        { value: 'high', label: 'Alta (>70%)' },
      ],
    },
  ];

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await getOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error('Error loading opportunities:', error);
        toast.error('Error al cargar las oportunidades');
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  const handleDelete = async () => {
    if (!opportunityToDelete) return;

    startTransition(async () => {
      const result = await deleteOpportunity(opportunityToDelete);
      
      if (result.success) {
        setOpportunities(prevOpps => prevOpps.filter(opp => opp.id !== opportunityToDelete));
        toast.success('Oportunidad eliminada correctamente');
      } else {
        toast.error(result.error || 'Error al eliminar oportunidad');
      }
      
      setDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    });
  };

  const openDeleteDialog = (id: string) => {
    setOpportunityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterId]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ stage: 'all', probability: 'all' });
  };

  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (opp) =>
          opp.opportunity_name?.toLowerCase().includes(query) ||
          opp.opportunity_number?.toLowerCase().includes(query) ||
          opp.account?.account_name?.toLowerCase().includes(query) ||
          opp.description?.toLowerCase().includes(query)
      );
    }

    if (filters.stage !== 'all') {
      result = result.filter((opp) => opp.stage === filters.stage);
    }

    if (filters.probability !== 'all') {
      result = result.filter((opp) => {
        const prob = opp.probability || 0;
        if (filters.probability === 'low') return prob < 30;
        if (filters.probability === 'medium') return prob >= 30 && prob <= 70;
        if (filters.probability === 'high') return prob > 70;
        return true;
      });
    }

    return result;
  }, [opportunities, searchQuery, filters]);

  const getStageBadgeVariant = (stage: string): 'default' | 'secondary' | 'destructive' => {
    switch (stage) {
      case 'prospecting':
        return 'default';
      case 'qualification':
        return 'secondary';
      case 'proposal':
      case 'negotiation':
        return 'secondary';
      case 'closed_won':
        return 'default';
      case 'closed_lost':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'Prospección';
      case 'qualification': return 'Cualificación';
      case 'proposal': return 'Propuesta';
      case 'negotiation': return 'Negociación';
      case 'closed_won': return 'Ganado';
      case 'closed_lost': return 'Perdido';
      default: return stage;
    }
  };

  const formatCurrency = (value?: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalAmount = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const weightedAmount = opportunities.reduce((sum, opp) => {
    const amount = opp.amount || 0;
    const probability = (opp.probability || 0) / 100;
    return sum + (amount * probability);
  }, 0);

  const openOpportunities = opportunities.filter(opp =>
    !['closed_won', 'closed_lost'].includes(opp.stage)
  ).length;

  const wonOpportunities = opportunities.filter(opp => opp.stage === 'closed_won').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar oportunidades por nombre, cuenta, número..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onViewPipeline}
            className="border-slate-300 hover:bg-slate-50"
          >
            <Kanban className="h-4 w-4 mr-2" />
            Vista Pipeline
          </Button>
          <FiltersPopover
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearFilters}
          />
          <Button onClick={onCreateOpportunity} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Oportunidad
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Target className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Oportunidades Abiertas</p>
              <p className="text-2xl font-semibold text-slate-900">{openOpportunities}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ganadas</p>
              <p className="text-2xl font-semibold text-slate-900">{wonOpportunities}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Monto Total</p>
              <p className="text-2xl font-semibold text-slate-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Percent className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Valor Ponderado</p>
              <p className="text-2xl font-semibold text-slate-900">
                {formatCurrency(weightedAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        {filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Target className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery || Object.values(filters).some(f => f !== 'all')
                ? 'No se encontraron oportunidades'
                : 'No hay oportunidades todavía'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || Object.values(filters).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros o búsqueda'
                : 'Comienza creando tu primera oportunidad'}
            </p>

            {!searchQuery && !Object.values(filters).some(f => f !== 'all') && (
              <Button onClick={onCreateOpportunity} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear Oportunidad
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Probabilidad</TableHead>
                <TableHead>Fecha Cierre</TableHead>
                <TableHead>Próximo Paso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opp) => (
                <TableRow key={opp.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    <span className="font-mono text-sm text-slate-600">{opp.opportunity_number}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{opp.opportunity_name}</p>
                      {opp.description && (
                        <p className="text-xs text-slate-500 truncate max-w-xs">{opp.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {opp.account ? (
                      <div>
                        <p className="text-sm text-slate-900">{opp.account.account_name}</p>
                        <p className="text-xs text-slate-500">{opp.account.account_number}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStageBadgeVariant(opp.stage)}>
                      {getStageLabel(opp.stage)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(opp.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[60px]">
                        <div
                          className="bg-cyan-600 h-2 rounded-full"
                          style={{ width: `${opp.probability || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{opp.probability || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {formatDate(opp.expected_close_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {opp.next_step ? (
                      <span className="text-sm text-slate-600 truncate block max-w-xs">
                        {opp.next_step}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewOpportunity(opp.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditOpportunity(opp.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(opp.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
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
            <AlertDialogTitle>¿Eliminar oportunidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La oportunidad será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
