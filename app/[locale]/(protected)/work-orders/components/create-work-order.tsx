'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,

  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { createWorkOrder, getActiveProjects } from '../actions';


interface CreateWorkOrderProps {
  onBack: () => void;
}


type ProjectOption = {
  id: string;
  project_number: string;
  name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
};

type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export function CreateWorkOrder({ onBack }: CreateWorkOrderProps) {
  const t = useTranslations('workOrders');

  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const [formData, setFormData] = useState({
    project_id: '',
    type_id: '',
    title: '',
    description: '',
    priority: 'normal' as WorkOrderPriority,
    planned_start_at: '',
    planned_end_at: '',

    location_address: '',
    location_notes: '',
  });

  const WORK_ORDER_TYPES = useMemo(
    () => [

      { id: 'excavacion', name: t('types.excavation') },
      { id: 'losa', name: t('types.foundationSlab') },
      { id: 'estructura', name: t('types.structure') },
      { id: 'hidraulica', name: t('types.hydraulicInstallation') },
      { id: 'filtracion', name: t('types.filtrationSystem') },
      { id: 'electricidad', name: t('types.electricalInstallation') },
      { id: 'revestimiento', name: t('types.coating') },
      { id: 'liner', name: t('types.linerInstallation') },
      { id: 'escalera', name: t('types.stairInstallation') },
      { id: 'terminaciones', name: t('types.finishing') },
      { id: 'puesta_marcha', name: t('types.commissioning') },
      { id: 'visita_tecnica', name: t('types.technicalVisit') },

      { id: 'mantenimiento', name: t('types.maintenance') },
      { id: 'reparacion', name: t('types.repair') },
    ],
    [t]
  );

  useEffect(() => {
    let cancelled = false;

        console.log('DEBUG CLIENT')
    const run = async () => {
      setProjectsLoading(true);
      const res = await getActiveProjects();
      if (cancelled) return;

      if (!res.ok) {
        setProjects([]);
        setProjectsLoading(false);
        toast.error(res.error);
        return;
      }

      setProjects(res.data);
      setProjectsLoading(false);
    };

    run();


    return () => {
      cancelled = true;
    };

  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const selectedTypeName =
    WORK_ORDER_TYPES.find((x) => x.id === formData.type_id)?.name ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.project_id || !formData.type_id || !formData.title.trim()) {
      toast.error(t('errors.completeAllFields'));
      return;
    }

    try {
      setLoading(true);

      const res = await createWorkOrder({
        project_id: formData.project_id,
        title: formData.title.trim(),
        type_name: selectedTypeName,
        priority: formData.priority,
        planned_date: formData.planned_start_at || null,
        // Extra fields persisted in kv_store (no hardcoded schema changes)
        extras: {
          description: formData.description || null,
          planned_end_at: formData.planned_end_at || null,
          location_address: formData.location_address || null,
          location_notes: formData.location_notes || null,
        },
      });


      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(t('toasts.created'));
      onBack();
    } catch (error) {

      console.error(error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} aria-label={t('common.back')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('new.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('new.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('sections.basicInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project_id" className="text-foreground">
                  {t('fields.project')}{' '}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </Label>

                <Select
                  value={formData.project_id}
                  onValueChange={(value) => handleChange('project_id', value)}
                  disabled={projectsLoading}
                >

                  <SelectTrigger id="project_id" title={t('fields.project')}>
                    <SelectValue placeholder={projectsLoading ? t('common.loading') : t('placeholders.selectProject')} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_number} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type_id" className="text-foreground">
                  {t('fields.workType')}{' '}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </Label>

                <Select value={formData.type_id} onValueChange={(value) => handleChange('type_id', value)}>
                  <SelectTrigger id="type_id" title={t('fields.workType')}>
                    <SelectValue placeholder={t('placeholders.selectWorkType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_ORDER_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                {t('fields.title')}{' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={t('placeholders.title')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                {t('fields.description')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('placeholders.description')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-foreground">
                {t('fields.priority')}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value as WorkOrderPriority)}
              >
                <SelectTrigger id="priority" title={t('fields.priority')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('priority.low')}</SelectItem>
                  <SelectItem value="normal">{t('priority.normal')}</SelectItem>
                  <SelectItem value="high">{t('priority.high')}</SelectItem>
                  <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('sections.schedule')}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planned_start_at" className="text-foreground">

                  {t('fields.plannedStart')}
                </Label>
                <Input
                  id="planned_start_at"
                  type="date"
                  value={formData.planned_start_at}

                  onChange={(e) => handleChange('planned_start_at', e.target.value)}
                />

              </div>

              <div className="space-y-2">
                <Label htmlFor="planned_end_at" className="text-foreground">
                  {t('fields.plannedEnd')}
                </Label>
                <Input
                  id="planned_end_at"
                  type="date"
                  value={formData.planned_end_at}
                  onChange={(e) => handleChange('planned_end_at', e.target.value)}
                />
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('sections.location')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location_address" className="text-foreground">
                {t('fields.locationAddress')}
              </Label>
              <Input
                id="location_address"
                value={formData.location_address}
                onChange={(e) => handleChange('location_address', e.target.value)}
                placeholder={t('placeholders.locationAddress')}
              />

            </div>

            <div className="space-y-2">
              <Label htmlFor="location_notes" className="text-foreground">

                {t('fields.locationNotes')}
              </Label>
              <Textarea
                id="location_notes"
                value={formData.location_notes}
                onChange={(e) => handleChange('location_notes', e.target.value)}
                placeholder={t('placeholders.locationNotes')}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading || projectsLoading}>
            {loading ? t('common.saving') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}
