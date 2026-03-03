'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ClientSelector } from './client-selector';
import { BranchSelector } from './branch-selector';
import { getProjectForEdit, updateProjectForEdit } from '../actions';

interface EditProjectProps {
  projectId: string;
  onBack: () => void;
  onSuccess?: () => void;

}

type FormData = {
  name: string;
  projectNumber: string;

  customerId: string;

  projectType: 'new_construction' | 'renovation' | 'maintenance' | 'repair' | '';
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | '';

  budget: string;
  currency: string;

  startDate: string;
  plannedEndDate: string;

  branchId: string;

  description: string;
  siteAddress: string;
  progressPercent: string;
};

export function EditProject({ projectId, onBack, onSuccess }: EditProjectProps) {
  const t = useTranslations('projects');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    projectNumber: '',
    customerId: '',
    projectType: '',
    status: '',
    budget: '0',
    currency: 'USD',
    startDate: '',
    plannedEndDate: '',
    branchId: '',
    description: '',

    siteAddress: '',
    progressPercent: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    void loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoadingProject(true);
      const p = await getProjectForEdit(projectId);

      setFormData({

        name: p.name ?? '',
        projectNumber: p.project_number ?? '',
        customerId: p.customer_id ?? '',
        projectType: (p.project_type ?? '') as any,
        status: (p.status ?? '') as any,
        budget: (p.budget ?? 0).toString(),
        currency: p.currency_code ?? 'USD',
        startDate: p.start_date ?? '',
        plannedEndDate: p.planned_end_date ?? '',
        branchId: p.branch_id ?? '',
        description: p.description ?? '',
        siteAddress: p.site_address ?? '',
        progressPercent: (p.progress_percent ?? 0).toString(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading project:', error);
      toast.error(t('errors.load'));

      onBack();
    } finally {
      setLoadingProject(false);
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.customerId) newErrors.customerId = t('validation.clientRequired');
    if (!formData.projectType) newErrors.projectType = t('validation.typeRequired');
    if (!formData.status) newErrors.status = t('validation.statusRequired');

    const budgetNum = Number(formData.budget);
    if (Number.isNaN(budgetNum) || budgetNum < 0) newErrors.budget = t('validation.budgetPositive');

    const progressNum = Number(formData.progressPercent);
    if (Number.isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      newErrors.progressPercent = t('validation.progressRange');
    }

    if (!formData.startDate) newErrors.startDate = t('validation.startDateRequired');

    if (formData.plannedEndDate && formData.startDate) {
      if (new Date(formData.plannedEndDate) < new Date(formData.startDate)) {
        newErrors.plannedEndDate = t('validation.endDateAfterStart');
      }

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const canSubmit = useMemo(() => !loading && !loadingProject, [loading, loadingProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('validation.requiredToast'));
      return;
    }

    try {
      setLoading(true);

      await updateProjectForEdit(projectId, {

        name: formData.name.trim(),
        customer_id: formData.customerId,
        project_type: formData.projectType as any,
        status: formData.status as any,
        budget: Number(formData.budget),
        currency_code: formData.currency,
        start_date: formData.startDate || null,
        planned_end_date: formData.plannedEndDate || null,
        branch_id: formData.branchId || null,
        description: formData.description.trim() || null,
        site_address: formData.siteAddress.trim() || null,
        progress_percent: Number(formData.progressPercent),
      });

      toast.success(t('toasts.updated'));
      onSuccess ? onSuccess() : onBack();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating project:', error);
      toast.error(t('errors.update'));

    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('actions.backToList')}
          </Button>

          <h1 className="text-2xl font-semibold text-foreground">{t('edit.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('edit.codeLabel')}: <span className="font-mono">{formData.projectNumber || tc('dash')}</span>

          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('edit.basicInformation')}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-foreground">
                    {t('fields.name')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder={t('placeholders.name')}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>


                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t('fields.client')} <span className="text-destructive">*</span>
                  </Label>
                  <ClientSelector
                    value={formData.customerId}
                    onValueChange={(id) => handleChange('customerId', id)}
                    placeholder={t('placeholders.client')}
                    error={Boolean(errors.customerId)}
                    required
                  />
                  {errors.customerId && <p className="text-xs text-destructive">{errors.customerId}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t('fields.type')} <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.projectType} onValueChange={(v) => handleChange('projectType', v)}>
                    <SelectTrigger className={errors.projectType ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('placeholders.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_construction">{t('type.newConstruction')}</SelectItem>
                      <SelectItem value="renovation">{t('type.renovation')}</SelectItem>
                      <SelectItem value="maintenance">{t('type.maintenance')}</SelectItem>
                      <SelectItem value="repair">{t('type.repair')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && <p className="text-xs text-destructive">{errors.projectType}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t('fields.status')} <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('placeholders.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">{t('status.planning')}</SelectItem>
                      <SelectItem value="in_progress">{t('status.inProgress')}</SelectItem>
                      <SelectItem value="on_hold">{t('status.onHold')}</SelectItem>
                      <SelectItem value="completed">{t('status.completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progressPercent" className="text-foreground">
                    {t('fields.progress')} (%)
                  </Label>
                  <Input
                    id="progressPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.progressPercent}
                    onChange={(e) => handleChange('progressPercent', e.target.value)}
                    className={errors.progressPercent ? 'border-destructive' : ''}
                  />
                  {errors.progressPercent && <p className="text-xs text-destructive">{errors.progressPercent}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">{t('fields.branch')}</Label>

                  <BranchSelector
                    value={formData.branchId}
                    onValueChange={(id) => handleChange('branchId', id)}
                    placeholder={t('placeholders.branch')}
                    error={Boolean(errors.branchId)}
                  />
                  {errors.branchId && <p className="text-xs text-destructive">{errors.branchId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-foreground">
                    {t('fields.budget')}
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className={errors.budget ? 'border-destructive' : ''}
                  />
                  {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">{t('fields.currency')}</Label>
                  <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('placeholders.currency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">{t('currencyOptions.usd')}</SelectItem>
                      <SelectItem value="EUR">{t('currencyOptions.eur')}</SelectItem>
                      <SelectItem value="GBP">{t('currencyOptions.gbp')}</SelectItem>
                      <SelectItem value="CHF">{t('currencyOptions.chf')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">
                    {t('fields.startDate')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-destructive' : ''}
                  />
                  {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plannedEndDate" className="text-foreground">
                    {t('fields.endDate')}
                  </Label>
                  <Input
                    id="plannedEndDate"
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={(e) => handleChange('plannedEndDate', e.target.value)}
                    min={formData.startDate}
                    className={errors.plannedEndDate ? 'border-destructive' : ''}
                  />
                  {errors.plannedEndDate && <p className="text-xs text-destructive">{errors.plannedEndDate}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="siteAddress" className="text-foreground">
                    {t('fields.address')}
                  </Label>
                  <Input
                    id="siteAddress"
                    placeholder={t('placeholders.address')}

                    value={formData.siteAddress}
                    onChange={(e) => handleChange('siteAddress', e.target.value)}
                  />
                </div>


                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-foreground">
                    {t('fields.description')}

                  </Label>

                  <Textarea
                    id="description"
                    placeholder={t('placeholders.description')}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>

          </Card>

          <div className="flex items-center justify-end gap-3 pb-8">
            <Button type="button" variant="outline" onClick={onBack} disabled={!canSubmit}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t('edit.updating') : tc('actions.saveChanges')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
