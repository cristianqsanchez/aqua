'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { getOpportunity, updateOpportunity } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Opportunity } from '../actions';

interface EditOpportunityProps {
  opportunityId: string;
  onBack: () => void;
}

type AccountOption = {
  id: string;
  account_name: string | null;
  account_number: string | null;
};

export function EditOpportunity({ opportunityId, onBack }: EditOpportunityProps) {
  const t = useTranslations('opportunities.edit');
  const [isPending, startTransition] = useTransition();
  const [loadingData, setLoadingData] = useState(true);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [formData, setFormData] = useState({
    opportunityName: '',
    accountId: '',
    stage: 'prospecting',
    amount: '',
    probability: '10',
    expectedCloseDate: '',
    actualCloseDate: '',
    leadSource: '',
    nextStep: '',
    description: '',
  });

  const stageProbability = useMemo<Record<string, string>>(
    () => ({
      prospecting: '10',
      qualification: '25',
      proposal: '50',
      negotiation: '75',
      closed_won: '100',
      closed_lost: '0',
    }),
    []
  );

  useEffect(() => {
    let active = true;

    const loadOpportunityData = async () => {
      try {
        setLoadingData(true);
        const opportunity = await getOpportunity(opportunityId);

        if (!opportunity) {
          toast.error(t('toasts.loadError'));
          return;
        }

        if (!active) return;

        setFormData({
          opportunityName: opportunity.opportunity_name ?? '',
          accountId: opportunity.account_id ?? '',
          stage: opportunity.stage ?? 'prospecting',
          amount: opportunity.amount != null ? String(opportunity.amount) : '',
          probability: opportunity.probability != null ? String(opportunity.probability) : '10',
          expectedCloseDate: opportunity.expected_close_date ?? '',
          actualCloseDate: opportunity.actual_close_date ?? '',
          leadSource: opportunity.lead_source ?? '',
          nextStep: opportunity.next_step ?? '',
          description: opportunity.description ?? '',
        });
      } catch (error) {
        console.error('Error loading opportunity:', error);
        toast.error(t('toasts.loadError'));
      } finally {
        if (active) setLoadingData(false);
      }
    };

    const loadAccounts = async () => {
      const supabase = createClient();

      try {
        setLoadingAccounts(true);

        const { data, error } = await supabase
          .from('accounts')
          .select('id,account_name,account_number')
          .eq('tenant_id', '10d50f3f-b1b6-4230-b229-37bec3e39ada')
          .order('account_name', { ascending: true });

        if (error) throw error;

        if (!active) return;
        setAccounts((data ?? []) as AccountOption[]);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        if (active) setLoadingAccounts(false);
      }
    };

    loadOpportunityData();
    loadAccounts();

    return () => {
      active = false;
    };
  }, [opportunityId]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (value: string) => {
    setFormData((prev) => {
      const next: typeof prev = {
        ...prev,
        stage: value,
        probability: stageProbability[value] ?? prev.probability,
      };

      const isClosed = value === 'closed_won' || value === 'closed_lost';
      if (isClosed && !prev.actualCloseDate) {
        const today = new Date().toISOString().split('T')[0] ?? '';
        next.actualCloseDate = today;
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('opportunityName', formData.opportunityName);
    formDataToSubmit.append('accountId', formData.accountId);
    formDataToSubmit.append('stage', formData.stage);
    formDataToSubmit.append('amount', formData.amount);
    formDataToSubmit.append('probability', formData.probability);
    formDataToSubmit.append('expectedCloseDate', formData.expectedCloseDate);
    formDataToSubmit.append('actualCloseDate', formData.actualCloseDate);
    formDataToSubmit.append('leadSource', formData.leadSource);
    formDataToSubmit.append('nextStep', formData.nextStep);
    formDataToSubmit.append('description', formData.description);

    startTransition(async () => {
      const result = await updateOpportunity(opportunityId, formDataToSubmit);

      if (result.success) {
        toast.success(t('toasts.updated'));
        onBack();
      } else {
        toast.error(result.error || t('toasts.updateError'));
      }
    });
  };

  const probabilityNumber = Math.max(0, Math.min(100, Number.parseInt(formData.probability || '0', 10) || 0));

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('actions.back')}
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('sections.basic.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="opportunityName">{t('fields.opportunityName.label')}</Label>
                <Input
                  id="opportunityName"
                  placeholder={t('fields.opportunityName.placeholder')}
                  required
                  value={formData.opportunityName}
                  onChange={(e) => handleChange('opportunityName', e.target.value)}
                  className="bg-input-background border-border focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountId">{t('fields.accountId.label')}</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => handleChange('accountId', value)}
                  disabled={loadingAccounts}
                >
                  <SelectTrigger id="accountId" className="bg-input-background border-border">
                    <SelectValue placeholder={loadingAccounts ? t('placeholders.loading') : t('placeholders.selectAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name ?? '-'} {account.account_number ? `(${account.account_number})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t('hints.accountOptional')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadSource">{t('fields.leadSource.label')}</Label>
                <Select value={formData.leadSource} onValueChange={(value) => handleChange('leadSource', value)}>
                  <SelectTrigger id="leadSource" className="bg-input-background border-border">
                    <SelectValue placeholder={t('placeholders.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">{t('leadSource.website')}</SelectItem>
                    <SelectItem value="referral">{t('leadSource.referral')}</SelectItem>
                    <SelectItem value="cold_call">{t('leadSource.cold_call')}</SelectItem>
                    <SelectItem value="social_media">{t('leadSource.social_media')}</SelectItem>
                    <SelectItem value="advertisement">{t('leadSource.advertisement')}</SelectItem>
                    <SelectItem value="trade_show">{t('leadSource.trade_show')}</SelectItem>
                    <SelectItem value="partner">{t('leadSource.partner')}</SelectItem>
                    <SelectItem value="other">{t('leadSource.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description.label')}</Label>
              <Textarea
                id="description"
                placeholder={t('fields.description.placeholder')}
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="bg-input-background border-border focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('sections.sales.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">{t('fields.stage.label')}</Label>
                <Select value={formData.stage} onValueChange={handleStageChange}>
                  <SelectTrigger id="stage" className="bg-input-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecting">{t('stage.prospecting')}</SelectItem>
                    <SelectItem value="qualification">{t('stage.qualification')}</SelectItem>
                    <SelectItem value="proposal">{t('stage.proposal')}</SelectItem>
                    <SelectItem value="negotiation">{t('stage.negotiation')}</SelectItem>
                    <SelectItem value="closed_won">{t('stage.closed_won')}</SelectItem>
                    <SelectItem value="closed_lost">{t('stage.closed_lost')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('fields.amount.label')}</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={t('fields.amount.placeholder')}
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="bg-input-background border-border focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">{t('fields.probability.label')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => handleChange('probability', e.target.value)}
                    className="bg-input-background border-border focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">{t('fields.expectedCloseDate.label')}</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                  className="bg-input-background border-border focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualCloseDate">{t('fields.actualCloseDate.label')}</Label>
                <Input
                  id="actualCloseDate"
                  type="date"
                  value={formData.actualCloseDate}
                  onChange={(e) => handleChange('actualCloseDate', e.target.value)}
                  className="bg-input-background border-border focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">{t('hints.actualCloseDate')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextStep">{t('fields.nextStep.label')}</Label>
              <Input
                id="nextStep"
                placeholder={t('fields.nextStep.placeholder')}
                value={formData.nextStep}
                onChange={(e) => handleChange('nextStep', e.target.value)}
                className="bg-input-background border-border focus-visible:ring-ring"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{t('visualProbability.title')}</span>
                <span className="text-sm text-muted-foreground">{probabilityNumber}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${probabilityNumber}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
            {isPending ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
