'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { createProject } from '../actions';
import { ClientSelector } from './client-selector';
import { BranchSelector } from './branch-selector';

interface CreateProjectProps {
  onBack: () => void;
  onSuccess?: () => void;
}

type FormData = {
  name: string;

  clientId: string;
  projectType: 'new_construction' | 'renovation' | 'maintenance' | 'repair';
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  budget: string;
  currency: string;

  startDate: string;
  endDate: string;

  branchId: string;

  description: string;
  address: string;

};

export function CreateProject({ onBack, onSuccess }: CreateProjectProps) {
  const t = useTranslations('projects');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    clientId: '',
    projectType: 'new_construction',
    status: 'planning',
    budget: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    branchId: '',
    description: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencyOptions = useMemo(
    () => [
      { value: 'USD', label: t('currencyOptions.usd') },
      { value: 'EUR', label: t('currencyOptions.eur') },
      { value: 'GBP', label: t('currencyOptions.gbp') },
      { value: 'CHF', label: t('currencyOptions.chf') },
    ],
    [t],
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.clientId) newErrors.clientId = t('validation.clientRequired');
    if (!formData.projectType) newErrors.projectType = t('validation.typeRequired');

    const budgetNum = Number(formData.budget);
    if (!formData.budget || Number.isNaN(budgetNum) || budgetNum <= 0) newErrors.budget = t('validation.budgetRequired');

    if (!formData.startDate) newErrors.startDate = t('validation.startDateRequired');
    if (!formData.branchId) newErrors.branchId = t('validation.branchRequired');

    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = t('validation.endDateAfterStart');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('validation.requiredToast'));
      return;
    }

    try {
      setLoading(true);

      await createProject({

        name: formData.name.trim(),
        customer_id: formData.clientId,

        project_type: formData.projectType,
        status: formData.status,
        start_date: formData.startDate || null,
        planned_end_date: formData.endDate || null,
        branch_id: formData.branchId || null,
        site_address: formData.address.trim() || null,
        description: formData.description.trim() || null,
        currency_code: formData.currency,
        budget: Number(formData.budget),
      });

      toast.success(t('toasts.created'));
      onSuccess ? onSuccess() : onBack();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating project:', error);
      toast.error(t('errors.create'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">

        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('actions.backToList')}
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('create.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('create.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('create.basicInformation')}</CardTitle>
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
                  value={formData.clientId}
                  onValueChange={(id) => {
                    handleChange('clientId', id);
                  }}
                  placeholder={t('placeholders.client')}

                  error={Boolean(errors.clientId)}
                  required
                />
                {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
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
                <Label className="text-foreground">{t('fields.status')}</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="text-foreground">
                  {t('fields.budget')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="budget"
                  type="number"

                  min="0"
                  step="0.01"
                  placeholder={t('placeholders.budget')}
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
                    {currencyOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
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

                <Label htmlFor="endDate" className="text-foreground">
                  {t('fields.endDate')}
                </Label>
                <Input
                  id="endDate"
                  type="date"

                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  min={formData.startDate}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>

              <div className="space-y-2">

                <Label className="text-foreground">
                  {t('fields.branch')} <span className="text-destructive">*</span>
                </Label>
                <BranchSelector
                  value={formData.branchId}
                  onValueChange={(id) => handleChange('branchId', id)}
                  placeholder={t('placeholders.branch')}
                  error={Boolean(errors.branchId)}

                  required
                />
                {errors.branchId && <p className="text-xs text-destructive">{errors.branchId}</p>}
              </div>


              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-foreground">
                  {t('fields.address')}
                </Label>

                <Input
                  id="address"
                  placeholder={t('placeholders.address')}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-foreground">
                  {t('fields.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('placeholders.description')}
                  rows={4}
                  value={formData.description}

                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>
            </div>
          </CardContent>

        </Card>


        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('create.creating') : t('create.createButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}
