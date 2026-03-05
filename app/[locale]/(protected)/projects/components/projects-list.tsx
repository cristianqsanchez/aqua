'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,

} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getProjectsList, updateProject } from '../actions';

interface ProjectsListProps {
  onViewProject: (id: string) => void;
  onCreateProject?: () => void;
  onOpenGantt?: (projectId: string) => void;
  onEditProject?: (projectId: string) => void;
}

interface FilterState {
  estado: string[];
  tipo: string[];
  prioridad: string[];
  enRiesgo: boolean;
  cliente: string;
  sucursal: string[];
}

type ProjectRow = {
  id: string;

  project_number: string;
  name: string;

  status: string | null;
  project_type: string | null;

  planned_end_date: string | null;
  progress_percent: number | null;


  budget: number | null;
  actual_cost: number | null;


  customer_name: string | null;

};

export function ProjectsList({ onViewProject, onCreateProject, onOpenGantt, onEditProject }: ProjectsListProps) {

  const t = useTranslations('projects');
  const tc = useTranslations('common');

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    estado: [],

    tipo: [],
    prioridad: [],
    enRiesgo: false,
    cliente: '',
    sucursal: [],
  });

  useEffect(() => {
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsList();
      setProjects(data);
    } catch (error) {


      console.error('Error loading projects:', error);
      toast.error(t('errors.load'));

    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.project_number?.toLowerCase().includes(q) ||
          p.customer_name?.toLowerCase().includes(q),
      );
    }


    if (filters.estado.length > 0) {
      result = result.filter((p) => (p.status ? filters.estado.includes(p.status) : false));
    }

    if (filters.tipo.length > 0) {
      result = result.filter((p) => (p.project_type ? filters.tipo.includes(p.project_type) : false));
    }

    if (filters.enRiesgo) {
      result = result.filter((p) => {
        const overdue = p.planned_end_date && new Date(p.planned_end_date) < new Date();
        const active = p.status === 'in_progress' || p.status === 'planning' || p.status === 'on_hold';
        return Boolean(overdue && active);

      });
    }

    if (filters.cliente.trim()) {
      const q = filters.cliente.toLowerCase();

      result = result.filter((p) => p.customer_name?.toLowerCase().includes(q));
    }

    return result;
  }, [projects, searchQuery, filters]);

  const kpis = useMemo(() => {

    const activos = projects.filter((p) => p.status === 'in_progress' || p.status === 'planning').length;

    const enRiesgo = projects.filter((p) => {
      const overdue = p.planned_end_date && new Date(p.planned_end_date) < new Date();
      const active = p.status === 'in_progress' || p.status === 'planning';
      return Boolean(overdue && active);
    }).length;

    const projectsWithBudget = projects.filter((p) => (p.budget ?? 0) > 0);

    const margenRealPromedio =
      projectsWithBudget.length > 0
        ? projectsWithBudget.reduce((sum, p) => {
          const total = p.budget ?? 0;
          const cost = p.actual_cost ?? 0;
          const marginPct = total > 0 ? ((total - cost) / total) * 100 : 0;
          return sum + marginPct;
        }, 0) / projectsWithBudget.length
        : 0;

    const facturacionPendiente = projects
      .filter((p) => p.status === 'in_progress' || p.status === 'planning')
      .reduce((sum, p) => sum + ((p.budget ?? 0) - (p.actual_cost ?? 0)), 0);


    return { activos, enRiesgo, margenRealPromedio, facturacionPendiente };
  }, [projects]);


  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.estado.length > 0) count += filters.estado.length;
    if (filters.tipo.length > 0) count += filters.tipo.length;
    if (filters.prioridad.length > 0) count += filters.prioridad.length;
    if (filters.enRiesgo) count += 1;
    if (filters.cliente.trim()) count += 1;
    if (filters.sucursal.length > 0) count += filters.sucursal.length;
    return count;

  }, [filters]);

  const toggleArrayFilter = (key: 'estado' | 'tipo' | 'prioridad' | 'sucursal', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      estado: [],
      tipo: [],
      prioridad: [],
      enRiesgo: false,
      cliente: '',
      sucursal: [],
    });
  };


  const isOverdue = (date: string | null) => {

    if (!date) return false;
    return new Date(date) < new Date();
  };

  const calculateMarginData = (p: ProjectRow) => {
    const total = p.budget ?? 0;
    const cost = p.actual_cost ?? 0;

    const margenReal = total - cost;
    const margenRealPct = total > 0 ? (margenReal / total) * 100 : 0;

    // no existe margen_estimado en schema; mantenemos estimado=0 hasta que haya campo real
    const margenEstimado = 0;
    const margenEstimadoPct = 0;

    const deltaMargen = margenReal - margenEstimado;
    const deltaMargenPct = margenRealPct - margenEstimadoPct;

    return { margenReal, margenRealPct, margenEstimado, margenEstimadoPct, deltaMargen, deltaMargenPct };
  };

  const getStatusBadge = (status: string | null) => {
    const config: Record<
      string,
      { label: string; className: string }
    > = {
      planning: { label: t('status.planning'), className: 'bg-muted text-foreground border-border' },
      in_progress: { label: t('status.inProgress'), className: 'bg-primary/10 text-foreground border-border' },
      on_hold: { label: t('status.onHold'), className: 'bg-warning/10 text-foreground border-border' },
      completed: { label: t('status.completed'), className: 'bg-success/10 text-foreground border-border' },
      cancelled: { label: t('status.cancelled'), className: 'bg-destructive/10 text-foreground border-border' },
    };

    const fallback = { label: t('status.planning'), className: 'bg-muted text-foreground border-border' };
    const { label, className } = (status && config[status]) || fallback;

    return (

      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const getTipoBadge = (type: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      new_construction: { label: t('type.newConstruction'), className: 'bg-accent text-accent-foreground border-border' },
      renovation: { label: t('type.renovation'), className: 'bg-secondary text-secondary-foreground border-border' },
      maintenance: { label: t('type.maintenance'), className: 'bg-muted text-foreground border-border' },
      repair: { label: t('type.repair'), className: 'bg-accent text-accent-foreground border-border' },
    };

    const fallback = { label: t('type.newConstruction'), className: 'bg-accent text-accent-foreground border-border' };
    const { label, className } = (type && config[type]) || fallback;


    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const getPriorityBadge = (prioridad: string) => {
    // schema projects no tiene prioridad; se deja placeholder semántico
    const config: Record<string, { label: string; className: string }> = {
      high: { label: t('priority.high'), className: 'bg-destructive/10 text-foreground border-border' },
      medium: { label: t('priority.medium'), className: 'bg-warning/10 text-foreground border-border' },
      low: { label: t('priority.low'), className: 'bg-muted text-foreground border-border' },
    };

    const fallback = { label: t('priority.medium'), className: 'bg-muted text-foreground border-border' };
    const { label, className } = config[prioridad] || fallback;

    return (
      <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const handleEditProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    toast.info(t('toasts.openEdit'));
    onEditProject?.(projectId);
  };

  const handleOpenInGantt = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (onOpenGantt) {
      onOpenGantt(projectId);
      toast.success(t('toasts.openGantt'));
    } else {

      toast.info(t('toasts.ganttProject'), { description: projectId });
    }
  };

  const handleTogglePauseProject = async (e: React.MouseEvent, project: ProjectRow) => {
    e.stopPropagation();

    try {
      // mapping: "pausado" no existe en schema; usamos on_hold <-> in_progress
      const newStatus = project.status === 'on_hold' ? 'in_progress' : 'on_hold';
      await updateProject(project.id, { status: newStatus });

      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)));

      toast.success(newStatus === 'on_hold' ? t('toasts.paused') : t('toasts.resumed'), {

        description: project.name,
      });
    } catch (error) {

      console.error('Error updating project status:', error);
      toast.error(t('errors.updateStatus'));
    }

  };


  const handleCancelProject = async (e: React.MouseEvent, project: ProjectRow) => {
    e.stopPropagation();

    const confirmed = window.confirm(t('confirm.cancel', { name: project.name }));
    if (!confirmed) return;

    try {
      await updateProject(project.id, { status: 'cancelled' });

      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: 'cancelled' } : p)));

      toast.success(t('toasts.cancelled'), { description: project.name });
    } catch (error) {

      console.error('Error cancelling project:', error);
      toast.error(t('errors.cancel'));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-450 px-8 py-8">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-5">
                <div className="mb-3 h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-muted/60" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-450 px-8 py-8">
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-medium text-muted-foreground">{t('kpis.activeProjects')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Play className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-foreground">{kpis.activos}</div>

          <p className="mt-1 text-xs text-muted-foreground">{t('kpis.activeProjectsDescription')}</p>
        </div>


        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('kpis.atRisk')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-destructive">{kpis.enRiesgo}</div>
          <p className="mt-1 text-xs text-muted-foreground">{t('kpis.atRiskDescription')}</p>

        </div>

        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('kpis.avgRealMargin')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-success">{kpis.margenRealPromedio.toFixed(1)}%</div>

          <p className="mt-1 text-xs text-muted-foreground">{t('kpis.allProjectsLabel')}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('kpis.pendingInvoicing')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {t('currencyOptions.eur', { value: kpis.facturacionPendiente.toLocaleString('es-CO') })}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('kpis.activeProjectsLabel')}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}

            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('filters.title')}
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-semibold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button className="gap-2" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            {t('actions.newProject')}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">{t('filters.status')}</label>
                <div className="space-y-2">
                  {[
                    { value: 'planning', label: t('status.planning') },
                    { value: 'in_progress', label: t('status.inProgress') },
                    { value: 'on_hold', label: t('status.onHold') },
                    { value: 'completed', label: t('status.completed') },
                    { value: 'cancelled', label: t('status.cancelled') },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.estado.includes(option.value)}
                        onChange={() => toggleArrayFilter('estado', option.value)}
                        className="h-4 w-4 rounded border-border bg-input-background text-primary focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}

                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">{t('filters.type')}</label>
                <div className="space-y-2">
                  {[
                    { value: 'new_construction', label: t('type.newConstruction') },
                    { value: 'renovation', label: t('type.renovation') },
                    { value: 'maintenance', label: t('type.maintenance') },
                    { value: 'repair', label: t('type.repair') },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"

                        checked={filters.tipo.includes(option.value)}
                        onChange={() => toggleArrayFilter('tipo', option.value)}
                        className="h-4 w-4 rounded border-border bg-input-background text-primary focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-foreground">{t('filters.priority')}</label>
                <div className="mb-4 space-y-2">
                  {[
                    { value: 'high', label: t('priority.high') },
                    { value: 'medium', label: t('priority.medium') },
                    { value: 'low', label: t('priority.low') },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.prioridad.includes(option.value)}
                        onChange={() => toggleArrayFilter('prioridad', option.value)}

                        className="h-4 w-4 rounded border-border bg-input-background text-primary focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>


                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-destructive/10 p-3">
                  <input
                    type="checkbox"
                    checked={filters.enRiesgo}

                    onChange={(e) => handleFilterChange('enRiesgo', e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-input-background text-destructive focus:ring-ring"
                  />
                  <span className="text-sm font-medium text-foreground">{t('filters.onlyAtRisk')}</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">
                {t('filters.count', { shown: filteredProjects.length, total: projects.length })}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                {t('actions.clearFilters')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {(searchQuery || activeFilterCount > 0) && (
        <div className="mb-4 text-sm text-muted-foreground">
          {t('filters.count', { shown: filteredProjects.length, total: projects.length })}
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">{t('empty.title')}</h3>
          <p className="mb-6 text-muted-foreground">

            {activeFilterCount > 0 || searchQuery ? t('empty.withFilters') : t('empty.noProjects')}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={handleClearFilters} className="mr-3">
              {t('actions.clearFilters')}
            </Button>
          )}
          <Button onClick={onCreateProject}>{t('actions.createFirst')}</Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-30">{t('table.code')}</TableHead>
                  <TableHead className="min-w-55">{t('table.project')}</TableHead>
                  <TableHead className="w-42.5">{t('table.type')}</TableHead>
                  <TableHead className="w-55">{t('table.customer')}</TableHead>
                  <TableHead className="w-35">{t('table.status')}</TableHead>
                  <TableHead className="w-35">{t('table.plannedEnd')}</TableHead>
                  <TableHead className="w-40">{t('table.progress')}</TableHead>
                  <TableHead className="w-35 text-right">{t('table.total')}</TableHead>
                  <TableHead className="w-35 text-right">{t('table.realCost')}</TableHead>
                  <TableHead className="w-35 text-right">{t('table.estimatedMargin')}</TableHead>
                  <TableHead className="w-35 text-right">{t('table.realMargin')}</TableHead>
                  <TableHead className="w-35 text-right">{t('table.deltaMargin')}</TableHead>
                  <TableHead className="w-14" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProjects.map((project) => {
                  const margin = calculateMarginData(project);
                  const overdue = isOverdue(project.planned_end_date);
                  const isPaused = project.status === 'on_hold';

                  return (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => onViewProject(project.id)}
                    >

                      <TableCell className="font-mono text-xs text-muted-foreground">{project.project_number}</TableCell>

                      <TableCell>
                        <div>
                          <div className="mb-1 font-medium text-foreground">{project.name}</div>
                          <div className="flex items-center gap-1.5">{getPriorityBadge('medium')}</div>
                        </div>
                      </TableCell>

                      <TableCell>{getTipoBadge(project.project_type)}</TableCell>

                      <TableCell className="text-sm text-foreground">{project.customer_name || tc('dash')}</TableCell>

                      <TableCell>{getStatusBadge(project.status)}</TableCell>

                      <TableCell>
                        {project.planned_end_date ? (
                          <div className="flex items-center gap-1.5">

                            <span
                              className={`text-sm ${overdue ? 'font-medium text-destructive' : 'text-foreground'
                                }`}
                            >

                              {new Date(project.planned_end_date).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>

                            {overdue && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{tc('dash')}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-15 flex-1 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: `${project.progress_percent || 0}%` }}
                            />
                          </div>
                          <span className="min-w-8.75 text-right text-sm font-medium text-muted-foreground">
                            {project.progress_percent || 0}%
                          </span>

                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-foreground">
                          {t('currency.eur', { value: (project.budget || 0).toLocaleString('es-CO') })}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-warning">
                          {t('currency.eur', { value: (project.actual_cost || 0).toLocaleString('es-CO') })}

                        </span>
                      </TableCell>


                      <TableCell className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {t('currency.eur', { value: (margin.margenEstimado || 0).toLocaleString('es-CO') })}
                        </div>
                        <div className="text-xs text-muted-foreground">{margin.margenEstimadoPct.toFixed(1)}%</div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className={`text-sm font-medium ${margin.margenReal >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {t('currency.eur', { value: margin.margenReal.toLocaleString('es-CO') })}
                        </div>
                        <div className={`text-xs ${margin.margenRealPct >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {margin.margenRealPct.toFixed(1)}%
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">

                          {margin.deltaMargen >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <div>

                            <div
                              className={`text-sm font-medium ${margin.deltaMargen >= 0 ? 'text-success' : 'text-destructive'
                                }`}
                            >
                              {margin.deltaMargen >= 0 ? '+' : ''}
                              {t('currency.eur', { value: margin.deltaMargen.toLocaleString('es-CO') })}
                            </div>
                            <div
                              className={`text-xs ${margin.deltaMargenPct >= 0 ? 'text-success' : 'text-destructive'
                                }`}
                            >
                              {margin.deltaMargenPct >= 0 ? '+' : ''}

                              {margin.deltaMargenPct.toFixed(1)}%
                            </div>
                          </div>

                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewProject(project.id);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {t('actions.view')}
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={(e) => handleEditProject(e, project.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('actions.edit')}

                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={(e) => handleOpenInGantt(e, project.id)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {t('actions.openGantt')}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={(e) => handleTogglePauseProject(e, project)}>
                              {isPaused ? (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  {t('actions.resume')}
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  {t('actions.pause')}
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => handleCancelProject(e, project)}
                              className="text-destructive"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {tc('cancel')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>

                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
