'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  CalendarRange,
  Pause,
  Play,
  CheckCircle2,

  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Package,
  DollarSign,
  Folder,

  Clock,
  MapPin,
  User,
  ChevronRight,
  Plus,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getProjectDetail, setProjectStatus } from '../actions';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onEdit?: (projectId: string) => void;
  onOpenGantt?: (projectId: string) => void;
}

type ProjectDetailData = {
  id: string;
  project_number: string | null;
  name: string | null;

  customer_id: string | null;
  customer_display_name: string | null;


  branch_id: string | null;
  branch_name: string | null;

  project_type: 'new_construction' | 'renovation' | 'maintenance' | 'repair' | null;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | null;

  start_date: string | null;
  planned_end_date: string | null;
  actual_end_date: string | null;

  currency_code: string | null;
  budget: number | null;
  actual_cost: number | null;


  progress_percent: number | null;


  description: string | null;
  site_address: string | null;

  project_manager_name: string | null;
};

export function ProjectDetail({ projectId, onBack, onEdit, onOpenGantt }: ProjectDetailProps) {
  const t = useTranslations('projects');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    void loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectDetail(projectId);
      setProject(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading project:', error);
      toast.error(t('errors.load'));
      onBack();
    } finally {
      setLoading(false);
    }
  };


  const handleTogglePause = async () => {
    if (!project) return;

    try {
      const current = project.status;
      const next =
        current === 'on_hold'
          ? 'in_progress'
          : 'on_hold';

      await setProjectStatus(projectId, next);

      setProject((p) => (p ? { ...p, status: next } : p));
      toast.success(next === 'on_hold' ? t('toasts.paused') : t('toasts.resumed'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating project status:', error);
      toast.error(t('errors.updateStatus'));

    }
  };

  const handleCloseProject = async () => {
    if (!project) return;

    const confirmed = window.confirm(t('confirm.closeProject'));
    if (!confirmed) return;

    try {
      await setProjectStatus(projectId, 'completed');
      setProject((p) => (p ? { ...p, status: 'completed' } : p));
      toast.success(t('toasts.closed'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error closing project:', error);
      toast.error(t('errors.close'));
    }
  };

  const metrics = useMemo(() => {

    if (!project) return null;

    const contracted = project.budget ?? 0;
    const actualCost = project.actual_cost ?? 0;

    // we only have budget + actual_cost in schema; estimated margin/cost are not modeled here
    const realMargin = contracted - actualCost;

    const realMarginPct = contracted > 0 ? (realMargin / contracted) * 100 : 0;

    return {
      contracted,
      actualCost,
      realMargin,
      realMarginPct,
    };
  }, [project]);

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amount);

  const formatDate = (date: string | null) => {
    if (!date) return tc('dash');
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusBadge = useMemo(() => {
    const s = project?.status ?? 'planning';

    const labelMap: Record<string, string> = {
      planning: t('status.planning'),
      in_progress: t('status.inProgress'),
      on_hold: t('status.onHold'),
      completed: t('status.completed'),
      cancelled: t('status.cancelled'),
    };

    const classMap: Record<string, string> = {
      planning: 'bg-secondary text-secondary-foreground border-border',
      in_progress: 'bg-success/10 text-foreground border-border',
      on_hold: 'bg-warning/10 text-foreground border-border',
      completed: 'bg-muted text-muted-foreground border-border',
      cancelled: 'bg-destructive/10 text-foreground border-border',
    };

    return { label: labelMap[s] ?? s, className: classMap[s] ?? classMap.planning };
  }, [project?.status, t]);

  const typeLabel = useMemo(() => {
    const pt = project?.project_type ?? null;
    const map: Record<string, string> = {
      new_construction: t('type.newConstruction'),
      renovation: t('type.renovation'),
      maintenance: t('type.maintenance'),
      repair: t('type.repair'),
    };
    return pt ? map[pt] ?? pt : tc('dash');
  }, [project?.project_type, t, tc]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  const canPauseResume = project.status === 'in_progress' || project.status === 'on_hold';
  const canClose = project.status === 'in_progress' || project.status === 'on_hold';

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-400 px-8 py-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={onBack} className="transition-colors hover:text-foreground">
              {t('breadcrumbs.projects')}
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{project.project_number ?? tc('dash')}</span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="truncate text-2xl font-semibold text-foreground">{project.name ?? tc('dash')}</h1>

                <Badge className={`${statusBadge.className} border px-3 py-1 text-sm`}>{statusBadge.label}</Badge>

                <Badge variant="outline" className="px-2 py-1 text-xs text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  {project.branch_name ?? t('labels.noBranch')}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{project.customer_display_name ?? tc('dash')}</span>
                <span>•</span>
                <span>{typeLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit ? (
                <Button onClick={() => onEdit(projectId)} variant="outline" size="sm" className="gap-2">

                  <Edit className="h-4 w-4" />
                  {tc('actions.edit')}
                </Button>
              ) : null}

              {onOpenGantt ? (
                <Button onClick={() => onOpenGantt(projectId)} variant="outline" size="sm" className="gap-2">
                  <CalendarRange className="h-4 w-4" />
                  {t('actions.openInGantt')}
                </Button>
              ) : null}


              {canPauseResume ? (
                <Button onClick={handleTogglePause} variant="outline" size="sm" className="gap-2">
                  {project.status === 'on_hold' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {project.status === 'on_hold' ? t('actions.resume') : t('actions.pause')}
                </Button>
              ) : null}

              {canClose ? (
                <Button onClick={handleCloseProject} variant="outline" size="sm" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />

                  {t('actions.close')}
                </Button>
              ) : null}
            </div>

          </div>
        </div>

      </div>

      {metrics ? (
        <div className="border-b border-border bg-card shadow-sm">
          <div className="mx-auto max-w-400 px-8 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">{t('kpis.contracted')}</div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatCurrency(metrics.contracted, project.currency_code ?? 'USD')}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">{t('kpis.realCost')}</div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatCurrency(metrics.actualCost, project.currency_code ?? 'USD')}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`bg-card ${
                  metrics.realMargin >= 0 ? 'border-success/30' : 'border-destructive/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">{t('kpis.realMargin')}</div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatCurrency(metrics.realMargin, project.currency_code ?? 'USD')}
                  </div>

                  <div
                    className={metrics.realMargin >= 0 ? 'mt-1 flex items-center gap-1 text-xs text-foreground' : 'mt-1 flex items-center gap-1 text-xs text-foreground'}
                  >
                    {metrics.realMargin >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={metrics.realMargin >= 0 ? 'text-success' : 'text-destructive'}>
                      {metrics.realMarginPct.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-400 px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="border border-border bg-card p-1">
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('tabs.summary')}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('tabs.tasks')}
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <Package className="h-4 w-4" />
              {t('tabs.materials')}
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <DollarSign className="h-4 w-4" />
              {t('tabs.finance')}
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <Folder className="h-4 w-4" />
              {t('tabs.documents')}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              {t('tabs.history')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-base text-card-foreground">{t('sections.general')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm md:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.code')}</div>
                        <div className="font-mono text-foreground">{project.project_number ?? tc('dash')}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.type')}</div>
                        <div className="text-foreground">{typeLabel}</div>

                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.client')}</div>
                        <div className="text-foreground">{project.customer_display_name ?? tc('dash')}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.branch')}</div>
                        <div className="text-foreground">{project.branch_name ?? tc('dash')}</div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.location')}</div>
                        <div className="text-foreground">{project.site_address ?? t('labels.noLocation')}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.startDate')}</div>
                        <div className="text-foreground">{formatDate(project.start_date)}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.expectedEnd')}</div>
                        <div className="text-foreground">{formatDate(project.planned_end_date)}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.actualEnd')}</div>
                        <div className="text-foreground">{formatDate(project.actual_end_date)}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.responsible')}</div>
                        <div className="flex items-center gap-2 text-foreground">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {project.project_manager_name ?? t('labels.noResponsible')}
                        </div>
                      </div>
                    </div>

                    {project.description ? (
                      <div className="border-t border-border pt-3">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t('fields.description')}</div>
                        <div className="text-sm text-foreground">{project.description}</div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="bg-card">

                  <CardHeader>
                    <CardTitle className="text-base text-card-foreground">{t('sections.progress')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{t('fields.progress')}</span>
                        <span className="text-2xl font-semibold text-foreground">
                          {project.progress_percent ?? 0}%
                        </span>
                      </div>
                      <Progress value={project.progress_percent ?? 0} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              </div>


              <div className="space-y-6">
                <Card className="border-warning/30 bg-warning/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-foreground">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      {t('sections.risks')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{t('risks.costDeviation.title')}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t('risks.costDeviation.subtitle', {
                            amount: formatCurrency(
                              Math.abs((project.actual_cost ?? 0) - (project.budget ?? 0)),
                              project.currency_code ?? 'USD'
                            ),
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                      <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{t('risks.placeholder.title')}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{t('risks.placeholder.subtitle')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-base text-card-foreground">{t('sections.recentActivity')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[

                        { action: t('activity.placeholder1.action'), time: t('activity.placeholder1.time'), user: t('activity.placeholder1.user') },
                        { action: t('activity.placeholder2.action'), time: t('activity.placeholder2.time'), user: t('activity.placeholder2.user') },
                        { action: t('activity.placeholder3.action'), time: t('activity.placeholder3.time'), user: t('activity.placeholder3.user') },
                      ].map((a, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-foreground">{a.action}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {a.user} • {a.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">{t('tabs.tasks')}</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('actions.newTask')}
                </Button>

              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p>{t('placeholders.tasks.title')}</p>

                  <p className="text-sm">{t('placeholders.tasks.subtitle')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">{t('tabs.materials')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">
                  <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p>{t('placeholders.materials.title')}</p>
                  <p className="text-sm">{t('placeholders.materials.subtitle')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">{t('tabs.finance')}</CardTitle>
              </CardHeader>
              <CardContent>

                <div className="py-12 text-center text-muted-foreground">
                  <DollarSign className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p>{t('placeholders.finance.title')}</p>
                  <p className="text-sm">{t('placeholders.finance.subtitle')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">{t('tabs.documents')}</CardTitle>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('actions.uploadDocument')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">

                  <Folder className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p>{t('placeholders.documents.title')}</p>
                  <p className="text-sm">{t('placeholders.documents.subtitle')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">{t('tabs.history')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p>{t('placeholders.history.title')}</p>
                  <p className="text-sm">{t('placeholders.history.subtitle')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
