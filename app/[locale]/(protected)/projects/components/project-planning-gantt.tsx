'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { getProjectsForGantt } from '../actions';

type GanttProject = {
  id: string;
  project_number: string | null;
  name: string | null;

  customer_display_name: string | null;

  branch_id: string | null;
  branch_name: string | null;

  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | null;

  start_date: string | null;
  planned_end_date: string | null;

  progress_percent: number | null;

  project_manager_name: string | null;
};

type GanttPhase = {
  id: string;
  name: string;
  startDate: Date;

  endDate: Date;
  status: 'completed' | 'in_progress' | 'pending';
};


export function ProjectPlanningGantt() {
  const t = useTranslations('projects');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {

    try {
      setLoading(true);
      const data = await getProjectsForGantt();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  const branches = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const p of projects) {
      if (p.branch_id) {

        map.set(p.branch_id, { id: p.branch_id, name: p.branch_name ?? tc('dash') });
      }
    }
    return [{ id: 'all', name: t('gantt.allBranches') }, ...Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))];
  }, [projects, t, tc]);

  const filteredProjects = useMemo(() => {
    if (selectedBranchId === 'all') return projects;
    return projects.filter((p) => p.branch_id === selectedBranchId);
  }, [projects, selectedBranchId]);

  const monthStart = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth]
  );
  const monthEnd = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    [currentMonth]
  );


  const daysInMonth = useMemo(() => monthEnd.getDate(), [monthEnd]);
  const monthName = useMemo(
    () =>
      currentMonth.toLocaleDateString('es-CO', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth]
  );

  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const inProgress = filteredProjects.filter((p) => p.status === 'in_progress').length;
    const planning = filteredProjects.filter((p) => p.status === 'planning').length;
    const completed = filteredProjects.filter((p) => p.status === 'completed').length;

    const avgProgress =
      total > 0
        ? Math.round(
            filteredProjects.reduce((sum, p) => sum + (p.progress_percent ?? 0), 0) / total
          )
        : 0;

    const workload = inProgress + planning;
    const workloadPercentage = total > 0 ? Math.round((workload / (total > 5 ? total : 5)) * 100) : 0;

    return { total, inProgress, planning, completed, avgProgress, workload, workloadPercentage };
  }, [filteredProjects]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getStatusLabel = (status: GanttProject['status']) => {
    switch (status) {
      case 'planning':
        return t('status.planning');

      case 'in_progress':
        return t('status.inProgress');
      case 'completed':
        return t('status.completed');
      case 'on_hold':
        return t('status.onHold');
      case 'cancelled':
        return t('status.cancelled');
      default:

        return t('status.planning');
    }
  };

  const getStatusIcon = (status: GanttProject['status']) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-3 w-3" />;
      case 'in_progress':
        return <AlertCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'on_hold':
        return <AlertCircle className="h-3 w-3" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusPillClass = (status: GanttProject['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-muted text-muted-foreground border-border';
      case 'in_progress':
        return 'bg-primary text-primary-foreground border-border';

      case 'completed':
        return 'bg-success text-success-foreground border-border';

      case 'on_hold':
        return 'bg-warning text-warning-foreground border-border';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getBarBaseClass = (status: GanttProject['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-muted';
      case 'in_progress':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'on_hold':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const calculateBarPosition = (startDate: Date, endDate: Date) => {

    if (endDate < monthStart || startDate > monthEnd) return null;

    const visibleStart = startDate < monthStart ? monthStart : startDate;
    const visibleEnd = endDate > monthEnd ? monthEnd : endDate;

    const startDay = visibleStart.getDate();
    const duration =
      Math.ceil((visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leftPercent = ((startDay - 1) / daysInMonth) * 100;
    const widthPercent = (duration / daysInMonth) * 100;

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const buildPhases = (p: GanttProject): GanttPhase[] => {
    const start = p.start_date ? new Date(p.start_date) : null;
    const end = p.planned_end_date ? new Date(p.planned_end_date) : null;

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

    const totalMs = end.getTime() - start.getTime();
    if (totalMs <= 0) return [];

    const p1End = new Date(start.getTime() + totalMs * 0.25);
    const p2End = new Date(start.getTime() + totalMs * 0.6);
    const p3End = end;

    const progress = Math.max(0, Math.min(100, p.progress_percent ?? 0));

    const phaseStatus = (idx: 1 | 2 | 3): GanttPhase['status'] => {
      if (progress >= 100) return 'completed';
      if (progress <= 0) return 'pending';
      if (idx === 1) return progress >= 30 ? 'completed' : 'in_progress';
      if (idx === 2) return progress >= 70 ? 'completed' : progress >= 30 ? 'in_progress' : 'pending';
      return progress >= 70 ? 'in_progress' : 'pending';
    };

    return [
      {
        id: `${p.id}:phase1`,
        name: t('gantt.phases.phase1'),
        startDate: start,
        endDate: p1End,
        status: phaseStatus(1),
      },
      {
        id: `${p.id}:phase2`,
        name: t('gantt.phases.phase2'),
        startDate: new Date(p1End.getTime() + 24 * 60 * 60 * 1000),
        endDate: p2End,
        status: phaseStatus(2),
      },
      {
        id: `${p.id}:phase3`,
        name: t('gantt.phases.phase3'),
        startDate: new Date(p2End.getTime() + 24 * 60 * 60 * 1000),
        endDate: p3End,
        status: phaseStatus(3),
      },
    ].filter((x) => x.endDate >= x.startDate);
  };

  const getPhaseBarClass = (status: GanttPhase['status']) => {
    switch (status) {

      case 'completed':
        return 'bg-success';
      case 'in_progress':

        return 'bg-primary';
      case 'pending':

      default:
        return 'bg-muted';
    }

  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('gantt.filterByBranch')}</span>
          </div>

          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (

                <SelectItem key={b.id} value={b.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />

                    {b.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />

          </Button>

          <div className="flex min-w-[220px] items-center justify-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground capitalize">{monthName}</span>
          </div>

          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('gantt.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('gantt.stats.inProgress')}</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
          </CardContent>
        </Card>


        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('gantt.stats.planning')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.planning}</div>

          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('gantt.stats.completed')}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
          </CardContent>
        </Card>


        <Card className="bg-linear-to-br from-card to-secondary border-border">

          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4" />
              {t('gantt.stats.workload')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.workload}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(stats.workloadPercentage, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{stats.workloadPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {t('gantt.title')}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t('gantt.subtitle')}</p>
        </CardHeader>

        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">{t('gantt.empty')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline header */}
              <div className="flex gap-2">
                <div className="w-[280px] shrink-0" />
                <div className="relative flex-1">
                  <div className="flex border-b border-border pb-2">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <div
                        key={day}
                        className="flex-1 text-center text-xs font-medium text-muted-foreground"
                        style={{ minWidth: '20px' }}

                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {filteredProjects.map((project, index) => {
                const start = project.start_date ? new Date(project.start_date) : null;
                const end = project.planned_end_date ? new Date(project.planned_end_date) : null;

                const canRender = !!start && !!end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());
                const barPosition = canRender ? calculateBarPosition(start!, end!) : null;

                const phases = buildPhases(project);

                return (
                  <div key={project.id}>
                    <div className="flex items-center gap-2">
                      {/* Project info */}
                      <div className="w-[280px] shrink-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`gap-1 border ${getStatusPillClass(project.status)}`}>
                              {getStatusIcon(project.status)}
                              {getStatusLabel(project.status)}
                            </Badge>


                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              {Math.round(project.progress_percent ?? 0)}%
                            </Badge>
                          </div>

                          <p className="truncate text-sm font-medium text-foreground">
                            {project.name ?? tc('dash')}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">

                            <Users className="h-3 w-3" />
                            <span>{project.project_manager_name ?? t('labels.noResponsible')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="relative h-12 flex-1">
                        <div className="absolute inset-0 flex">
                          {Array.from({ length: daysInMonth }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 border-r border-border/40"
                              style={{ minWidth: '20px' }}
                            />
                          ))}
                        </div>

                        {barPosition ? (
                          <div

                            className="absolute top-1/2 flex h-8 -translate-y-1/2 items-center justify-between rounded-md px-3 shadow-sm"
                            style={{ left: barPosition.left, width: barPosition.width }}
                          >
                            <div className={`absolute inset-0 ${getBarBaseClass(project.status)} opacity-90 rounded-md`} />
                            <div

                              className="absolute inset-0 rounded-md bg-card opacity-20"
                              style={{ width: `${Math.max(0, Math.min(100, project.progress_percent ?? 0))}%` }}
                            />


                            <span className="relative z-10 truncate text-xs font-medium text-primary-foreground">
                              {project.customer_display_name ?? tc('dash')}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Phases */}
                    {phases.length > 0 ? (
                      <div className="ml-[280px] mt-2 space-y-1">
                        {phases.map((phase) => {
                          const phaseBar = calculateBarPosition(phase.startDate, phase.endDate);
                          if (!phaseBar) return null;

                          return (
                            <div key={phase.id} className="flex h-6 items-center gap-2">
                              <div className="relative flex-1">
                                <div className="absolute inset-0 flex">
                                  {Array.from({ length: daysInMonth }).map((_, i) => (
                                    <div
                                      key={i}

                                      className="flex-1 border-r border-border/20"

                                      style={{ minWidth: '20px' }}
                                    />
                                  ))}

                                </div>

                                <div
                                  className="absolute top-1/2 flex h-4 -translate-y-1/2 items-center rounded px-2"
                                  style={{ left: phaseBar.left, width: phaseBar.width }}
                                >
                                  <div className={`absolute inset-0 ${getPhaseBarClass(phase.status)} opacity-80 rounded`} />
                                  <span className="relative z-10 truncate text-[10px] font-medium text-primary-foreground">
                                    {phase.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {index < filteredProjects.length - 1 ? <Separator className="my-4" /> : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="text-sm font-medium text-foreground">{t('gantt.legend.status')}</div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <span className="text-xs text-muted-foreground">{t('status.planning')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">{t('status.inProgress')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-success" />
                  <span className="text-xs text-muted-foreground">{t('status.completed')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-warning" />
                  <span className="text-xs text-muted-foreground">{t('status.onHold')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-destructive" />

                  <span className="text-xs text-muted-foreground">{t('status.cancelled')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-sm font-medium text-foreground">{t('gantt.legend.phases')}</div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-success" />
                  <span className="text-xs text-muted-foreground">{t('gantt.phases.completed')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">{t('gantt.phases.inProgress')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <span className="text-xs text-muted-foreground">{t('gantt.phases.pending')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
